import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { authAPI } from '../services/api';
import { registerForPushNotificationsAsync } from '../services/notifications';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { setUser, setToken, setAuthenticated } = useAppStore();

  useEffect(() => {
    // Check for existing token on app load
    const checkAuth = async () => {
      try {
        const token = await authAPI.getToken();
        if (token) {
          setToken(token);
          const user = await authAPI.getMe();
          setUser(user);
          setAuthenticated(true);

          // Register for push notifications after successful auth
          await registerForPushNotificationsAsync();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        await authAPI.removeToken();
        setAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
