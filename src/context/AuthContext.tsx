import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Tables } from '../types/database';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const ADMIN_EMAIL = 'shrfa@gmail.com';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isAdminEmail = (email?: string | null) =>
  email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

// Translate error messages to Arabic
const translateError = (errorMessage: string): string => {
  const lowerError = errorMessage.toLowerCase();
  
  if (lowerError.includes('invalid email') || (lowerError.includes('email address') && lowerError.includes('invalid'))) {
    return 'عنوان البريد الإلكتروني غير صالح';
  }
  if (lowerError.includes('already registered') || lowerError.includes('user already registered') || lowerError.includes('email already exists')) {
    return 'البريد الإلكتروني مستخدم بالفعل';
  }
  if (lowerError.includes('password')) {
    if (lowerError.includes('short') || lowerError.includes('weak')) {
      return 'كلمة المرور ضعيفة جداً';
    }
    return 'كلمة المرور غير صحيحة';
  }
  if (lowerError.includes('user not found')) {
    return 'المستخدم غير موجود';
  }
  
  // Return Arabic version for common errors, otherwise return the original message
  return errorMessage;
};

const getMetadataAdminFlag = (authUser: SupabaseAuthUser): boolean | undefined => {
  const meta = authUser.user_metadata;

  if (typeof meta?.is_admin === 'boolean') {
    return meta.is_admin;
  }

  if (typeof meta?.isAdmin === 'boolean') {
    return meta.isAdmin;
  }

  return undefined;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await syncUser(session.user);
      }

      setLoading(false);
    };

    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        syncUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string): Promise<Tables<'profiles'> | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return (data as Tables<'profiles'> | null) ?? null;
  };

  const createProfile = async (
    authUser: SupabaseAuthUser,
    options?: { name?: string; phone?: string; isAdmin?: boolean }
  ): Promise<Tables<'profiles'>> => {
    const metadataFlag = getMetadataAdminFlag(authUser);
    const isAdminFlag =
      typeof options?.isAdmin === 'boolean'
        ? options.isAdmin
        : metadataFlag ?? isAdminEmail(authUser.email);

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: authUser.id,
          full_name:
            options?.name ||
            (typeof authUser.user_metadata?.full_name === 'string'
              ? authUser.user_metadata.full_name
              : authUser.email || 'مستخدم'),
          phone:
            options?.phone ??
            (typeof authUser.user_metadata?.phone === 'string'
              ? authUser.user_metadata.phone
              : null),
          is_admin: isAdminFlag,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Tables<'profiles'>;
  };

  const ensureAdminFlag = async (
    profile: Tables<'profiles'>,
    authUser: SupabaseAuthUser
  ): Promise<Tables<'profiles'>> => {
    const metadataFlag = getMetadataAdminFlag(authUser);
    const shouldBeAdmin = metadataFlag ?? isAdminEmail(authUser.email);

    if (profile.is_admin || !shouldBeAdmin) {
      return profile;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', authUser.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Tables<'profiles'>;
  };

  const mapUser = (authUser: SupabaseAuthUser, profile: Tables<'profiles'> | null): User => {
    const metadataFlag = getMetadataAdminFlag(authUser);
    const resolvedIsAdmin =
      typeof profile?.is_admin === 'boolean'
        ? profile.is_admin
        : metadataFlag ?? isAdminEmail(authUser.email);

    return {
      id: authUser.id,
      email: authUser.email || '',
      name:
        profile?.full_name ||
        (typeof authUser.user_metadata?.full_name === 'string'
          ? authUser.user_metadata.full_name
          : authUser.email || 'مستخدم'),
      phone: profile?.phone || undefined,
      isAdmin: resolvedIsAdmin,
    };
  };

  const syncUser = async (authUser: SupabaseAuthUser) => {
    try {
      let profile = await fetchProfile(authUser.id);

      if (!profile) {
        profile = await createProfile(authUser);
      }

      profile = await ensureAdminFlag(profile, authUser);

      setUser(mapUser(authUser, profile));
    } catch (error) {
      console.error('Error syncing user', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.user) {
        return false;
      }

      await syncUser(data.user);
      return true;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone || '',
          },
        },
      });

      if (error) {
        // Translate error messages to Arabic
        const translatedError = translateError(error.message || 'حدث خطأ أثناء إنشاء الحساب');
        
        // Check for specific error codes or messages
        if (error.message?.toLowerCase().includes('already registered') || 
            error.message?.toLowerCase().includes('user already registered') ||
            error.code === 'email_exists') {
          return { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' };
        }
        return { success: false, error: translatedError };
      }

      if (!data.user) {
        return { success: false, error: 'حدث خطأ أثناء إنشاء الحساب' };
      }

      // Check if user already exists by checking identities array
      // If identities is empty, it means the email already exists
      if (!data.user.identities || data.user.identities.length === 0) {
        return { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' };
      }

      if (!data.session) {
        await supabase.auth.signInWithPassword({ email, password });
      } else {
        await syncUser(data.user);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error registering:', error);
      // Translate error messages to Arabic
      const errorMessage = error?.message || 'حدث خطأ أثناء إنشاء الحساب';
      const translatedError = translateError(errorMessage);
      
      // Check if it's a duplicate email error
      if (error?.message?.toLowerCase().includes('already') || 
          error?.message?.toLowerCase().includes('exists') ||
          error?.code === 'email_exists') {
        return { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' };
      }
      return { success: false, error: translatedError };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
