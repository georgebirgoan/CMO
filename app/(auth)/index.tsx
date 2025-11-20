import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// fake Google login – replace with your real Google sign-in
const fakeGoogleLogin = async () => {
  return { email: 'google.user@example.com', provider: 'google' };
};

type AuthScreenProps = {
  onAuthSuccess?: (user: { email: string; provider: string; mode?: string }) => void;
};

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = () => {
    setError('');
    if (!email || !password || (!isLogin && !confirm)) {
      setError('Please fill in all fields.');
      return;
    }
    if (!isLogin && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (isLogin) {
        Alert.alert('Logged in', `Logged in as ${email}`);
      } else {
        Alert.alert('Account created', `Account created for ${email}`);
      }
      onAuthSuccess &&
        onAuthSuccess({ email, provider: 'password', mode });
    }, 500);
  };

  const handleGoogle = async () => {
    try {
      const user = await fakeGoogleLogin();
      Alert.alert('Google login', `Logged in as ${user.email}`);
      onAuthSuccess && onAuthSuccess(user);
    } catch (e) {
      Alert.alert('Error', 'Google login failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {isLogin ? 'Welcome back' : 'Create an account'}
        </Text>
        <Text style={styles.subtitle}>
          {isLogin
            ? 'Login to your notes account'
            : 'Sign up to sync and backup your notes'}
        </Text>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#9CA3AF"
        />

        {!isLogin && (
          <>
            <Text style={[styles.label, { marginTop: 12 }]}>
              Confirm password
            </Text>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder="••••••••"
              style={styles.input}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
            />
          </>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[
            styles.primaryBtn,
            loading ? { opacity: 0.7 } : null,
          ]}
        >
          <Text style={styles.primaryText}>
            {loading
              ? isLogin
                ? 'Logging in...'
                : 'Creating account...'
              : isLogin
              ? 'Login'
              : 'Sign up'}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity onPress={handleGoogle} style={styles.googleBtn}>
          <View style={styles.googleIcon}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode(isLogin ? 'signup' : 'login')}
          style={styles.switchMode}
        >
          <Text style={styles.switchModeText}>
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Login'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Notes App • Auth</Text>
      </View>
    </SafeAreaView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 14,
  },
  error: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    color: '#111827',
  },
  primaryBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 18,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 8,
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  googleBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  googleText: {
    color: '#1F2937',
    fontWeight: '500',
  },
  switchMode: {
    marginTop: 14,
  },
  switchModeText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 10,
    color: '#D1D5DB',
  },
});
