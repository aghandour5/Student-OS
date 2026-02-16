import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
  ActivityIndicator, FlatList, Alert, Share
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import Colors from '@/constants/colors';
import { useTheme } from '@/lib/theme-context';
import { AppFooter } from '@/components/AppFooter';
import { useAcademic } from '@/lib/academic-context';
import type { SemesterPlan, CourseWithPrereqs } from '@shared/schema';
import { BottomSheet } from '@/components/BottomSheet';
import { useConfirm } from '@/lib/confirm-context';
import { SemesterCard } from '@/components/SemesterCard';
import {
  getMaxCredits,
  getSeasonOrder,
  getSemesterCredits
} from '@/lib/planner-utils';

export default function PlannerScreen() {
  const insets = useSafeAreaInsets();
  const {
    semesterPlans, completedCourses, inProgressCourses, courses, offerings, isLoading,
    addSemesterPlan, removeSemesterPlan,
    addCourseToSemester, removeCourseFromSemester,
    setSelectedOffering, getOfferingsForCourse,
    getCourseStatus, arePrereqsMet, getMissingPrereqs,
  } = useAcademic();
  const { colors } = useTheme();
  const { confirm } = useConfirm();

  const [showNewSemester, setShowNewSemester] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState<string | null>(null);
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);
  const [showSelectSection, setShowSelectSection] = useState<{ planId: string; courseId: string } | null>(null);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const courseMap = useMemo(() => {
    const map = new Map<string, CourseWithPrereqs>();
    courses.forEach(c => map.set(c.id, c));
    return map;
  }, [courses]);

  const allAssignedCourseIds = useMemo(() => {
    const ids = new Set<string>();
    semesterPlans.forEach(p => p.courseIds.forEach(id => ids.add(id)));
    return ids;
  }, [semesterPlans]);

  const getAvailableForSemester = (plan: SemesterPlan) => {
    // 1. Identify courses needed for FUTURE semesters (Critical Path Analysis)
    // Find all courses in plans that are temporally after the current plan
    const futurePlanIds = semesterPlans
      .filter(p => (p.year > plan.year) || (p.year === plan.year && getSeasonOrder(p.season) > getSeasonOrder(plan.season)))
      .map(p => p.id);

    const futureCourseIds = new Set<string>();
    semesterPlans
      .filter(p => futurePlanIds.includes(p.id))
      .forEach(p => p.courseIds.forEach(id => futureCourseIds.add(id)));

    // 2. Score and Sort
    const scored = courses
      .filter(c => {
        if (allAssignedCourseIds.has(c.id)) return false;
        if (completedCourses.includes(c.id)) return false;

        // SEMESTER AVAILABILITY CHECK
        // Foundation courses (year 0) are available every semester.
        // For other years, strict availability: Fall (1) only in Fall, Spring (2) only in Spring.
        if (c.year !== 0) {
          if (plan.season === 'Fall' && c.semester !== 1) return false;
          if (plan.season === 'Spring' && c.semester !== 2) return false;
        }

        return true;
      })
      .map(c => {
        let score = 0;
        const status = getCourseStatus(c.id);
        const isPrereqMet = status === 'available';

        // STATUS
        if (isPrereqMet) score += 1000;
        else score -= 1000; // Push locked to bottom

        // COREQUISITES (High priority if partner is in THIS semester)
        if (c.corequisites && c.corequisites.length > 0) {
          const hasCoreqInPlan = c.corequisites.some(coreqId => plan.courseIds.includes(coreqId));
          if (hasCoreqInPlan) score += 2000; // Must take together!
        }

        // CRITICAL PATH (Is this a prereq for something planned in the future?)
        // Check if 'c' is a prereq for any course in futureCourseIds
        // This is expensive if we scan all courses. Instead check if 'c' unlocks anything in futureCourseIds.
        const unlocksFuture = c.unlocks.some(uid => futureCourseIds.has(uid));
        if (unlocksFuture) score += 500;

        // UNLOCKING POWER
        score += c.unlocks.length * 10;

        return { course: c, score, isLocked: !isPrereqMet };
      })
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return a.course.code.localeCompare(b.course.code);
      });

    // Mark top 3 available courses as "Recommended" if they have a positive score
    return scored.map((item, index) => ({
      ...item.course,
      isRecommended: !item.isLocked && index < 3 && item.score > 1000,
      sortScore: item.score
    }));
  };

  const handleCreateSemester = (season: 'Fall' | 'Spring' | 'Summer', year: number) => {
    const id = Crypto.randomUUID();
    addSemesterPlan({
      id,
      name: `${season} ${year}`,
      season,
      year,
      courseIds: [],
      selectedOfferings: {},
    });
    setShowNewSemester(false);
    setExpandedSemester(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const closeSelectSection = useCallback(() => {
    setShowSelectSection(null);
  }, []);

  const closeNewSemester = useCallback(() => {
    setShowNewSemester(false);
  }, []);

  const closeAddCourse = useCallback(() => {
    setShowAddCourse(null);
  }, []);

  const handleRemoveSemester = useCallback(async (planId: string) => {
    if (await confirm({
      title: 'Remove Semester',
      message: 'Are you sure you want to remove this semester plan?',
      confirmText: 'Remove',
      variant: 'danger',
    })) {
      removeSemesterPlan(planId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [confirm, removeSemesterPlan]);

  const handleToggleExpand = useCallback((planId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSemester(prev => prev === planId ? null : planId);
  }, []);

  const handleAddCourse = useCallback((planId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAddCourse(planId);
  }, []);

  const handleSelectSection = useCallback((planId: string, courseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSelectSection({ planId, courseId });
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top + webTopInset, backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const sortedPlans = [...semesterPlans].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const order: Record<string, number> = { Spring: 0, Summer: 1, Fall: 2 };
    return (order[a.season] ?? 3) - (order[b.season] ?? 3);
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 12 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Semester Planner</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{sortedPlans.length} semester{sortedPlans.length !== 1 ? 's' : ''} planned</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {sortedPlans.length > 0 && (
            <Pressable
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const lines: string[] = ['UniFlow - Semester Plan\n'];
                sortedPlans.forEach(plan => {
                  const credits = getSemesterCredits(plan, courseMap);
                  lines.push(`${plan.name} (${credits} credits)`);
                  plan.courseIds.forEach(id => {
                    const course = courseMap.get(id);
                    if (course) {
                      lines.push(`  - ${course.code}: ${course.title} (${course.credits} cr)`);
                    }
                  });
                  lines.push('');
                });
                const totalCredits = sortedPlans.reduce((sum, p) => sum + getSemesterCredits(p, courseMap), 0);
                lines.push(`Total: ${totalCredits} credits across ${sortedPlans.length} semester(s)`);
                const text = lines.join('\n');
                try {
                  await Share.share({ message: text });
                } catch {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    await navigator.clipboard.writeText(text);
                    Alert.alert('Copied', 'Plan copied to clipboard');
                  }
                }
              }}
              style={[styles.shareBtn, { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder }]}
              accessibilityRole="button"
              accessibilityLabel="Share plan"
              accessibilityHint="Shares a text summary of your semester plan"
            >
              <Ionicons name="share-outline" size={20} color={colors.text} />
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowNewSemester(true);
            }}
            style={styles.addBtn}
            accessibilityRole="button"
            accessibilityLabel="Add new semester"
            accessibilityHint="Create a new semester plan"
          >
            <Ionicons name="add" size={24} color={Colors.white} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === 'web' ? 34 + 84 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {sortedPlans.length > 0 && (
          <View style={[styles.creditSummary, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.creditSummaryItem}>
              <Text style={[styles.creditSummaryValue, { color: colors.text }]}>
                {sortedPlans.reduce((sum, p) => sum + getSemesterCredits(p, courseMap), 0)}
              </Text>
              <Text style={[styles.creditSummaryLabel, { color: colors.textSecondary }]}>Total Planned</Text>
            </View>
            <View style={[styles.creditSummaryDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.creditSummaryItem}>
              <Text style={[styles.creditSummaryValue, { color: colors.text }]}>{sortedPlans.length}</Text>
              <Text style={[styles.creditSummaryLabel, { color: colors.textSecondary }]}>Semesters</Text>
            </View>
            <View style={[styles.creditSummaryDivider, { backgroundColor: colors.cardBorder }]} />
            <View style={styles.creditSummaryItem}>
              <Text style={[styles.creditSummaryValue, { color: Colors.primary }]}>
                {sortedPlans.length > 0 ? Math.round(sortedPlans.reduce((sum, p) => sum + getSemesterCredits(p, courseMap), 0) / sortedPlans.length) : 0}
              </Text>
              <Text style={[styles.creditSummaryLabel, { color: colors.textSecondary }]}>Avg/Semester</Text>
            </View>
          </View>
        )}

        {sortedPlans.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Semesters Planned</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Tap the + button to create your first semester plan
            </Text>
          </View>
        )}

        {sortedPlans.map(plan => (
          <SemesterCard
            key={plan.id}
            plan={plan}
            isExpanded={expandedSemester === plan.id}
            onToggleExpand={handleToggleExpand}
            onRemove={handleRemoveSemester}
            onAddCourse={handleAddCourse}
            onRemoveCourse={removeCourseFromSemester}
            onSelectSection={handleSelectSection}
            courseMap={courseMap}
            offerings={offerings}
            completedCourses={completedCourses}
            inProgressCourses={inProgressCourses}
            arePrereqsMet={arePrereqsMet}
            getCourseStatus={getCourseStatus}
            getMissingPrereqs={getMissingPrereqs}
          />
        ))}

        <AppFooter />
      </ScrollView>

      <BottomSheet
        visible={showNewSemester}
        onClose={closeNewSemester}
        title="New Semester"
        subtitle="Choose a semester to plan"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          style={{ flexGrow: 0, flexShrink: 1 }}
        >
          {[2024, 2025, 2026, 2027, 2028].map(year => (
            <View key={year}>
              <Text style={[styles.yearLabel, { color: colors.textSecondary }]}>{year}</Text>
              <View style={styles.seasonRow}>
                {(['Fall', 'Spring', 'Summer'] as const).map(season => {
                  const exists = semesterPlans.some(p => p.season === season && p.year === year);
                  return (
                    <Pressable
                      key={`${season}-${year}`}
                      onPress={() => !exists && handleCreateSemester(season, year)}
                      style={[styles.seasonBtn, exists && styles.seasonBtnDisabled, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                      disabled={exists}
                    >
                      <Ionicons
                        name={season === 'Fall' ? 'leaf' : season === 'Spring' ? 'flower' : 'sunny'}
                        size={18}
                        color={exists ? colors.textMuted : season === 'Fall' ? '#F59E0B' :
                          season === 'Spring' ? '#10B981' : '#EF4444'}
                      />
                      <Text style={[styles.seasonBtnText, exists && styles.seasonBtnTextDisabled, { color: exists ? colors.textMuted : colors.text }]}>
                        {season}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </BottomSheet>

      <BottomSheet
        visible={!!showAddCourse}
        onClose={closeAddCourse}
        title="Add Course"
        subtitle={(() => {
          if (!showAddCourse) return undefined;
          const plan = semesterPlans.find(p => p.id === showAddCourse);
          if (!plan) return undefined;
          const used = getSemesterCredits(plan, courseMap);
          const max = getMaxCredits(plan.season);
          const remaining = max - used;
          return remaining > 0 ? `${remaining} credits remaining` : 'Credit limit reached';
        })()}
      >
        {showAddCourse && (() => {
          const currentPlan = semesterPlans.find(p => p.id === showAddCourse);
          const currentCredits = currentPlan ? getSemesterCredits(currentPlan, courseMap) : 0;
          const maxCredits = currentPlan ? getMaxCredits(currentPlan.season) : 18;
          const remainingCredits = maxCredits - currentCredits;
          return (
            <FlatList
              data={getAvailableForSemester(currentPlan!)}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              style={{ maxHeight: 500, flexShrink: 1 }}
              ListHeaderComponent={
                remainingCredits <= 0 ? (
                  <View style={[styles.creditCapBanner, { backgroundColor: Colors.danger + '15', borderColor: Colors.danger + '30' }]}>
                    <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                    <Text style={[styles.creditCapText, { color: Colors.danger }]}>Credit limit reached ({maxCredits}/{maxCredits})</Text>
                  </View>
                ) : null
              }
              renderItem={({ item }: { item: CourseWithPrereqs & { isRecommended?: boolean } }) => {
                const met = arePrereqsMet(item.id) || completedCourses.includes(item.id);
                const wouldExceed = item.credits > remainingCredits;
                const disabled = wouldExceed;
                return (
                  <Pressable
                    onPress={() => {
                      if (disabled) {
                        Alert.alert('Credit Limit', `Adding ${item.code} (${item.credits} cr) would exceed the ${maxCredits}-credit limit.`);
                        return;
                      }
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      addCourseToSemester(showAddCourse!, item.id);
                      setShowAddCourse(null);
                    }}
                    style={[styles.addCourseItem, (!met || disabled) && styles.addCourseItemLocked]}
                  >
                    <View style={styles.addCourseItemLeft}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.addCourseCode, { color: colors.textMuted }]}>{item.code}</Text>
                        {item.isRecommended && (
                          <View style={[styles.recommendedBadge, { backgroundColor: Colors.primary + '20' }]}>
                            <Ionicons name="star" size={10} color={Colors.primary} />
                            <Text style={[styles.recommendedText, { color: Colors.primary }]}>Recommended</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.addCourseTitle, { color: disabled ? colors.textMuted : colors.text }]}>{item.title}</Text>
                      {!met && (
                        <View style={styles.lockedRow}>
                          <Ionicons name="lock-closed" size={10} color={Colors.courseLocked} />
                          <Text style={styles.lockedText}>Prerequisites not met</Text>
                        </View>
                      )}
                      {wouldExceed && (
                        <View style={styles.lockedRow}>
                          <Ionicons name="alert-circle" size={10} color={Colors.danger} />
                          <Text style={[styles.lockedText, { color: Colors.danger }]}>Exceeds credit limit</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.addCourseCredits, { color: disabled ? Colors.danger : met ? colors.primary : colors.textMuted }]}>
                      {item.credits}cr
                    </Text>
                  </Pressable>
                );
              }}
            />
          );
        })()}
      </BottomSheet>

      <BottomSheet
        visible={!!showSelectSection}
        onClose={closeSelectSection}
        title="Select Section"
        subtitle={showSelectSection ? courseMap.get(showSelectSection.courseId)?.title : undefined}
      >
        {showSelectSection && (() => {
          const plan = semesterPlans.find(p => p.id === showSelectSection.planId);
          const semesterSeason = plan?.season;
          const availOfferings = getOfferingsForCourse(showSelectSection.courseId, semesterSeason);
          const currentSelection = plan?.selectedOfferings?.[showSelectSection.courseId];
          return (
            <FlatList
              data={availOfferings}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              style={{ maxHeight: 400, flexShrink: 1 }}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
                  <Text style={[styles.emptyTitle, { color: colors.text, fontSize: 15 }]}>No sections available</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textMuted, fontSize: 12 }]}>This course has no offerings for {semesterSeason}</Text>
                </View>
              }
              renderItem={({ item: off }) => {
                const isSelected = currentSelection === off.id;
                return (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedOffering(showSelectSection.planId, showSelectSection.courseId, off.id);
                      setShowSelectSection(null);
                    }}
                    style={[styles.sectionItem, isSelected && { backgroundColor: Colors.primary + '12', borderColor: Colors.primary + '40' }, { borderColor: colors.cardBorder }]}
                  >
                    <View style={styles.sectionLeft}>
                      <View style={styles.sectionBadgeRow}>
                        <View style={[styles.sectionBadge, { backgroundColor: Colors.primary + '20' }]}>
                          <Text style={[styles.sectionBadgeText, { color: Colors.primary }]}>Sec {off.section}</Text>
                        </View>
                        {isSelected && (
                          <View style={[styles.sectionBadge, { backgroundColor: '#10B98120' }]}>
                            <Ionicons name="checkmark" size={12} color="#10B981" />
                            <Text style={[styles.sectionBadgeText, { color: '#10B981' }]}>Selected</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.sectionDetailRow}>
                        <Ionicons name="person-outline" size={13} color={colors.textSecondary} />
                        <Text style={[styles.sectionDetailText, { color: colors.text }]}>{off.instructor}</Text>
                      </View>
                      <View style={styles.sectionDetailRow}>
                        <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                        <Text style={[styles.sectionDetailText, { color: colors.text }]}>{off.dayOfWeek} {off.startTime} – {off.endTime}</Text>
                      </View>
                      <View style={styles.sectionDetailRow}>
                        <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                        <Text style={[styles.sectionDetailText, { color: colors.text }]}>{off.room} · {off.campus}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              }}
            />
          );
        })()}
      </BottomSheet>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    fontFamily: 'Inter_700Bold',
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  creditSummary: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  creditSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  creditSummaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.cardBorder,
  },
  creditSummaryValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    fontFamily: 'Inter_700Bold',
  },
  creditSummaryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '75%',
  },
  modalSheetTall: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHandleHitArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    marginBottom: 16,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.cardBorder,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginBottom: 16,
  },
  yearLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 10,
    marginBottom: 8,
  },
  seasonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  seasonBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  seasonBtnDisabled: {
    opacity: 0.4,
  },
  seasonBtnText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text,
    fontFamily: 'Inter_500Medium',
  },
  seasonBtnTextDisabled: {
    color: Colors.textMuted,
  },
  addCourseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder + '50',
  },
  addCourseItemLocked: {
    opacity: 0.6,
  },
  addCourseItemLeft: {
    flex: 1,
  },
  addCourseCode: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  addCourseTitle: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },
  addCourseCredits: {
    fontSize: 13,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  lockedText: {
    fontSize: 10,
    color: Colors.courseLocked,
    fontFamily: 'Inter_400Regular',
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  creditCapBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  creditCapText: {
    fontSize: 12,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
  },
  sectionItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  sectionLeft: {
    flex: 1,
    gap: 6,
  },
  sectionBadgeRow: {
    flexDirection: 'row' as const,
    gap: 6,
    marginBottom: 4,
  },
  sectionBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
  },
  sectionDetailRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  sectionDetailText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
