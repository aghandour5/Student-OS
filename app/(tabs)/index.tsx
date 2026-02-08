import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAcademic } from '@/lib/academic-context';
import { ProgressRing } from '@/components/ProgressRing';
import { StatCard } from '@/components/StatCard';

function getGPAColor(gpa: number): string {
  if (gpa >= 3.5) return Colors.gpaExcellent;
  if (gpa >= 3.0) return Colors.gpaGood;
  if (gpa >= 2.0) return Colors.gpaAverage;
  return Colors.gpaLow;
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile, courses, isLoading,
    totalCredits, completedCredits, inProgressCredits,
    calculateGPA, getCourseStatus,
  } = useAcademic();

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const gpa = calculateGPA();
  const progress = totalCredits > 0 ? completedCredits / totalCredits : 0;

  const availableCourses = courses.filter(c => getCourseStatus(c.id) === 'available');
  const inProgressCourses = courses.filter(c => getCourseStatus(c.id) === 'in_progress');
  const completedCoursesList = courses.filter(c => getCourseStatus(c.id) === 'completed');
  const lockedCourses = courses.filter(c => getCourseStatus(c.id) === 'locked');

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top + webTopInset }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + webTopInset + 16,
            paddingBottom: Platform.OS === 'web' ? 34 + 84 : 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Computer Engineering</Text>
            <Text style={styles.subtitle}>Year {Math.ceil((completedCredits / totalCredits * 4) || 1)} of 4</Text>
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/tools');
            }}
            style={({ pressed }) => [styles.settingsBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <LinearGradient
          colors={['#0F2847', '#0B1E3D', '#0B1426']}
          style={styles.gpaCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.gpaCardContent}>
            <ProgressRing
              progress={progress}
              size={110}
              strokeWidth={8}
              color={Colors.primary}
              label={`${Math.round(progress * 100)}%`}
              sublabel="Complete"
            />
            <View style={styles.gpaInfo}>
              <Text style={styles.gpaLabel}>Cumulative GPA</Text>
              <Text style={[styles.gpaValue, { color: gpa > 0 ? getGPAColor(gpa) : Colors.textSecondary }]}>
                {gpa > 0 ? gpa.toFixed(2) : '--'}
              </Text>
              <View style={styles.creditRow}>
                <MaterialCommunityIcons name="school-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.creditText}>
                  {completedCredits}/{totalCredits} credits
                </Text>
              </View>
              {inProgressCredits > 0 && (
                <View style={styles.creditRow}>
                  <Ionicons name="time-outline" size={14} color={Colors.courseInProgress} />
                  <Text style={[styles.creditText, { color: Colors.courseInProgress }]}>
                    {inProgressCredits} in progress
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <StatCard
            icon="checkmark-circle"
            iconColor={Colors.courseCompleted}
            label="Completed"
            value={`${completedCoursesList.length}`}
            small
          />
          <StatCard
            icon="time"
            iconColor={Colors.courseInProgress}
            label="In Progress"
            value={`${inProgressCourses.length}`}
            small
          />
          <StatCard
            icon="arrow-forward-circle"
            iconColor={Colors.primary}
            label="Available"
            value={`${availableCourses.length}`}
            small
          />
          <StatCard
            icon="lock-closed"
            iconColor={Colors.courseLocked}
            label="Locked"
            value={`${lockedCourses.length}`}
            small
          />
        </View>

        {inProgressCourses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Currently Enrolled</Text>
            {inProgressCourses.map(course => (
              <Pressable
                key={course.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: '/course/[id]', params: { id: course.id } });
                }}
                style={({ pressed }) => [styles.enrolledCard, { opacity: pressed ? 0.8 : 1 }]}
              >
                <View style={[styles.enrolledDot, { backgroundColor: Colors.courseInProgress }]} />
                <View style={styles.enrolledInfo}>
                  <Text style={styles.enrolledCode}>{course.code}</Text>
                  <Text style={styles.enrolledTitle}>{course.title}</Text>
                </View>
                <Text style={styles.enrolledCredits}>{course.credits}cr</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </Pressable>
            ))}
          </View>
        )}

        {availableCourses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ready to Take</Text>
              <Text style={styles.sectionCount}>{availableCourses.length} courses</Text>
            </View>
            {availableCourses.slice(0, 5).map(course => (
              <Pressable
                key={course.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: '/course/[id]', params: { id: course.id } });
                }}
                style={({ pressed }) => [styles.enrolledCard, { opacity: pressed ? 0.8 : 1 }]}
              >
                <View style={[styles.enrolledDot, { backgroundColor: Colors.primary }]} />
                <View style={styles.enrolledInfo}>
                  <Text style={styles.enrolledCode}>{course.code}</Text>
                  <Text style={styles.enrolledTitle}>{course.title}</Text>
                </View>
                <Text style={[styles.enrolledCredits, { color: Colors.primary }]}>{course.credits}cr</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </Pressable>
            ))}
            {availableCourses.length > 5 && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/map');
                }}
                style={styles.seeMoreBtn}
              >
                <Text style={styles.seeMoreText}>View all on Map</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
              </Pressable>
            )}
          </View>
        )}

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/map');
          }}
          style={({ pressed }) => [styles.mapCTA, { opacity: pressed ? 0.9 : 1 }]}
        >
          <LinearGradient
            colors={[Colors.primary + '30', Colors.primaryDark + '15']}
            style={styles.mapCTAGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.mapCTAIcon}>
              <MaterialCommunityIcons name="graph-outline" size={28} color={Colors.primary} />
            </View>
            <View style={styles.mapCTAContent}>
              <Text style={styles.mapCTATitle}>Degree Mind Map</Text>
              <Text style={styles.mapCTASubtitle}>Visualize your academic journey</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  gpaCard: {
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  gpaCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  gpaInfo: {
    flex: 1,
  },
  gpaLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  gpaValue: {
    fontSize: 38,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  creditText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 12,
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    marginBottom: 12,
  },
  enrolledCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 10,
  },
  enrolledDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  enrolledInfo: {
    flex: 1,
  },
  enrolledCode: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  enrolledTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
    fontFamily: 'Inter_500Medium',
    marginTop: 1,
  },
  enrolledCredits: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.courseInProgress,
    fontFamily: 'Inter_600SemiBold',
  },
  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  seeMoreText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  mapCTA: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  mapCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  mapCTAIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCTAContent: {
    flex: 1,
  },
  mapCTATitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
  },
  mapCTASubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
});
