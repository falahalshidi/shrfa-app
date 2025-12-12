import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import Logo from '../components/Logo';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('خطأ', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    const success = await login(email, password);
    if (success) {
      // Navigation will happen automatically via AppNavigator
    } else {
      Alert.alert('خطأ', 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Logo size={280} showTagline={true} />
        </View>

        <View style={styles.formCard}>
          <Text style={styles.title}>تسجيل الدخول</Text>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="البريد الإلكتروني"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign="center"
            />
            <TextInput
              style={styles.input}
              placeholder="كلمة المرور"
              placeholderTextColor={colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textAlign="center"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>تسجيل الدخول</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Register' as never)}
          >
            <Text style={styles.linkText}>ليس لديك حساب؟ إنشاء حساب جديد</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 20,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 24,
    backgroundColor: '#000000',
    minHeight: 220,
  },
  formCard: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 25,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  inputGroup: {
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 25,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
});
