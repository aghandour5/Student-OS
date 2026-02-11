import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
  ActivityIndicator, TextInput, Modal, Keyboard, FlatList
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, SlideInDown, SlideOutDown, FadeIn, FadeOut } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useAcademic } from '@/lib/academic-context';
import { GRADE_POINTS, getLetterGrade } from '@shared/schema';

const clampScore = (score: number) => Math.max(0, Math.min(100, score));
const scoreToLetterGrade = (score: number) => getLetterGrade(clampScore(score));

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile, courses, isLoading,
    setGrade, removeGrade, calculateGPA, calculateSemesterGPA,
    completedCredits, totalCredits, getCourseStatus,
    toggleCourseCompleted, toggleCourseInProgress, resetProfile,
  } = useAcademic();

  const [activeTab, setActiveTab] = useState<'gpa' | 'projection' | 'whatif'>('gpa');
  const [projectionCourse, setProjectionCourse] = useState<string | null>(null);
  const [projWeights, setProjWeights] = useState({ quizzes: '20', midterm: '30', final: '50' });
  const [projScores, setProjScores] = useState({ quizzes: '', midterm: '', final: '' });
  const [gradeModal, setGradeModal] = useState<string | null>(null);
  const [numericScoreInput, setNumericScoreInput] = useState('');
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [showManage, setShowManage] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const courseMap = useMemo(() => {
    const map = new Map<string, any>();
    courses.forEach(c => map.set(c.id, c));
    return map;
  }, [courses]);

  const gpa = calculateGPA();
  const gradesByCategory = useMemo(() => {
    const grouped = new Map<string, typeof profile.grades>();
    profile.grades.forEach(g => {
      const course = courseMap.get(g.courseId);
      if (!course) return;
      const cat = course.category;
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(g);
    });
    return grouped;
  }, [profile.grades, courseMap]);

  const projectionResult = useMemo(() => {
    const qW = parseFloat(projWeights.quizzes) / 100 || 0;
    const mW = parseFloat(projWeights.midterm) / 100 || 0;
    const fW = parseFloat(projWeights.final) / 100 || 0;
    const qS = parseFloat(projScores.quizzes) || 0;
    const mS = parseFloat(projScores.midterm) || 0;
    const fS = parseFloat(projScores.final) || 0;

    if (qS === 0 && mS === 0 && fS === 0) return null;

    const totalWeight = qW + mW + fW;
    if (totalWeight === 0) return null;

    const weighted = (qS * qW + mS * mW + fS * fW) / totalWeight;
    let letterGrade = 'F';
    if (weighted >= 93) letterGrade = 'A';
    else if (weighted >= 90) letterGrade = 'A-';
    else if (weighted >= 87) letterGrade = 'B+';
    else if (weighted >= 83) letterGrade = 'B';
    else if (weighted >= 80) letterGrade = 'B-';
    else if (weighted >= 77) letterGrade = 'C+';
    else if (weighted >= 73) letterGrade = 'C';
    else if (weighted >= 70) letterGrade = 'C-';
    else if (weighted >= 67) letterGrade = 'D+';
    else if (weighted >= 63) letterGrade = 'D';
    else if (weighted >= 60) letterGrade = 'D-';

    return { score: weighted, grade: letterGrade };
  }, [projWeights, projScores]);

  const targetGPAResult = useMemo(() => {
    if (profile.grades.length === 0) return null;
    const targetGPA = 3.5;
    const currentPoints = profile.grades.reduce((sum, g) => {
      const course = courseMap.get(g.courseId);
      return sum + (GRADE_POINTS[g.grade] ?? 0) * (course?.credits ?? 0);
    }, 0);
    const currentCredits = profile.grades.reduce((sum, g) => {
      const course = courseMap.get(g.courseId);
      return sum + (course?.credits ?? 0);
    }, 0);
    const remainingCredits = totalCredits - currentCredits;
    if (remainingCredits <= 0) return null;
    const neededPoints = targetGPA * (currentCredits + remainingCredits) - currentPoints;
    const neededGPA = neededPoints / remainingCredits;
    return { needed: Math.max(0, neededGPA), remaining: remainingCredits };
  }, [profile.grades, courseMap, totalCredits]);

  useEffect(() => {
    if (!gradeModal) {
      setNumericScoreInput('');
      return;
    }
    const existing = profile.grades.find(g => g.courseId === gradeModal);
    const existingScore = existing?.score;
    const hasNumericScore = typeof existingScore === 'number'
      && existingScore >= 0
      && existingScore <= 100
      && (existingScore > 4 || existingScore === 0);
    setNumericScoreInput(hasNumericScore ? String(existingScore) : '');
  }, [gradeModal, profile.grades]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, event => {
      setKeyboardOffset(event?.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardOffset(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const gradeTranslateY = useSharedValue(0);

  const closeGradeModal = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setGradeModal(null);
    gradeTranslateY.value = 0;
  }, []);

  const gradePan = useMemo(() => Gesture.Pan()
    .minDistance(2)
    .hitSlop({ top: 12, bottom: 12, left: 24, right: 24 })
    .onUpdate((e) => {
      if (e.translationY > 0) {
        gradeTranslateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 500) {
        runOnJS(closeGradeModal)();
      } else {
        gradeTranslateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    }), [closeGradeModal]);

  const gradeModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: gradeTranslateY.value }],
  }));

  const translateY = useSharedValue(0);

  const closeModal = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowManage(false);
    // Reset translateY after close (will be handled by effect or next open)
    translateY.value = 0;
  }, []);

  const managePan = useMemo(() => Gesture.Pan()
    .minDistance(2)
    .hitSlop({ top: 12, bottom: 12, left: 24, right: 24 })
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 500) {
        runOnJS(closeModal)();
      } else {
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    }), [closeModal]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const renderManageItem = useCallback(({ item: course }: { item: typeof courses[0] }) => {
    const status = getCourseStatus(course.id);
    return (
      <View style={styles.manageCourseRow}>
        <View style={styles.manageCourseInfo}>
          <Text style={styles.manageCourseCode}>{course.code}</Text>
          <Text style={styles.manageCourseTitle} numberOfLines={1}>{course.title}</Text>
        </View>
        <View style={styles.manageBtns}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleCourseInProgress(course.id);
            }}
            style={[styles.manageStatusBtn,
            status === 'in_progress' && { backgroundColor: Colors.courseInProgress + '30' }
            ]}
          >
            <Ionicons
              name="time"
              size={14}
              color={status === 'in_progress' ? Colors.courseInProgress : Colors.textMuted}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleCourseCompleted(course.id);
            }}
            style={[styles.manageStatusBtn,
            status === 'completed' && { backgroundColor: Colors.courseCompleted + '30' }
            ]}
          >
            <Ionicons
              name="checkmark"
              size={14}
              color={status === 'completed' ? Colors.courseCompleted : Colors.textMuted}
            />
          </Pressable>
        </View>
      </View>
    );
  }, [getCourseStatus, toggleCourseInProgress, toggleCourseCompleted]);

  const handleScoreChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned) {
      setNumericScoreInput('');
      return;
    }
    const numeric = Math.min(100, Math.max(0, parseInt(cleaned, 10)));
    setNumericScoreInput(String(numeric));
  };

  const existingGrade = gradeModal
    ? profile.grades.find(g => g.courseId === gradeModal)
    : undefined;
  const numericScoreValue = numericScoreInput.trim() === '' ? null : Number(numericScoreInput);
  const isValidScore = numericScoreValue !== null
    && Number.isFinite(numericScoreValue)
    && numericScoreValue >= 0
    && numericScoreValue <= 100;
  const letterGrade = isValidScore && numericScoreValue !== null
    ? scoreToLetterGrade(numericScoreValue)
    : (existingGrade?.grade ?? '--');

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top + webTopInset }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 12 }]}>
        <Text style={styles.headerTitle}>Academic Tools</Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowManage(true);
          }}
          style={styles.manageBtn}
        >
          <MaterialCommunityIcons name="cog-outline" size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.tabRow}>
        {[
          { key: 'gpa' as const, label: 'GPA', icon: 'calculator' },
          { key: 'projection' as const, label: 'Projection', icon: 'trending-up' },
          { key: 'whatif' as const, label: 'What-If', icon: 'help-circle' },
        ].map(tab => (
          <Pressable
            key={tab.key}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab(tab.key);
            }}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.key ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'web' ? 34 + 84 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'gpa' && (
          <>
            <View style={styles.gpaDisplay}>
              <Text style={styles.gpaValue}>{gpa > 0 ? gpa.toFixed(2) : '--'}</Text>
              <Text style={styles.gpaLabel}>Cumulative GPA</Text>
              {targetGPAResult && (
                <View style={styles.targetCard}>
                  <Ionicons name="flag" size={14} color={Colors.warning} />
                  <Text style={styles.targetText}>
                    Need {targetGPAResult.needed.toFixed(2)} GPA across {targetGPAResult.remaining}cr for 3.50 target
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.sectionTitle}>Set Grades</Text>
            <Text style={styles.sectionSubtitle}>Tap a course to assign a grade</Text>

            {courses.filter(c =>
              profile.completedCourses.includes(c.id) || profile.inProgressCourses.includes(c.id)
            ).map(course => {
              const existingGrade = profile.grades.find(g => g.courseId === course.id);
              return (
                <Pressable
                  key={course.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setGradeModal(course.id);
                  }}
                  style={styles.gradeRow}
                >
                  <View style={styles.gradeRowLeft}>
                    <Text style={styles.gradeRowCode}>{course.code}</Text>
                    <Text style={styles.gradeRowTitle} numberOfLines={1}>{course.title}</Text>
                  </View>
                  <View style={styles.gradeRowRight}>
                    <Text style={styles.gradeRowCredits}>{course.credits}cr</Text>
                    <View style={[styles.gradeTag, existingGrade && styles.gradeTagSet]}>
                      <Text style={[styles.gradeTagText, existingGrade && styles.gradeTagTextSet]}>
                        {existingGrade?.grade ?? 'Set'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}

            {profile.completedCourses.length === 0 && profile.inProgressCourses.length === 0 && (
              <View style={styles.emptyGrades}>
                <Ionicons name="school-outline" size={36} color={Colors.textMuted} />
                <Text style={styles.emptyText}>Mark courses as completed or in-progress to set grades</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'projection' && (
          <>
            <Text style={styles.sectionTitle}>Grade Projection</Text>
            <Text style={styles.sectionSubtitle}>Calculate your expected final grade</Text>

            <View style={styles.projGrid}>
              {['quizzes', 'midterm', 'final'].map(comp => (
                <View key={comp} style={styles.projItem}>
                  <Text style={styles.projLabel}>{comp.charAt(0).toUpperCase() + comp.slice(1)}</Text>
                  <View style={styles.projInputRow}>
                    <View style={styles.projInputContainer}>
                      <Text style={styles.projInputLabel}>Weight %</Text>
                      <TextInput
                        style={styles.projInput}
                        value={(projWeights as any)[comp]}
                        onChangeText={v => setProjWeights(prev => ({ ...prev, [comp]: v }))}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={Colors.textMuted}
                      />
                    </View>
                    <View style={styles.projInputContainer}>
                      <Text style={styles.projInputLabel}>Score %</Text>
                      <TextInput
                        style={styles.projInput}
                        value={(projScores as any)[comp]}
                        onChangeText={v => setProjScores(prev => ({ ...prev, [comp]: v }))}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={Colors.textMuted}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {projectionResult && (
              <View style={styles.projResult}>
                <Text style={styles.projResultLabel}>Projected Grade</Text>
                <View style={styles.projResultRow}>
                  <Text style={styles.projResultScore}>{projectionResult.score.toFixed(1)}%</Text>
                  <View style={styles.projResultGradeBadge}>
                    <Text style={styles.projResultGrade}>{projectionResult.grade}</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {activeTab === 'whatif' && (
          <>
            <Text style={styles.sectionTitle}>What-If Simulator</Text>
            <Text style={styles.sectionSubtitle}>See how changes affect your graduation</Text>

            <View style={styles.whatifCard}>
              <Ionicons name="trending-down" size={20} color={Colors.danger} />
              <View style={styles.whatifContent}>
                <Text style={styles.whatifTitle}>If you fail a course...</Text>
                <Text style={styles.whatifDesc}>
                  Failing a prerequisite course will lock all dependent courses.
                  Your graduation timeline may extend by 1-2 semesters.
                </Text>
              </View>
            </View>

            <View style={styles.whatifCard}>
              <MaterialCommunityIcons name="swap-horizontal" size={20} color={Colors.primary} />
              <View style={styles.whatifContent}>
                <Text style={styles.whatifTitle}>Credit overlap analysis</Text>
                <Text style={styles.whatifDesc}>
                  {completedCredits} of {totalCredits} credits completed ({Math.round(completedCredits / totalCredits * 100)}%).
                  {totalCredits - completedCredits} credits remaining.
                </Text>
              </View>
            </View>

            <View style={styles.whatifCard}>
              <Ionicons name="time" size={20} color={Colors.courseInProgress} />
              <View style={styles.whatifContent}>
                <Text style={styles.whatifTitle}>Estimated graduation</Text>
                <Text style={styles.whatifDesc}>
                  At 15 credits/semester: ~{Math.ceil((totalCredits - completedCredits) / 15)} semesters remaining.
                  At 18 credits/semester: ~{Math.ceil((totalCredits - completedCredits) / 18)} semesters remaining.
                </Text>
              </View>
            </View>

            {profile.grades.length > 0 && (
              <View style={styles.whatifCard}>
                <Ionicons name="flag" size={20} color={Colors.warning} />
                <View style={styles.whatifContent}>
                  <Text style={styles.whatifTitle}>GPA targets</Text>
                  {[3.0, 3.5, 3.7].map(target => {
                    const currentPoints = profile.grades.reduce((sum, g) => {
                      const course = courseMap.get(g.courseId);
                      return sum + (GRADE_POINTS[g.grade] ?? 0) * (course?.credits ?? 0);
                    }, 0);
                    const currentCredits = profile.grades.reduce((sum, g) => {
                      const course = courseMap.get(g.courseId);
                      return sum + (course?.credits ?? 0);
                    }, 0);
                    const remaining = totalCredits - currentCredits;
                    if (remaining <= 0) return null;
                    const needed = (target * (currentCredits + remaining) - currentPoints) / remaining;
                    const possible = needed <= 4.0;
                    return (
                      <Text key={target} style={[styles.whatifDesc, { color: possible ? Colors.accent : Colors.danger }]}>
                        {target.toFixed(1)} GPA: Need {Math.max(0, needed).toFixed(2)} avg ({possible ? 'achievable' : 'not possible'})
                      </Text>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={!!gradeModal} animationType="fade" transparent onRequestClose={() => setGradeModal(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setGradeModal(null)} />
          <Animated.View style={[styles.modalSheet, keyboardOffset > 0 && { marginBottom: keyboardOffset }, gradeModalStyle]}>
            <GestureDetector gesture={gradePan}>
              <Animated.View style={styles.modalHandleHitArea}>
                <View style={styles.modalHandle} />
              </Animated.View>
            </GestureDetector>
            {gradeModal && (
              <>
                <Text style={styles.modalTitle}>{courseMap.get(gradeModal)?.code}</Text>
                <Text style={styles.modalSubtitle}>{courseMap.get(gradeModal)?.title}</Text>
                <View style={styles.scoreInputSection}>
                  <Text style={styles.scoreInputLabel}>Numeric Score (0-100)</Text>
                  <TextInput
                    style={styles.scoreInput}
                    value={numericScoreInput}
                    onChangeText={handleScoreChange}
                    keyboardType="numeric"
                    placeholder="0-100"
                    placeholderTextColor={Colors.textMuted}
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      if (!isValidScore || numericScoreValue === null) return;
                      setGrade(gradeModal!, letterGrade, numericScoreValue);
                      setGradeModal(null);
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                  />
                </View>
                <View style={styles.gradePreviewRow}>
                  <View style={styles.gradePreviewItem}>
                    <Text style={styles.gradePreviewLabel}>Score</Text>
                    <Text style={styles.gradePreviewValue}>
                      {isValidScore && numericScoreValue !== null ? numericScoreValue : '--'}
                    </Text>
                  </View>
                  <View style={styles.gradePreviewItem}>
                    <Text style={styles.gradePreviewLabel}>Letter Grade</Text>
                    <View style={styles.gradePreviewBadge}>
                      <Text style={styles.gradePreviewText}>{letterGrade}</Text>
                    </View>
                  </View>
                </View>
                <Pressable
                  onPress={() => {
                    if (!isValidScore || numericScoreValue === null) return;
                    setGrade(gradeModal!, letterGrade, numericScoreValue);
                    setGradeModal(null);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }}
                  style={[styles.saveGradeBtn, !isValidScore && styles.saveGradeBtnDisabled]}
                  disabled={!isValidScore}
                >
                  <Text style={[styles.saveGradeText, !isValidScore && styles.saveGradeTextDisabled]}>
                    Save Grade
                  </Text>
                </Pressable>
                {existingGrade && (
                  <Pressable
                    onPress={() => {
                      removeGrade(gradeModal!);
                      setGradeModal(null);
                    }}
                    style={styles.removeGradeBtn}
                  >
                    <Text style={styles.removeGradeText}>Remove Grade</Text>
                  </Pressable>
                )}
              </>
            )}
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={showManage} animationType="fade" transparent onRequestClose={() => setShowManage(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowManage(false)} />
          <Animated.View style={[styles.modalSheetTall, modalStyle]}>
            <GestureDetector gesture={managePan}>
              <Animated.View style={styles.modalHandleHitArea}>
                <View style={styles.modalHandle} />
              </Animated.View>
            </GestureDetector>
            <Text style={styles.modalTitle}>Manage Courses</Text>
            <Text style={styles.modalSubtitle}>Toggle course status</Text>

            <FlatList
              data={courses}
              renderItem={renderManageItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListFooterComponent={() => (
                <Pressable
                  onPress={() => {
                    resetProfile();
                    setShowManage(false);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  }}
                  style={styles.resetBtn}
                >
                  <Ionicons name="refresh" size={16} color={Colors.danger} />
                  <Text style={styles.resetText}>Reset All Progress</Text>
                </Pressable>
              )}
            />
          </Animated.View>
        </View>
      </Modal>
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
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    fontFamily: 'Inter_700Bold',
  },
  manageBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.primary + '20',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textMuted,
    fontFamily: 'Inter_500Medium',
  },
  tabTextActive: {
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  gpaDisplay: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  gpaValue: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: Colors.text,
    fontFamily: 'Inter_700Bold',
  },
  gpaLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.warning + '15',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 16,
  },
  targetText: {
    fontSize: 12,
    color: Colors.warning,
    fontFamily: 'Inter_400Regular',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    marginBottom: 16,
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder + '50',
  },
  gradeRowLeft: {
    flex: 1,
    marginRight: 12,
  },
  gradeRowCode: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  gradeRowTitle: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Inter_500Medium',
  },
  gradeRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gradeRowCredits: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  gradeTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  gradeTagSet: {
    backgroundColor: Colors.courseCompleted + '20',
    borderColor: Colors.courseCompleted + '40',
  },
  gradeTagText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    fontFamily: 'Inter_600SemiBold',
  },
  gradeTagTextSet: {
    color: Colors.courseCompleted,
  },
  emptyGrades: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  projGrid: {
    gap: 16,
    marginBottom: 20,
  },
  projItem: {
    gap: 8,
  },
  projLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
  },
  projInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  projInputContainer: {
    flex: 1,
  },
  projInputLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  projInput: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    fontFamily: 'Inter_500Medium',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  projResult: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  projResultLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
  },
  projResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  projResultScore: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
    fontFamily: 'Inter_700Bold',
  },
  projResultGradeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.primary + '25',
  },
  projResultGrade: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary,
    fontFamily: 'Inter_700Bold',
  },
  whatifCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 14,
  },
  whatifContent: {
    flex: 1,
  },
  whatifTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  whatifDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  modalSheet: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '60%',
  },
  modalSheetTall: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    height: '85%',
  },
  modalHandleHitArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.cardBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    fontFamily: 'Inter_700Bold',
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginBottom: 16,
  },
  scoreInputSection: {
    gap: 8,
    marginBottom: 12,
  },
  scoreInputLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
  },
  scoreInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  gradePreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  gradePreviewItem: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  gradePreviewLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    marginBottom: 6,
  },
  gradePreviewValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    fontFamily: 'Inter_700Bold',
  },
  gradePreviewBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.primary + '20',
  },
  gradePreviewText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
    fontFamily: 'Inter_700Bold',
  },
  saveGradeBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    marginBottom: 8,
  },
  saveGradeBtnDisabled: {
    backgroundColor: Colors.cardBorder,
  },
  saveGradeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.backgroundSecondary,
    fontFamily: 'Inter_600SemiBold',
  },
  saveGradeTextDisabled: {
    color: Colors.textMuted,
  },
  removeGradeBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  removeGradeText: {
    fontSize: 14,
    color: Colors.danger,
    fontFamily: 'Inter_500Medium',
  },
  manageCourseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder + '50',
  },
  manageCourseInfo: {
    flex: 1,
    marginRight: 12,
  },
  manageCourseCode: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  manageCourseTitle: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Inter_500Medium',
  },
  manageBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  manageStatusBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 12,
    backgroundColor: Colors.danger + '15',
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.danger,
    fontFamily: 'Inter_600SemiBold',
  },
});
