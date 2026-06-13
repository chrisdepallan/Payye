import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface ScreenProps {
  children: React.ReactNode;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  edges?: readonly Edge[];
}

export function Screen({ children, padded = true, style, edges }: ScreenProps) {
  const { palette } = useTheme();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: palette.background }}
      edges={edges}
    >
      <View style={[{ flex: 1 }, padded ? { padding: spacing.md } : null, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}
