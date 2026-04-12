import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator,
  TextInput, Keyboard, FlatList, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAcademic } from '@/lib/academic-context';
import { useConfirm } from '@/lib/confirm-context';
import { useTheme } from '@/lib/theme-context';
import { ProgressRing } from '@/components/ProgressRing';
import { StatCard } from '@/components/StatCard';
import type { CourseWithPrereqs } from '@shared/schema';

import { TermInfo } from '@/components/TermInfo';
import { AppFooter } from '@/components/AppFooter';
import { BottomSheet } from '@/components/BottomSheet';



const SMART_TIPS = [
  'Tip: Complete prerequisites early to unlock more courses.',
  'Tip: Plan 15-18 credits per semester for on-time graduation.',
  'Tip: Check with your advisor before dropping required courses.',
  'Tip: Balance difficult courses with lighter ones each semester.',
];

const TIP_BORDER_COLORS = [
  Colors.categoryColors['Computer Science'],
  Colors.categoryColors['Mathematics'],
  Colors.categoryColors['Electrical Engineering'],
  Colors.categoryColors['Capstone'],
];

// Banner showing connection status
function ConnectionBanner({ topInset, isOnline }: { topInset: number; isOnline: boolean }) {
  if (isOnline) {
    return (
      <View style={[styles.offlineBanner, { paddingTop: topInset + 8, backgroundColor: Colors.courseCompleted + '15' }]}>
        <Ionicons name="cloud-done-outline" size={14} color={Colors.courseCompleted} />
        <Text style={[styles.offlineText, { color: Colors.courseCompleted }]}>Connected to Database</Text>
      </View>
    );
  }

  return (
    <View style={[styles.offlineBanner, { paddingTop: topInset + 8 }]}>
      <Ionicons name="cloud-offline-outline" size={14} color={Colors.warning} />
      <Text style={styles.offlineText}>Offline mode</Text>
    </View>
  );
}

// Helper to determine color based on GPA value
function getGPAColor(gpa: number): string {
  if (gpa >= 3.5) return Colors.gpaExcellent;
  if (gpa >= 3.0) return Colors.gpaGood;
  if (gpa >= 2.0) return Colors.gpaAverage;
  return Colors.gpaLow;
}



