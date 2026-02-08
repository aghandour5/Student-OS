import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import type { CourseWithPrereqs } from '@shared/schema';

type CourseStatus = 'completed' | 'in_progress' | 'available' | 'locked' | 'future';

interface CourseCardProps {
  course: CourseWithPrereqs;
  status: CourseStatus;
  onPress?: () => void;
  compact?: boolean;
  grade?: string;
}

const statusConfig: Record<CourseStatus, { color: string; icon: string; label: string }> = {
  completed: { color: Colors.courseCompleted, icon: 'checkmark-circle', label: 'Completed' },
  in_progress: { color: Colors.courseInProgress, icon: 'time', label: 'In Progress' },
  available: { color: Colors.primary, icon: 'arrow-forward-circle', label: 'Available' },
  locked: { color: Colors.courseLocked, icon: 'lock-closed', label: 'Locked' },
  future: { color: Colors.courseFuture, icon: 'ellipsis-horizontal-circle', label: 'Future' },
};

export function CourseCard({ course, status, onPress, compact, grade }: CourseCardProps) {
  const config = statusConfig[status];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  if (compact) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.compactCard,
          { borderLeftColor: config.color, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <View style={styles.compactContent}>
          <Text style={styles.compactCode}>{course.code}</Text>
          <Text style={styles.compactTitle} numberOfLines={1}>{course.title}</Text>
        </View>
        <View style={styles.compactRight}>
          <Text style={[styles.compactCredits, { color: config.color }]}>{course.credits}cr</Text>
          {grade && <Text style={styles.gradeLabel}>{grade}</Text>}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={[styles.statusIndicator, { backgroundColor: config.color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.codeContainer}>
            <Text style={styles.code}>{course.code}</Text>
            <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
              <Ionicons name={config.icon as any} size={12} color={config.color} />
              <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
            </View>
          </View>
          <View style={styles.creditsContainer}>
            <MaterialCommunityIcons name="school" size={14} color={Colors.textSecondary} />
            <Text style={styles.credits}>{course.credits}</Text>
          </View>
        </View>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.category}>{course.category}</Text>
        {grade && (
          <View style={styles.gradeContainer}>
            <Text style={styles.gradeValue}>{grade}</Text>
          </View>
        )}
        {course.prerequisites.length > 0 && (
          <View style={styles.prereqRow}>
            <Ionicons name="git-branch-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.prereqText}>{course.prerequisites.length} prerequisite{course.prerequisites.length > 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statusIndicator: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  code: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  credits: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    fontFamily: 'Inter_600SemiBold',
  },
  title: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
  },
  prereqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  prereqText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
  },
  gradeContainer: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.courseCompleted + '20',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gradeValue: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.courseCompleted,
    fontFamily: 'Inter_700Bold',
  },
  compactCard: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  compactContent: {
    flex: 1,
    marginRight: 12,
  },
  compactCode: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  compactTitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text,
    fontFamily: 'Inter_500Medium',
  },
  compactRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  compactCredits: {
    fontSize: 12,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
  },
  gradeLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.courseCompleted,
    fontFamily: 'Inter_700Bold',
  },
});
