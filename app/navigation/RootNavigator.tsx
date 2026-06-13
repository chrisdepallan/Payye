import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { NewSessionScreen } from '../screens/NewSessionScreen';
import { ReaderScreen } from '../screens/ReaderScreen';
import { AppTabs } from './AppTabs';
import { AuthStack } from './AuthStack';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const token = useAuthStore((s) => s.token);
  const { palette } = useTheme();

  if (!token) {
    return <AuthStack />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.surface },
        headerTintColor: palette.text,
        contentStyle: { backgroundColor: palette.background },
      }}
    >
      <Stack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="NewSession"
        component={NewSessionScreen}
        options={{ title: 'New session', presentation: 'modal' }}
      />
      <Stack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
