import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/stores/authStore';
import { useUserStore } from '../src/stores/userStore';
import { useBookStore } from '../src/stores/bookStore';
import { Colors } from '../src/constants/theme';

export default function RootLayout() {
  const loadApiKey = useAuthStore((s) => s.loadApiKey);
  const loadUserData = useUserStore((s) => s.loadUserData);
  const loadBooks = useBookStore((s) => s.loadBooks);
  const authLoading = useAuthStore((s) => s.isLoading);
  const userLoading = useUserStore((s) => s.isLoading);

  useEffect(() => {
    loadApiKey();
    loadUserData();
    loadBooks();
  }, []);

  if (authLoading || userLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="book/[id]"
          options={{ title: 'Read Book', presentation: 'modal' }}
        />
        <Stack.Screen
          name="auth"
          options={{ title: 'Connect API', presentation: 'modal' }}
        />
        <Stack.Screen
          name="upgrade"
          options={{ title: 'Upgrade to Pro', presentation: 'modal' }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
