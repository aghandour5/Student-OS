import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, useSegments } from "expo-router";
import { ThemeProvider as NavThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { ThemeProvider, useTheme } from "@/lib/theme-context";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AcademicProvider } from "@/lib/academic-context";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import Colors from "@/constants/colors";
import { ConfirmProvider } from "@/lib/confirm-context";

SplashScreen.preventAutoHideAsync();

// import { usePushNotifications } from "@/lib/usePushNotifications";

/** Redirect unauthenticated users to login */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    // Cast to string to fix TS errors while auth screens are temporarily renamed to .bak
    const rootSegment = segments[0] as string | undefined;
    const inAuthGroup = rootSegment === 'login' || rootSegment === 'register' || rootSegment === 'forgot-password';

    // Force redirect to tabs during development (pause auth)
    if (inAuthGroup) {
      router.replace('/(tabs)');
    }

    // if (!isAuthenticated && !inAuthGroup) {
    //   // Redirect to login if not authenticated
    //   // router.replace('/login');
    // } else if (isAuthenticated && inAuthGroup) {
    //   // Redirect to tabs if already authenticated
    //   // router.replace('/(tabs)');
    // }
  }, [isAuthenticated, isLoading, segments]);

  return <>{children}</>;
}

function ThemedRoot() {
  const { colors, isDark } = useTheme();
  // usePushNotifications();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      {/* Provide Navigation Theme based on our custom theme context */}
      <NavThemeProvider value={{
        ...isDark ? DarkTheme : DefaultTheme,
        colors: {
          ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
          background: colors.background,
        },
      }}>
        <AuthGate>
          <Stack
            initialRouteName="(tabs)"
            screenOptions={{
              headerBackTitle: "Back",
              headerShown: false,
              animation: "slide_from_right",
              contentStyle: { backgroundColor: colors.background },
              gestureEnabled: true,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "none" }} />
            <Stack.Screen
              name="course/[id]"
              options={{ headerShown: false, animation: "slide_from_right" }}
            />
          </Stack>
        </AuthGate>
      </NavThemeProvider>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    // Wrap app in ErrorBoundary to catch crashes and show fallback
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView>
          <KeyboardProvider>
            {/* Theme and Academic providers manage global app state */}
            <ThemeProvider>
              <AuthProvider>
                <ConfirmProvider>
                  <AcademicProvider>
                    <ThemedRoot />
                  </AcademicProvider>
                </ConfirmProvider>
              </AuthProvider>
            </ThemeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
