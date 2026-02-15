import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
  ActivityIndicator, Modal, FlatList, Alert, Share
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useTheme } from '@/lib/theme-context';
import { AppFooter } from '@/components/AppFooter';
import { useAcademic } from '@/lib/academic-context';
import type { SemesterPlan, CourseWithPrereqs } from '@shared/schema';
import type { OfflineOffering } from '@/lib/offline-data';
import { BottomSheet } from '@/components/BottomSheet';
import { useConfirm } from '@/lib/confirm-context';

const FALL_SPRING_MAX_CREDITS = 18;
const SUMMER_MAX_CREDITS = 9;

const getMaxCredits = (season: string) => {
  return season === 'Summer' ? SUMMER_MAX_CREDITS : FALL_SPRING_MAX_CREDITS;
};

export default function PlannerScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile, semesterPlans, completedCourses, inProgressCourses, courses, offerings, isLoading,
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

  const getSeasonOrder = (season: string) => {
    switch (season) {
      case 'Spring': return 0;
      case 'Summer': return 1;
      case 'Fall': return 2;
      default: return 3;
    }
  };

  const getSemesterCredits = (plan: SemesterPlan) => {
    return plan.courseIds.reduce((sum, id) => {
      const course = courseMap.get(id);
      return sum + (course?.credits ?? 0);
    }, 0);
  };

  const parseTime = (t: string): number => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const getDays = (dayOfWeek: string): string[] => {
    const map: Record<string, string[]> = {
      'MWF': ['M', 'W', 'F'], 'TTh': ['T', 'Th'], 'MW': ['M', 'W'],
      'M': ['M'], 'T': ['T'], 'W': ['W'], 'Th': ['Th'], 'F': ['F'],
    };
    return map[dayOfWeek] || [dayOfWeek];
  };

  const detectConflicts = (plan: SemesterPlan): string[] => {
    const warnings: string[] = [];
    const credits = getSemesterCredits(plan);

    // Hard credit cap
    const maxCredits = getMaxCredits(plan.season);
    if (credits > maxCredits) {
      warnings.push(`⚠️ Exceeds limit: ${credits}/${maxCredits} credits`);
    }

    // Prerequisite checks
    for (const courseId of plan.courseIds) {
      if (!arePrereqsMet(courseId) && !completedCourses.includes(courseId)) {
        const missing = getMissingPrereqs(courseId);
        const inThisSemester = missing.filter(m => plan.courseIds.includes(m.id));
        const trulyMissing = missing.filter(m => !plan.courseIds.includes(m.id) && !completedCourses.includes(m.id));
        if (trulyMissing.length > 0) {
          const course = courseMap.get(courseId);
          warnings.push(`${course?.code}: Missing prereqs - ${trulyMissing.map(m => m.code).join(', ')}`);
        }
        if (inThisSemester.length > 0) {
          const course = courseMap.get(courseId);
          warnings.push(`${course?.code}: Corequisite with ${inThisSemester.map(m => m.code).join(', ')} (same semester)`);
        }
      }
    }

    // Corequisite checks — must be in the same semester or already completed
    const coreqWarned = new Set<string>();
    for (const courseId of plan.courseIds) {
      const course = courseMap.get(courseId);
      if (!course?.corequisites?.length) continue;
      for (const coreqId of course.corequisites) {
        const pairKey = [courseId, coreqId].sort().join('-');
        if (coreqWarned.has(pairKey)) continue;
        // Check if coreq is missing from plan and not previously completed
        if (!plan.courseIds.includes(coreqId) && !completedCourses.includes(coreqId) && !inProgressCourses.includes(coreqId)) {
          const coreqCourse = courseMap.get(coreqId);
          warnings.push(`📋 ${course.code}: Missing corequisite ${coreqCourse?.code || coreqId} (must take together)`);
          coreqWarned.add(pairKey);
        }
      }
    }

    // Time conflict detection
    if (plan.selectedOfferings) {
      const selected = Object.entries(plan.selectedOfferings)
        .map(([cid, oid]) => {
          const off = offerings.find(o => o.id === oid);
          return off ? { courseId: cid, offering: off } : null;
        })
        .filter(Boolean) as { courseId: string; offering: OfflineOffering }[];

      for (let i = 0; i < selected.length; i++) {
        for (let j = i + 1; j < selected.length; j++) {
          const a = selected[i], b = selected[j];
          const aDays = getDays(a.offering.dayOfWeek);
          const bDays = getDays(b.offering.dayOfWeek);
          const sharedDays = aDays.filter(d => bDays.includes(d));
          if (sharedDays.length > 0) {
            const aStart = parseTime(a.offering.startTime), aEnd = parseTime(a.offering.endTime);
            const bStart = parseTime(b.offering.startTime), bEnd = parseTime(b.offering.endTime);
            if (aStart < bEnd && bStart < aEnd) {
              const cA = courseMap.get(a.courseId), cB = courseMap.get(b.courseId);
              warnings.push(`🕐 ${cA?.code} & ${cB?.code}: Time conflict on ${sharedDays.join('/')} ${a.offering.startTime}-${a.offering.endTime}`);
            }
          }
        }
      }
    }

    return warnings;
  };

  // Calculate a difficulty score (1-5) based on course mix and load
  const getDifficulty = (plan: SemesterPlan): number => {
    const coursesInPlan = plan.courseIds.map(id => courseMap.get(id)).filter(Boolean) as CourseWithPrereqs[];
    if (coursesInPlan.length === 0) return 0;

    // Base: average year level
    const avgYear = coursesInPlan.reduce((sum, c) => sum + c.year, 0) / coursesInPlan.length;
    let diff = avgYear;

    // Math-heavy penalty
    const mathCount = coursesInPlan.filter(c => c.category === 'Mathematics' || (c.category === 'Foundation' && c.code.startsWith('MATH'))).length;
    if (mathCount >= 3) diff += 1.5;
    else if (mathCount >= 2) diff += 0.5;

    // STEM-heavy penalty
    const stemCats = ['Electrical Engineering', 'Computer Engineering', 'Computer Science'];
    const stemCount = coursesInPlan.filter(c => stemCats.includes(c.category)).length;
    if (stemCount >= 4) diff += 1;

    // Lab-heavy penalty
    const labCount = coursesInPlan.filter(c => c.credits === 1).length;
    if (labCount >= 3) diff += 0.5;

    // Credit load factor 
    const credits = getSemesterCredits(plan);
    const maxCredits = getMaxCredits(plan.season);
    const heavyLoad = plan.season === 'Summer' ? 7 : 16;

    if (credits > maxCredits) diff += 1.5;
    else if (credits >= heavyLoad) diff += 0.5;

    return Math.min(5, Math.max(1, Math.round(diff)));
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



  const handleRemoveSemester = async (planId: string) => {
    if (await confirm({
      title: 'Remove Semester',
      message: 'Are you sure you want to remove this semester plan?',
      confirmText: 'Remove',
      variant: 'danger',
    })) {
      removeSemesterPlan(planId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

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
                  const credits = getSemesterCredits(plan);
                  lines.push(`${plan.name} (${credits} credits)`);
                  plan.courseIds.forEach(id => {
                    const course = courseMap.get(id);
                    if (course) {
                      lines.push(`  - ${course.code}: ${course.title} (${course.credits} cr)`);
                    }
                  });
                  lines.push('');
                });
                const totalCredits = sortedPlans.reduce((sum, p) => sum + getSemesterCredits(p), 0);
                lines.push(`Total: ${totalCredits} credits across ${sortedPlans.length} semester(s)`);
                const text = lines.join('\n');
                try {
                  await Share.share({ message: text });
                } catch (e) {
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
                {sortedPlans.reduce((sum, p) => sum + getSemesterCredits(p), 0)}
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
                {sortedPlans.length > 0 ? Math.round(sortedPlans.reduce((sum, p) => sum + getSemesterCredits(p), 0) / sortedPlans.length) : 0}
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

        {sortedPlans.map(plan => {
          const credits = getSemesterCredits(plan);
          const warnings = detectConflicts(plan);
          const isExpanded = expandedSemester === plan.id;

          return (
            <View key={plan.id} style={[styles.semesterCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setExpandedSemester(isExpanded ? null : plan.id);
                }}
                style={styles.semesterHeader}
                accessibilityRole="button"
                accessibilityLabel={`${plan.name}, ${plan.courseIds.length} courses, ${credits} credits`}
                accessibilityHint={isExpanded ? "Double tap to collapse" : "Double tap to expand"}
                accessibilityState={{ expanded: isExpanded }}
              >
                <View style={styles.semesterInfo}>
                  <View style={[styles.seasonBadge, {
                    backgroundColor: plan.season === 'Fall' ? '#F59E0B20' :
                      plan.season === 'Spring' ? '#10B98120' : '#EF444420'
                  }]}>
                    <Ionicons
                      name={plan.season === 'Fall' ? 'leaf' : plan.season === 'Spring' ? 'flower' : 'sunny'}
                      size={14}
                      color={plan.season === 'Fall' ? '#F59E0B' :
                        plan.season === 'Spring' ? '#10B981' : '#EF4444'}
                    />
                  </View>
                  <View>
                    <Text style={[styles.semesterName, { color: colors.text }]}>{plan.name}</Text>
                    <Text style={[styles.semesterMeta, { color: colors.textSecondary }]}>
                      {plan.courseIds.length} course{plan.courseIds.length !== 1 ? 's' : ''} · <Text style={{ color: credits > getMaxCredits(plan.season) ? Colors.danger : credits > (plan.season === 'Summer' ? 6 : 15) ? Colors.warning : colors.textSecondary, fontWeight: credits > (plan.season === 'Summer' ? 6 : 15) ? '700' : '400' }}>{credits}/{getMaxCredits(plan.season)} credits</Text>
                    </Text>
                  </View>
                </View>
                <View style={styles.semesterActions}>
                  {warnings.length > 0 && (
                    <View style={styles.warningBadge}>
                      <Ionicons name="warning" size={14} color={Colors.warning} />
                    </View>
                  )}
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textMuted}
                  />
                </View>
              </Pressable>

              {isExpanded && (
                <View style={[styles.semesterBody, { borderTopColor: colors.cardBorder }]}>
                  {(() => {
                    const maxCredits = getMaxCredits(plan.season);
                    const heavyLoad = plan.season === 'Summer' ? 7 : 15;
                    // Lower threshold for "Light load" in summer (e.g., < 4) or keep simple?
                    // Let's scale it slightly: < 15/18 is ~83%. < 7/9 is ~77%. 
                    const lightLoad = plan.season === 'Summer' ? 4 : 15;

                    const creditColor = credits < lightLoad ? '#10B981' : credits <= maxCredits ? '#0EA5E9' : '#EF4444';
                    const creditLabel = credits < lightLoad ? 'Light load' : credits <= maxCredits ? 'Normal load' : 'Over limit!';

                    const difficulty = getDifficulty(plan);

                    const coursesInPlan = plan.courseIds.map(id => courseMap.get(id)).filter(Boolean) as CourseWithPrereqs[];
                    const coursesWithPrereqs = coursesInPlan.filter(c => c.prerequisites.length > 0);
                    const coursesWithMetPrereqs = coursesWithPrereqs.filter(c =>
                      arePrereqsMet(c.id) || completedCourses.includes(c.id)
                    );
                    const allMet = coursesWithPrereqs.length === 0 || coursesWithMetPrereqs.length === coursesWithPrereqs.length;
                    const unmetCount = coursesWithPrereqs.length - coursesWithMetPrereqs.length;

                    return (
                      <View style={[styles.summaryCard, { backgroundColor: colors.backgroundTertiary, borderColor: colors.cardBorder }]}>
                        <View style={styles.summaryRow}>
                          <View style={styles.summaryItem}>
                            <View style={[styles.summaryIconWrap, { backgroundColor: creditColor + '20' }]}>
                              <Ionicons name="school-outline" size={16} color={creditColor} />
                            </View>
                            <Text style={[styles.summaryValue, { color: creditColor }]}>{credits}</Text>
                            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{creditLabel}</Text>
                          </View>

                          <View style={[styles.summaryDivider, { backgroundColor: colors.cardBorder }]} />

                          <View style={styles.summaryItem}>
                            <View style={[styles.summaryIconWrap, { backgroundColor: '#A855F720' }]}>
                              <Ionicons name="speedometer-outline" size={16} color="#A855F7" />
                            </View>
                            <View style={styles.difficultyDots}>
                              {[1, 2, 3, 4, 5].map(dot => (
                                <View
                                  key={dot}
                                  style={[
                                    styles.difficultyDot,
                                    { backgroundColor: dot <= difficulty ? '#A855F7' : colors.cardBorder },
                                  ]}
                                />
                              ))}
                            </View>
                            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Difficulty</Text>
                          </View>

                          <View style={[styles.summaryDivider, { backgroundColor: colors.cardBorder }]} />

                          <View style={styles.summaryItem}>
                            {allMet ? (
                              <>
                                <View style={[styles.summaryIconWrap, { backgroundColor: '#10B98120' }]}>
                                  <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
                                </View>
                                <Text style={[styles.summaryValue, { color: '#10B981', fontSize: 11 }]}>All met</Text>
                                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Prerequisites</Text>
                              </>
                            ) : (
                              <>
                                <View style={[styles.summaryIconWrap, { backgroundColor: '#F59E0B20' }]}>
                                  <Ionicons name="warning-outline" size={16} color="#F59E0B" />
                                </View>
                                <Text style={[styles.summaryValue, { color: '#F59E0B', fontSize: 11 }]}>
                                  {unmetCount}/{coursesWithPrereqs.length}
                                </Text>
                                <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Unmet prereqs</Text>
                              </>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })()}

                  {warnings.length > 0 && (
                    <View style={styles.warningsContainer}>
                      {warnings.map((w, i) => (
                        <View key={i} style={styles.warningRow}>
                          <Ionicons name="alert-circle" size={14} color={Colors.warning} />
                          <Text style={styles.warningText}>{w}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {plan.courseIds.map(courseId => {
                    const course = courseMap.get(courseId);
                    if (!course) return null;
                    const status = getCourseStatus(courseId);
                    const selectedOfferingId = plan.selectedOfferings?.[courseId];
                    const selectedOffering = selectedOfferingId ? offerings.find(o => o.id === selectedOfferingId) : null;
                    return (
                      <View key={courseId} style={[styles.plannedCourse, { borderBottomColor: colors.cardBorder + '50' }]}>
                        <View style={{ flex: 1 }}>
                          <Pressable
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              router.push({ pathname: '/course/[id]', params: { id: courseId } });
                            }}
                            style={styles.plannedCourseInfo}
                          >
                            <View style={[styles.courseDot, {
                              backgroundColor: status === 'completed' ? Colors.courseCompleted :
                                status === 'in_progress' ? Colors.courseInProgress : Colors.primary
                            }]} />
                            <View style={styles.courseTextContainer}>
                              <Text style={[styles.courseCode, { color: colors.textMuted }]}>{course.code}</Text>
                              <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={1}>{course.title}</Text>
                            </View>
                            <Text style={[styles.courseCredits, { color: colors.primary }]}>{course.credits}cr</Text>
                          </Pressable>
                          {selectedOffering ? (
                            <Pressable
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setShowSelectSection({ planId: plan.id, courseId });
                              }}
                              style={[styles.offeringInfo, { backgroundColor: colors.backgroundTertiary }]}
                            >
                              <Ionicons name="person-outline" size={11} color={colors.textMuted} />
                              <Text style={[styles.offeringText, { color: colors.textSecondary }]} numberOfLines={1}>
                                {selectedOffering.instructor} · Sec {selectedOffering.section} · {selectedOffering.dayOfWeek} {selectedOffering.startTime}-{selectedOffering.endTime} · {selectedOffering.room}
                              </Text>
                              <Ionicons name="swap-horizontal" size={12} color={colors.textMuted} />
                            </Pressable>
                          ) : (
                            <Pressable
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setShowSelectSection({ planId: plan.id, courseId });
                              }}
                              style={[styles.offeringInfo, { backgroundColor: Colors.primary + '10', borderWidth: 1, borderColor: Colors.primary + '30', borderStyle: 'dashed' }]}
                            >
                              <Ionicons name="time-outline" size={11} color={Colors.primary} />
                              <Text style={[styles.offeringText, { color: Colors.primary, fontWeight: '500' }]}>Select section</Text>
                            </Pressable>
                          )}
                        </View>
                        <Pressable
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            removeCourseFromSemester(plan.id, courseId);
                          }}
                          style={{ paddingLeft: 8, alignSelf: 'flex-start', paddingTop: 4 }}
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${course.code}`}
                          accessibilityHint="Removes this course from the semester"
                        >
                          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                        </Pressable>
                      </View>
                    );
                  })}

                  <View style={styles.semesterFooter}>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowAddCourse(plan.id);
                      }}
                      style={styles.addCourseBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Add course"
                      accessibilityHint={`Adds a course to ${plan.name}`}
                    >
                      <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
                      <Text style={styles.addCourseText}>Add Course</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleRemoveSemester(plan.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${plan.name} semester`}
                      accessibilityHint="Deletes this semester plan"
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          );
        })}

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
          const used = getSemesterCredits(plan);
          const max = getMaxCredits(plan.season);
          const remaining = max - used;
          return remaining > 0 ? `${remaining} credits remaining` : 'Credit limit reached';
        })()}
      >
        {showAddCourse && (() => {
          const currentPlan = semesterPlans.find(p => p.id === showAddCourse);
          const currentCredits = currentPlan ? getSemesterCredits(currentPlan) : 0;
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
  semesterCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  semesterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  semesterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  seasonBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  semesterName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
  },
  semesterMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  semesterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  semesterBody: {
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    padding: 16,
    paddingTop: 12,
  },
  warningsContainer: {
    backgroundColor: Colors.warning + '10',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  warningText: {
    fontSize: 12,
    color: Colors.warning,
    fontFamily: 'Inter_400Regular',
    flex: 1,
    lineHeight: 16,
  },
  plannedCourse: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder + '50',
  },
  plannedCourseInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  courseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  courseTextContainer: {
    flex: 1,
  },
  courseCode: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  courseTitle: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Inter_500Medium',
  },
  courseCredits: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 8,
  },
  semesterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  addCourseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addCourseText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
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
  summaryCard: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.cardBorder,
  },
  difficultyDots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  offeringInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    marginLeft: 20,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  offeringText: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    flex: 1,
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
