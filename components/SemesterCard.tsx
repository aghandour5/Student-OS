import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useTheme } from '@/lib/theme-context';
import type { SemesterPlan, CourseWithPrereqs } from '@shared/schema';
import type { OfflineOffering } from '@/lib/offline-data';
import {
  getMaxCredits,
  getSemesterCredits,
  detectConflicts,
  getDifficulty
} from '@/lib/planner-utils';

type CourseStatus = 'completed' | 'in_progress' | 'available' | 'locked' | 'future';

interface SemesterCardProps {
  plan: SemesterPlan;
  isExpanded: boolean;
  onToggleExpand: (planId: string) => void;
  onRemove: (planId: string) => void;
  onAddCourse: (planId: string) => void;
  onRemoveCourse: (planId: string, courseId: string) => void;
  onSelectSection: (planId: string, courseId: string) => void;
  courseMap: Map<string, CourseWithPrereqs>;
  offerings: OfflineOffering[];
  completedCourses: string[];
  inProgressCourses: string[];
  arePrereqsMet: (id: string) => boolean;
  getCourseStatus: (id: string) => CourseStatus;
  getMissingPrereqs: (id: string) => CourseWithPrereqs[];
}

export const SemesterCard = React.memo(function SemesterCard({
  plan,
  isExpanded,
  onToggleExpand,
  onRemove,
  onAddCourse,
  onRemoveCourse,
  onSelectSection,
  courseMap,
  offerings,
  completedCourses,
  inProgressCourses,
  arePrereqsMet,
  getCourseStatus,
  getMissingPrereqs
}: SemesterCardProps) {
  const { colors } = useTheme();

  const credits = useMemo(() => getSemesterCredits(plan, courseMap), [plan, courseMap]);

  const warnings = useMemo(() =>
    detectConflicts(plan, courseMap, completedCourses, inProgressCourses, offerings, arePrereqsMet, getMissingPrereqs),
    [plan, courseMap, completedCourses, inProgressCourses, offerings, arePrereqsMet, getMissingPrereqs]
  );

  const difficulty = useMemo(() => getDifficulty(plan, courseMap), [plan, courseMap]);

  return (
    <View style={[styles.semesterCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggleExpand(plan.id);
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
            const lightLoad = plan.season === 'Summer' ? 4 : 15;

            const creditColor = credits < lightLoad ? '#10B981' : credits <= maxCredits ? '#0EA5E9' : '#EF4444';
            const creditLabel = credits < lightLoad ? 'Light load' : credits <= maxCredits ? 'Normal load' : 'Over limit!';

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
                        onSelectSection(plan.id, courseId);
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
                        onSelectSection(plan.id, courseId);
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
                    onRemoveCourse(plan.id, courseId);
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
                onAddCourse(plan.id);
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
              onPress={() => onRemove(plan.id)}
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
});

const styles = StyleSheet.create({
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
});
