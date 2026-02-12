import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
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
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

function ThemedRoot() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <NavThemeProvider value={{
        ...isDark ? DarkTheme : DefaultTheme,
        colors: {
          ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
          background: colors.background,
        },
      }}>
        <Stack
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView>
          <KeyboardProvider>
            <ThemeProvider>
              <AcademicProvider>
                <ThemedRoot />
              </AcademicProvider>
            </ThemeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
