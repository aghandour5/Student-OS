import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
  ActivityIndicator, Modal, FlatList, Alert, Share
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useTheme } from '@/lib/theme-context';
import { useAcademic } from '@/lib/academic-context';
import type { SemesterPlan, CourseWithPrereqs } from '@shared/schema';
import type { OfflineOffering } from '@/lib/offline-data';
import { BottomSheet } from '@/components/BottomSheet';

const MAX_CREDITS = 18;

export default function PlannerScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile, courses, offerings, isLoading,
    addSemesterPlan, removeSemesterPlan,
    addCourseToSemester, removeCourseFromSemester,
    setSelectedOffering, getOfferingsForCourse,
    getCourseStatus, arePrereqsMet, getMissingPrereqs,
  } = useAcademic();
  const { colors } = useTheme();

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
    profile.semesterPlans.forEach(p => p.courseIds.forEach(id => ids.add(id)));
    return ids;
  }, [profile.semesterPlans]);

  const getAvailableForSemester = (plan: SemesterPlan) => {
    return courses.filter(c => {
      if (allAssignedCourseIds.has(c.id)) return false;
      if (profile.completedCourses.includes(c.id)) return false;
      return true;
    });
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
    if (credits > MAX_CREDITS) {
      warnings.push(`⚠️ Exceeds limit: ${credits}/${MAX_CREDITS} credits`);
    }

    // Prerequisite checks
    for (const courseId of plan.courseIds) {
      if (!arePrereqsMet(courseId) && !profile.completedCourses.includes(courseId)) {
        const missing = getMissingPrereqs(courseId);
        const inThisSemester = missing.filter(m => plan.courseIds.includes(m.id));
        const trulyMissing = missing.filter(m => !plan.courseIds.includes(m.id) && !profile.completedCourses.includes(m.id));
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

  const getDifficulty = (plan: SemesterPlan): number => {
    const coursesInPlan = plan.courseIds.map(id => courseMap.get(id)).filter(Boolean) as CourseWithPrereqs[];
    if (coursesInPlan.length === 0) return 0;

    // Base: average year level
    const avgYear = coursesInPlan.reduce((sum, c) => sum + c.year, 0) / coursesInPlan.length;
    let diff = avgYear;

    // Math-heavy penalty
    const mathCount = coursesInPlan.filter(c => c.category === 'Mathematics' || c.category === 'Foundation' && c.code.startsWith('MATH')).length;
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
    if (credits > MAX_CREDITS) diff += 1.5;
    else if (credits >= 16) diff += 0.5;

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



  const handleRemoveSemester = (planId: string) => {
    Alert.alert(
      'Remove Semester',
      'Are you sure you want to remove this semester plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeSemesterPlan(planId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top + webTopInset, backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const sortedPlans = [...profile.semesterPlans].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const order = { Fall: 0, Spring: 1, Summer: 2 };
    return order[a.season] - order[b.season];
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
                      {plan.courseIds.length} course{plan.courseIds.length !== 1 ? 's' : ''} · <Text style={{ color: credits > MAX_CREDITS ? Colors.danger : credits > 15 ? Colors.warning : colors.textSecondary, fontWeight: credits > 15 ? '700' : '400' }}>{credits}/{MAX_CREDITS} credits</Text>
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
                    const creditColor = credits < 15 ? '#10B981' : credits <= MAX_CREDITS ? '#0EA5E9' : '#EF4444';
                    const creditLabel = credits < 15 ? 'Light load' : credits <= MAX_CREDITS ? 'Normal load' : 'Over limit!';

                    const difficulty = getDifficulty(plan);

                    const coursesInPlan = plan.courseIds.map(id => courseMap.get(id)).filter(Boolean) as CourseWithPrereqs[];
                    const coursesWithPrereqs = coursesInPlan.filter(c => c.prerequisites.length > 0);
                    const coursesWithMetPrereqs = coursesWithPrereqs.filter(c =>
                      arePrereqsMet(c.id) || profile.completedCourses.includes(c.id)
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
                    >
                      <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
                      <Text style={styles.addCourseText}>Add Course</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleRemoveSemester(plan.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          );
        })}
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
                  const exists = profile.semesterPlans.some(p => p.season === season && p.year === year);
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
          const plan = profile.semesterPlans.find(p => p.id === showAddCourse);
          if (!plan) return undefined;
          const used = getSemesterCredits(plan);
          const remaining = MAX_CREDITS - used;
          return remaining > 0 ? `${remaining} credits remaining` : 'Credit limit reached';
        })()}
      >
        {showAddCourse && (() => {
          const currentPlan = profile.semesterPlans.find(p => p.id === showAddCourse);
          const currentCredits = currentPlan ? getSemesterCredits(currentPlan) : 0;
          const remainingCredits = MAX_CREDITS - currentCredits;
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
                    <Text style={[styles.creditCapText, { color: Colors.danger }]}>Credit limit reached ({MAX_CREDITS}/{MAX_CREDITS})</Text>
                  </View>
                ) : null
              }
              renderItem={({ item }) => {
                const met = arePrereqsMet(item.id) || profile.completedCourses.includes(item.id);
                const wouldExceed = item.credits > remainingCredits;
                const disabled = wouldExceed;
                return (
                  <Pressable
                    onPress={() => {
                      if (disabled) {
                        Alert.alert('Credit Limit', `Adding ${item.code} (${item.credits} cr) would exceed the ${MAX_CREDITS}-credit limit.`);
                        return;
                      }
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      addCourseToSemester(showAddCourse!, item.id);
                      setShowAddCourse(null);
                    }}
                    style={[styles.addCourseItem, (!met || disabled) && styles.addCourseItemLocked]}
                  >
                    <View style={styles.addCourseItemLeft}>
                      <Text style={[styles.addCourseCode, { color: colors.textMuted }]}>{item.code}</Text>
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
          const plan = profile.semesterPlans.find(p => p.id === showSelectSection.planId);
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
