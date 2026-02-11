import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
  ActivityIndicator, Modal, FlatList, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useAcademic } from '@/lib/academic-context';
import type { SemesterPlan, CourseWithPrereqs } from '@shared/schema';
import { BottomSheet } from '@/components/BottomSheet';

export default function PlannerScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile, courses, isLoading,
    addSemesterPlan, removeSemesterPlan,
    addCourseToSemester, removeCourseFromSemester,
    getCourseStatus, arePrereqsMet, getMissingPrereqs,
  } = useAcademic();

  const [showNewSemester, setShowNewSemester] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState<string | null>(null);
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);
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

  const detectConflicts = (plan: SemesterPlan): string[] => {
    const warnings: string[] = [];
    const credits = getSemesterCredits(plan);
    if (credits > 18) warnings.push(`Heavy load: ${credits} credits (max recommended: 18)`);
    if (credits > 21) warnings.push(`Overload: ${credits} credits exceeds maximum`);

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
    return warnings;
  };

  const handleCreateSemester = (season: 'Fall' | 'Spring' | 'Summer', year: number) => {
    const id = Crypto.randomUUID();
    addSemesterPlan({
      id,
      name: `${season} ${year}`,
      season,
      year,
      courseIds: [],
    });
    setShowNewSemester(false);
    setExpandedSemester(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

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
      <View style={[styles.loadingContainer, { paddingTop: insets.top + webTopInset }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const sortedPlans = [...profile.semesterPlans].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const order = { Fall: 0, Spring: 1, Summer: 2 };
    return order[a.season] - order[b.season];
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 12 }]}>
        <View>
          <Text style={styles.headerTitle}>Semester Planner</Text>
          <Text style={styles.headerSubtitle}>{sortedPlans.length} semester{sortedPlans.length !== 1 ? 's' : ''} planned</Text>
        </View>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === 'web' ? 34 + 84 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {sortedPlans.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Semesters Planned</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to create your first semester plan
            </Text>
          </View>
        )}

        {sortedPlans.map(plan => {
          const credits = getSemesterCredits(plan);
          const warnings = detectConflicts(plan);
          const isExpanded = expandedSemester === plan.id;

          return (
            <View key={plan.id} style={styles.semesterCard}>
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
                    <Text style={styles.semesterName}>{plan.name}</Text>
                    <Text style={styles.semesterMeta}>
                      {plan.courseIds.length} course{plan.courseIds.length !== 1 ? 's' : ''} · {credits} credits
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
                    color={Colors.textMuted}
                  />
                </View>
              </Pressable>

              {isExpanded && (
                <View style={styles.semesterBody}>
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
                    return (
                      <View key={courseId} style={styles.plannedCourse}>
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
                            <Text style={styles.courseCode}>{course.code}</Text>
                            <Text style={styles.courseTitle} numberOfLines={1}>{course.title}</Text>
                          </View>
                          <Text style={styles.courseCredits}>{course.credits}cr</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            removeCourseFromSemester(plan.id, courseId);
                          }}
                        >
                          <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
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
              <Text style={styles.yearLabel}>{year}</Text>
              <View style={styles.seasonRow}>
                {(['Fall', 'Spring', 'Summer'] as const).map(season => {
                  const exists = profile.semesterPlans.some(p => p.season === season && p.year === year);
                  return (
                    <Pressable
                      key={`${season}-${year}`}
                      onPress={() => !exists && handleCreateSemester(season, year)}
                      style={[styles.seasonBtn, exists && styles.seasonBtnDisabled]}
                      disabled={exists}
                    >
                      <Ionicons
                        name={season === 'Fall' ? 'leaf' : season === 'Spring' ? 'flower' : 'sunny'}
                        size={18}
                        color={exists ? Colors.textMuted : season === 'Fall' ? '#F59E0B' :
                          season === 'Spring' ? '#10B981' : '#EF4444'}
                      />
                      <Text style={[styles.seasonBtnText, exists && styles.seasonBtnTextDisabled]}>
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
      >
        {showAddCourse && (
          <FlatList
            data={getAvailableForSemester(profile.semesterPlans.find(p => p.id === showAddCourse)!)}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            style={{ maxHeight: 500, flexShrink: 1 }}
            renderItem={({ item }) => {
              const met = arePrereqsMet(item.id) || profile.completedCourses.includes(item.id);
              return (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    addCourseToSemester(showAddCourse!, item.id);
                    setShowAddCourse(null);
                  }}
                  style={[styles.addCourseItem, !met && styles.addCourseItemLocked]}
                >
                  <View style={styles.addCourseItemLeft}>
                    <Text style={styles.addCourseCode}>{item.code}</Text>
                    <Text style={styles.addCourseTitle}>{item.title}</Text>
                    {!met && (
                      <View style={styles.lockedRow}>
                        <Ionicons name="lock-closed" size={10} color={Colors.courseLocked} />
                        <Text style={styles.lockedText}>Prerequisites not met</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.addCourseCredits, { color: met ? Colors.primary : Colors.textMuted }]}>
                    {item.credits}cr
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
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
});
