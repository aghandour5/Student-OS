import { isLiquidGlassAvailable } from "expo-glass-effect";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, useColorScheme, View, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import Colors from "@/constants/colors";
import { useTheme } from "@/lib/theme-context";
import { SwipeableTabs } from "@/components/SwipeableTabs";
import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="map">
        <Icon sf={{ default: "map", selected: "map.fill" }} />
        <Label>Map</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="planner">
        <Icon sf={{ default: "calendar", selected: "calendar" }} />
        <Label>Planner</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tools">
        <Icon sf={{ default: "wrench", selected: "wrench.fill" }} />
        <Label>Tools</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home',
  map: 'map',
  planner: 'calendar',
  tools: 'build',
};

function CustomTabBar({ state, descriptors, navigation }: MaterialTopTabBarProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";

  return (
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 9999, elevation: 9999 }}>
      {/* Platform-specific background: BlurView on iOS, solid color on Android/Web */}
      {isIOS ? (
        <BlurView
          intensity={100}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, {
          backgroundColor: colors.backgroundSecondary,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.cardBorder,
        }]} />
      )}

      {/* Tab Icons Row */}
      <View style={{
        flexDirection: 'row',
        height: 50 + (isWeb ? 14 : insets.bottom),
        paddingBottom: isWeb ? 14 : insets.bottom,
        paddingTop: 4,
      }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const color = isFocused ? colors.primary : colors.textMuted;
          const iconName = TAB_ICONS[route.name] || 'help-circle';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}
            >
              <Ionicons name={iconName} size={24} color={color} />
              <Text style={{
                fontSize: 10,
                fontWeight: isFocused ? '600' : '500',
                color,
                fontFamily: isFocused ? 'Inter_600SemiBold' : 'Inter_500Medium'
              }}>
                {options.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ClassicTabLayout() {
  const { colors } = useTheme();

  return (
    <SwipeableTabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarPosition: 'bottom',
        swipeEnabled: true,
        lazy: true,
        animationEnabled: true,
      } as any}
    >
      <SwipeableTabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <SwipeableTabs.Screen
        name="map"
        options={{
          title: "Map",
          swipeEnabled: false,
        }}
      />
      <SwipeableTabs.Screen
        name="planner"
        options={{
          title: "Planner",
        }}
      />
      <SwipeableTabs.Screen
        name="tools"
        options={{
          title: "Tools",
        }}
      />
    </SwipeableTabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
