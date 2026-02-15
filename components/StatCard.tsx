/**
 * StatCard — Compact metric display used in dashboard grids.
 * Shows an icon, numeric value, label, and optional subtitle.
 * Supports a `small` variant and optional `onPress` for tappable cards.
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useTheme } from '@/lib/theme-context';

interface StatCardProps {
  icon: string;
  iconColor?: string;
  label: string;
  value: string;
  subtitle?: string;
  small?: boolean;
  onPress?: () => void;
}

export function StatCard({ icon, iconColor = Colors.primary, label, value, subtitle, small, onPress }: StatCardProps) {
  const { colors } = useTheme();
  const content = (
    <>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon as any} size={small ? 18 : 22} color={iconColor} />
      </View>
      <Text style={[styles.value, small && styles.smallValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, small && styles.smallLabel, { color: colors.textSecondary }]} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          small && styles.smallCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${value} ${label}`}
        accessibilityHint={`Tap to filter by ${label}`}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, small && styles.smallCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  smallCard: {
    padding: 12,
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    fontFamily: 'Inter_700Bold',
  },
  smallValue: {
    fontSize: 18,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  smallLabel: {
    fontSize: 11,
  },
  subtitle: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
});
