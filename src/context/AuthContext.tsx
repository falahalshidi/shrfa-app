import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Tables } from '../types/database';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const ADMIN_EMAIL = 'shrfa@gmail.com';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isAdminEmail = (email?: string | null) =>
  email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

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
          is_admin: options?.isAdmin ?? isAdminEmail(authUser.email),
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
    if (profile.is_admin || !isAdminEmail(authUser.email)) {
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

  const mapUser = (authUser: SupabaseAuthUser, profile: Tables<'profiles'> | null): User => ({
    id: authUser.id,
    email: authUser.email || '',
    name:
      profile?.full_name ||
      (typeof authUser.user_metadata?.full_name === 'string'
        ? authUser.user_metadata.full_name
        : authUser.email || 'مستخدم'),
    phone: profile?.phone || undefined,
    isAdmin: Boolean(profile?.is_admin || isAdminEmail(authUser.email)),
  });

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
  ): Promise<boolean> => {
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

      if (error || !data.user) {
        return false;
      }

      if (!data.session) {
        await supabase.auth.signInWithPassword({ email, password });
      } else {
        await syncUser(data.user);
      }

      return true;
    } catch (error) {
      console.error('Error registering:', error);
      return false;
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