function SearchResultItem({ course, status, onPress }: {
  course: CourseWithPrereqs;
  status: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const statusColor = status === 'completed' ? Colors.courseCompleted
    : status === 'in_progress' ? Colors.courseInProgress
      : status === 'available' ? Colors.primary
        : Colors.courseLocked;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.searchResultItem, { opacity: pressed ? 0.7 : 1, borderBottomColor: colors.cardBorder }]}
    >
      <View style={[styles.searchResultDot, { backgroundColor: statusColor }]} />
      <View style={styles.searchResultInfo}>
        <Text style={[styles.searchResultCode, { color: colors.textMuted }]}>{course.code}</Text>
        <Text style={[styles.searchResultTitle, { color: colors.text }]} numberOfLines={1}>{course.title}</Text>
      </View>
      <Text style={[styles.searchResultCredits, { color: colors.textSecondary }]}>{course.credits}cr</Text>
      <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
    </Pressable>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile, courses, isLoading, isOnline,
    totalCredits, completedCredits, inProgressCredits,
    calculateGPA, getCourseStatus,
    toggleYearCompleted, isYearCompleted,
    setMajor,
  } = useAcademic();
  const { confirm } = useConfirm();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [dismissedTips, setDismissedTips] = useState<number[]>([]);
  const [majorSheetVisible, setMajorSheetVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Human-readable major label
  const majorLabel = profile.major === 'EENG' ? 'Electrical Engineering' :
    profile.major === 'MENG' ? 'Mechanical Engineering' :
      'Computer Engineering';

  // Open major selection sheet
  const handleSwitchMajor = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMajorSheetVisible(true);
  }, []);

  const handleSelectMajor = useCallback((major: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMajor(major);
    setMajorSheetVisible(false);
  }, [setMajor]);

  const { isDark, toggleTheme, colors } = useTheme();


  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const gpa = calculateGPA();
  const progress = totalCredits > 0 ? completedCredits / totalCredits : 0;

  const categoryNames = useMemo(() => {
    return Object.keys(Colors.categoryColors);
  }, []);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; totalCredits: number; completedCredits: number }> = {};
    for (const name of categoryNames) {
      stats[name] = { total: 0, completed: 0, totalCredits: 0, completedCredits: 0 };
    }
    courses.forEach(c => {
      const cat = c.category || '';
      if (!stats[cat]) return;
      stats[cat].total += 1;
      stats[cat].totalCredits += c.credits;
      if (getCourseStatus(c.id) === 'completed') {
        stats[cat].completed += 1;
        stats[cat].completedCredits += c.credits;
      }
    });
    return stats;
  }, [courses, getCourseStatus, categoryNames]);

  // Filter search results based on query and selected category
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    let filtered = courses.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q)
    );
    if (activeFilter !== 'All') {
      filtered = filtered.filter(c => c.category === activeFilter);
    }
    return filtered.slice(0, 8);
  }, [searchQuery, courses, activeFilter]);

  const showResults = searchFocused && searchQuery.trim().length > 0;

  // Navigate to course details on selection
  const handleSearchSelect = useCallback((courseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchQuery('');
    setSearchFocused(false);
    Keyboard.dismiss();
    router.push({ pathname: '/course/[id]', params: { id: courseId } });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    inputRef.current?.focus();
  }, []);

  const currentTip = useMemo(() => {
    const available = SMART_TIPS.map((t, i) => i).filter(i => !dismissedTips.includes(i));
    if (available.length === 0) return null;
    return available[0];
  }, [dismissedTips]);

  const dismissTip = useCallback((index: number) => {
    setDismissedTips(prev => [...prev, index]);
  }, []);

  const milestones = useMemo(() => [
    { threshold: 0, label: 'Start Your Journey' },
    { threshold: 30, label: 'Freshman Complete' },
    { threshold: 60, label: 'Sophomore Complete' },
    { threshold: 90, label: 'Junior Complete' },
    { threshold: 120, label: 'Senior Complete' },
    { threshold: totalCredits, label: 'Graduation!' },
  ], [totalCredits]);

  // Optimization: Group courses by status in a single pass to prevent calling
  // expensive getCourseStatus 4x per course on every render.
  const { availableCourses, inProgressCourses, completedCoursesList, lockedCourses } = useMemo(() => {
    const available: CourseWithPrereqs[] = [];
    const inProgress: CourseWithPrereqs[] = [];
    const completed: CourseWithPrereqs[] = [];
    const locked: CourseWithPrereqs[] = [];

    courses.forEach(c => {
      const status = getCourseStatus(c.id);
      if (status === 'available') available.push(c);
      else if (status === 'in_progress') inProgress.push(c);
      else if (status === 'completed') completed.push(c);
      else if (status === 'locked') locked.push(c);
    });

    return {
      availableCourses: available,
      inProgressCourses: inProgress,
      completedCoursesList: completed,
      lockedCourses: locked
    };
  }, [courses, getCourseStatus]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top + webTopInset, backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ConnectionBanner topInset={insets.top} isOnline={isOnline} />
      <View style={[styles.fixedHeader, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={handleSwitchMajor} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.greeting, { color: colors.text }]}>{majorLabel}</Text>
              <Ionicons name="swap-horizontal" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Year {Math.max(1, [0, 1, 2, 3].filter(y => isYearCompleted(y)).length)} of 4</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleTheme();
            }}
            style={({ pressed }) => [styles.settingsBtn, { opacity: pressed ? 0.7 : 1, backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <Pressable
            style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }, searchFocused && { borderColor: colors.primary + '40', backgroundColor: colors.cardElevated, shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 8 }]}
            onPress={() => inputRef.current?.focus()}
          >
            <Ionicons name="search" size={18} color={searchFocused ? colors.primary : colors.textMuted} />
            <TextInput
              ref={inputRef}
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search courses..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              testID="course-search-input"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={clearSearch} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </Pressable>

          {showResults && (
            <View style={[styles.searchResults, { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder }]}>
              {searchResults.length > 0 ? (
                <ScrollView
                  style={styles.searchResultsScroll}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                >
                  {searchResults.map(course => (
                    <SearchResultItem
                      key={course.id}
                      course={course}
                      status={getCourseStatus(course.id)}
                      onPress={() => handleSearchSelect(course.id)}
                    />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.searchEmpty}>
                  <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                  <Text style={[styles.searchEmptyText, { color: colors.textMuted }]}>No courses found</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Platform.OS === 'web' ? 34 + 84 : 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={isDark ? ['#0F2847', '#0B1E3D', '#0B1426'] : ['#E0F2FE', '#DBEAFE', '#F0F9FF']}
          style={[styles.gpaCard, { borderColor: colors.cardBorder }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.gpaCardContent}>
            <ProgressRing
              progress={progress}
              size={110}
              strokeWidth={8}
              color={colors.primary}
              label={`${Math.round(progress * 100)}%`}
              sublabel="Complete"
            />
            <View style={styles.gpaInfo}>
              <View style={styles.gpaLabelRow}>
                <Text style={[styles.gpaLabel, { color: colors.textSecondary }]}>Cumulative GPA</Text>
                <TermInfo term="Cumulative GPA" size={14} />
              </View>
              <Text style={[styles.gpaValue, { color: gpa > 0 ? getGPAColor(gpa) : colors.textSecondary }]}>
                {gpa > 0 ? gpa.toFixed(2) : '--'}
              </Text>
              <View style={styles.creditRow}>
                <MaterialCommunityIcons name="school-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.creditText, { color: colors.textSecondary }]}>
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
            onPress={() => router.push({ pathname: '/(tabs)/map', params: { filter: 'completed' } })}
          />
          <StatCard
            icon="time"
            iconColor={Colors.courseInProgress}
            label="In Progress"
            value={`${inProgressCourses.length}`}
            small
            onPress={() => router.push({ pathname: '/(tabs)/map', params: { filter: 'in_progress' } })}
          />
          <StatCard
            icon="arrow-forward-circle"
            iconColor={Colors.primary}
            label="Available"
            value={`${availableCourses.length}`}
            small
            onPress={() => router.push({ pathname: '/(tabs)/map', params: { filter: 'available' } })}
          />
          <StatCard
            icon="lock-closed"
            iconColor={Colors.courseLocked}
            label="Locked"
            value={`${lockedCourses.length}`}
            small
            onPress={() => router.push({ pathname: '/(tabs)/map', params: { filter: 'locked' } })}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mark Year as Completed</Text>
          <View style={styles.yearCheckboxRow}>
            {[0, 1, 2, 3].map(year => {
              const checked = isYearCompleted(year);
              const yearCourseCount = courses.filter(c => c.year === year).length;
              const yearLabel = year === 0 ? 'Foundation' : `Year ${year}`;
              return (
                <Pressable
                  key={year}
                  style={[styles.yearCheckbox, { backgroundColor: colors.card, borderColor: colors.cardBorder }, checked && styles.yearCheckboxChecked]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    toggleYearCompleted(year);
                  }}
                >
                  <Ionicons
                    name={checked ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={checked ? Colors.courseCompleted : colors.textSecondary}
                  />
                  <View>
                    <Text style={[styles.yearCheckboxLabel, { color: colors.textSecondary }, checked && styles.yearCheckboxLabelChecked]}>{yearLabel}</Text>
                    <Text style={[styles.yearCheckboxSub, { color: colors.textMuted }]}>{yearCourseCount} courses</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Smart Tips: auto-dismissable advice cards */}
        {
          currentTip !== null && (
            <View style={[styles.tipCard, { borderLeftColor: TIP_BORDER_COLORS[currentTip % TIP_BORDER_COLORS.length], backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.tipContent}>
                <Ionicons name="bulb-outline" size={18} color={TIP_BORDER_COLORS[currentTip % TIP_BORDER_COLORS.length]} />
                <Text style={[styles.tipText, { color: colors.text }]}>{SMART_TIPS[currentTip]}</Text>
              </View>
              <Pressable onPress={() => dismissTip(currentTip)} hitSlop={8} style={styles.tipDismiss}>
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
          )
        }

        {/* Milestone Markers */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Degree Milestones</Text>
          <View style={[styles.milestoneContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {milestones.map((m, i) => {
              const achieved = completedCredits >= m.threshold;
              const isLast = i === milestones.length - 1;
              return (
                <View key={i} style={styles.milestoneRow}>
                  <View style={styles.milestoneLeftCol}>
                    <View style={[
                      styles.milestoneDot,
                      { backgroundColor: achieved ? Colors.courseCompleted : colors.cardBorder },
                    ]} />
                    {!isLast && (
                      <View style={[
                        styles.milestoneLine,
                        { backgroundColor: achieved ? Colors.courseCompleted + '40' : colors.cardBorder },
                      ]} />
                    )}
                  </View>
                  <View style={styles.milestoneInfo}>
                    <Text style={[styles.milestoneLabel, { color: colors.text }, achieved && { color: Colors.courseCompleted }]}>
                      {m.label}
                    </Text>
                    <Text style={[styles.milestoneCredits, { color: colors.textMuted }]}>{m.threshold} credits</Text>
                  </View>
                  {achieved && (
                    <Ionicons name="checkmark-circle" size={18} color={Colors.courseCompleted} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Graduation Progress</Text>
          <View style={[styles.gradCountdown, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.gradCountdownRow}>
              <View style={styles.gradCountdownItem}>
                <Text style={[styles.gradCountdownValue, { color: colors.text }]}>{courses.length - completedCoursesList.length}</Text>
                <Text style={[styles.gradCountdownLabel, { color: colors.textSecondary }]}>Courses Left</Text>
              </View>
              <View style={[styles.gradCountdownDivider, { backgroundColor: colors.cardBorder }]} />
              <View style={styles.gradCountdownItem}>
                <Text style={[styles.gradCountdownValue, { color: colors.text }]}>{totalCredits - completedCredits}</Text>
                <Text style={[styles.gradCountdownLabel, { color: colors.textSecondary }]}>Credits Left</Text>
              </View>
              <View style={[styles.gradCountdownDivider, { backgroundColor: colors.cardBorder }]} />
              <View style={styles.gradCountdownItem}>
                <Text style={[styles.gradCountdownValue, { color: colors.primary }]}>
                  {completedCoursesList.length > 0
                    ? Math.ceil((courses.length - completedCoursesList.length) / Math.max(1, Math.ceil(completedCoursesList.length / 2)))
                    : '~8'}
                </Text>
                <Text style={[styles.gradCountdownLabel, { color: colors.textSecondary }]}>Semesters Est.</Text>
              </View>
            </View>
            <View style={[styles.gradProgressBar, { backgroundColor: colors.cardBorder }]}>
              <View style={[styles.gradProgressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
            <Text style={[styles.gradProgressText, { color: colors.textSecondary }]}>
              {Math.round(progress * 100)}% toward graduation
            </Text>
          </View>
        </View>

        {
          inProgressCourses.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Currently Enrolled</Text>
              {inProgressCourses.map(course => (
                <Pressable
                  key={course.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/course/[id]', params: { id: course.id } });
                  }}
                  style={({ pressed }) => [styles.enrolledCard, { opacity: pressed ? 0.8 : 1, backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                >
                  <View style={[styles.enrolledDot, { backgroundColor: Colors.courseInProgress }]} />
                  <View style={styles.enrolledInfo}>
                    <Text style={[styles.enrolledCode, { color: colors.textMuted }]}>{course.code}</Text>
                    <Text style={[styles.enrolledTitle, { color: colors.text }]}>{course.title}</Text>
                  </View>
                  <Text style={styles.enrolledCredits}>{course.credits}cr</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          )
        }

        {
          availableCourses.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Ready to Take</Text>
                <Text style={[styles.sectionCount, { color: colors.textMuted }]}>{availableCourses.length} courses</Text>
              </View>
              {availableCourses.slice(0, 5).map(course => (
                <Pressable
                  key={course.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/course/[id]', params: { id: course.id } });
                  }}
                  style={({ pressed }) => [styles.enrolledCard, { opacity: pressed ? 0.8 : 1, backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                >
                  <View style={[styles.enrolledDot, { backgroundColor: colors.primary }]} />
                  <View style={styles.enrolledInfo}>
                    <Text style={[styles.enrolledCode, { color: colors.textMuted }]}>{course.code}</Text>
                    <Text style={[styles.enrolledTitle, { color: colors.text }]}>{course.title}</Text>
                  </View>
                  <Text style={[styles.enrolledCredits, { color: colors.primary }]}>{course.credits}cr</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
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
                  <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                </Pressable>
              )}
            </View>
          )
        }

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/map');
          }}
          style={({ pressed }) => [styles.mapCTA, { opacity: pressed ? 0.9 : 1 }]}
        >
          <LinearGradient
            colors={[colors.primary + '30', colors.primaryDark + '15']}
            style={[styles.mapCTAGradient, { borderColor: colors.primary + '30' }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[styles.mapCTAIcon, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons name="graph-outline" size={28} color={colors.primary} />
            </View>
            <View style={styles.mapCTAContent}>
              <Text style={[styles.mapCTATitle, { color: colors.text }]}>Degree Mind Map</Text>
              <Text style={[styles.mapCTASubtitle, { color: colors.textSecondary }]}>Visualize your academic journey</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </LinearGradient>
        </Pressable>

        <AppFooter />
      </ScrollView >

      <BottomSheet
        visible={majorSheetVisible}
        onClose={() => setMajorSheetVisible(false)}
        title="Select Major"
        subtitle="Your progress is saved for each major separately."
      >
        <View style={{ paddingBottom: 20 }}>
          {[
            { id: 'CENG', label: 'Computer Engineering', code: 'CENG' },
            { id: 'EENG', label: 'Electrical Engineering', code: 'EENG' },
            { id: 'MENG', label: 'Mechanical Engineering', code: 'MENG' },
          ].map((item) => {
            const isActive = profile.major === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => handleSelectMajor(item.id)}
                style={({ pressed }) => [
                  styles.majorItem,
                  { borderColor: colors.cardBorder, opacity: pressed ? 0.7 : 1 }
                ]}
              >
                <View style={[
                  styles.majorIcon,
                  { backgroundColor: isActive ? colors.primary + '20' : colors.cardBorder + '50' }
                ]}>
                  <MaterialCommunityIcons
                    name={item.id === 'CENG' ? 'laptop' : item.id === 'EENG' ? 'lightning-bolt' : 'cog'}
                    size={24}
                    color={isActive ? colors.primary : colors.textMuted}
                  />
                </View>
                <View style={styles.majorItemContent}>
                  <Text style={[styles.majorTitle, { color: colors.text, fontWeight: isActive ? '700' : '500' }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.majorSubtitle, { color: colors.textSecondary }]}>
                    Bachelor of Science
                  </Text>
                </View>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View >
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: Colors.warning + '15',
  },
  offlineText: {
    fontSize: 12,
    color: Colors.warning,
    fontFamily: 'Inter_500Medium',
  },
  fixedHeader: {
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    zIndex: 100,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
    zIndex: 100,
    position: 'relative' as any,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  searchBarFocused: {
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.cardElevated,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    ...Platform.select({ web: { outlineStyle: 'none' } }) as any,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontFamily: 'Inter_400Regular',
    height: '100%' as any,
    paddingVertical: 0,
    ...Platform.select({ web: { outlineStyle: 'none' } }) as any,
  },

  searchResults: {
    position: 'absolute' as any,
    top: 90,
    left: 0,
    right: 0,
    backgroundColor: Colors.cardElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    zIndex: 200,
    elevation: 10,
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 24px rgba(0,0,0,0.4)' } : {}),
  },
  searchResultsScroll: {
    maxHeight: 320,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  searchResultDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultCode: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  searchResultTitle: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Inter_500Medium',
    marginTop: 1,
  },
  searchResultCredits: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'Inter_600SemiBold',
  },
  searchEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  searchEmptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
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
  },
  gpaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  yearCheckboxRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  yearCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flex: 1,
    minWidth: '45%' as any,
  },
  yearCheckboxChecked: {
    borderColor: Colors.courseCompleted + '60',
    backgroundColor: Colors.courseCompleted + '10',
  },
  yearCheckboxLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
  },
  yearCheckboxLabelChecked: {
    color: Colors.courseCompleted,
  },
  yearCheckboxSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginTop: 1,
  },
  tipCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  tipDismiss: {
    padding: 4,
    marginLeft: 8,
  },
  milestoneContainer: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 48,
  },
  milestoneLeftCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  milestoneDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  milestoneLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    minHeight: 24,
  },
  milestoneInfo: {
    flex: 1,
    paddingBottom: 12,
  },
  milestoneLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
  },
  milestoneCredits: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
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
  gradCountdown: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  gradCountdownRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 14,
  },
  gradCountdownItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  gradCountdownDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.cardBorder,
  },
  gradCountdownValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    fontFamily: 'Inter_700Bold',
  },
  gradCountdownLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  gradProgressBar: {
    height: 6,
    backgroundColor: Colors.cardBorder,
    borderRadius: 3,
    overflow: 'hidden' as const,
    marginBottom: 8,
  },
  gradProgressFill: {
    height: '100%' as const,
    backgroundColor: Colors.courseCompleted,
    borderRadius: 3,
  },
  gradProgressText: {
    fontFamily: 'Inter_400Regular',
    textAlign: 'center' as const,
  },
  majorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 16,
  },
  majorIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  majorItemContent: {
    flex: 1,
    gap: 2,
  },
  majorTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  majorSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
