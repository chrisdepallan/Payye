import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { spacing } from '../constants/theme';
import { useLogin } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { AuthStackScreenProps } from '../navigation/types';
import { getErrorMessage } from '../services/api';

export function LoginScreen({ navigation }: AuthStackScreenProps<'Login'>) {
  const { palette } = useTheme();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    login.mutate(
      { email: email.trim().toLowerCase(), password },
      { onError: (e) => setError(getErrorMessage(e, 'Login failed')) },
    );
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.flex}>
          <View style={styles.header}>
            <Text style={[styles.brand, { color: palette.primary }]}>Payye</Text>
            <Text style={[styles.tagline, { color: palette.textMuted }]}>
              Read faster, one word at a time.
            </Text>
          </View>

          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          {error ? <Text style={[styles.error, { color: palette.danger }]}>{error}</Text> : null}

          <Button title="Log in" onPress={onSubmit} loading={login.isPending} />

          <Pressable style={styles.link} onPress={() => navigation.navigate('Register')}>
            <Text style={{ color: palette.textMuted }}>
              No account? <Text style={{ color: palette.primary }}>Create one</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  brand: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 15,
    marginTop: spacing.xs,
  },
  error: {
    marginBottom: spacing.sm,
  },
  link: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
});
