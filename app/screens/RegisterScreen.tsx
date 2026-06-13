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
import { useRegister } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { AuthStackScreenProps } from '../navigation/types';
import { getErrorMessage } from '../services/api';

export function RegisterScreen({ navigation }: AuthStackScreenProps<'Register'>) {
  const { palette } = useTheme();
  const register = useRegister();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = () => {
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    register.mutate(
      { name: name.trim(), email: email.trim().toLowerCase(), password },
      { onError: (e) => setError(getErrorMessage(e, 'Registration failed')) },
    );
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.flex}>
          <Text style={[styles.title, { color: palette.text }]}>Create your account</Text>

          <TextField label="Name" value={name} onChangeText={setName} placeholder="Ada Lovelace" />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 6 characters"
          />

          {error ? <Text style={[styles.error, { color: palette.danger }]}>{error}</Text> : null}

          <Button title="Sign up" onPress={onSubmit} loading={register.isPending} />

          <Pressable style={styles.link} onPress={() => navigation.goBack()}>
            <Text style={{ color: palette.textMuted }}>
              Already have an account? <Text style={{ color: palette.primary }}>Log in</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  error: {
    marginBottom: spacing.sm,
  },
  link: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
});
