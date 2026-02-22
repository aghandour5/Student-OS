import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
  ActivityIndicator, TextInput, FlatList, Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';
import { useTheme } from '@/lib/theme-context';
import { useAcademic } from '@/lib/academic-context';
import { GRADE_POINTS, getLetterGrade } from '@shared/schema';
import { BottomSheet } from '@/components/BottomSheet';
import { useConfirm } from '@/lib/confirm-context';
import { TermInfo } from '@/components/TermInfo';
import { AppFooter } from '@/components/AppFooter';

// Helpers to clamp scores and convert to letter grades
const clampScore = (score: number) => Math.max(0, Math.min(100, score));
const scoreToLetterGrade = (score: number) => getLetterGrade(clampScore(score));


export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile, courses, isLoading,
    setGrade, removeGrade, calculateGPA, calculateSemesterGPA,
    completedCredits, totalCredits, getCourseStatus,
    toggleCourseCompleted, toggleCourseInProgress, resetProfile,
  } = useAcademic();
  const { colors } = useTheme();
  const { confirm } = useConfirm();

  const currentProgress = profile.progress[profile.major] || {
    grades: [],
    completedCourses: [],
    inProgressCourses: [],
    semesterPlans: []
  };


  const [activeTab, setActiveTab] = useState<'gpa' | 'projection' | 'whatif'>('gpa');
  const [targetGPAInput, setTargetGPAInput] = useState('3.5');
  const [whatIfCourseId, setWhatIfCourseId] = useState<string | null>(null);
  const [whatIfSimulatedGrade, setWhatIfSimulatedGrade] = useState<string | null>(null);
  const [whatIfSearch, setWhatIfSearch] = useState('');
  const [creditsPerSemester, setCreditsPerSemester] = useState('15');
  const [projectionCourse, setProjectionCourse] = useState<string | null>(null);
  const [projWeights, setProjWeights] = useState({ quizzes: '20', midterm: '30', final: '50' });
  const [projScores, setProjScores] = useState({ quizzes: '', midterm: '', final: '' });
  const [gradeModal, setGradeModal] = useState<string | null>(null);
  const [numericScoreInput, setNumericScoreInput] = useState('');
  const [showManage, setShowManage] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const courseMap = useMemo(() => {
    const map = new Map<string, any>();
    courses.forEach(c => map.set(c.id, c));
    return map;
  }, [courses]);

  const gpa = calculateGPA();
  const gradesByCategory = useMemo(() => {
    const grouped = new Map<string, typeof currentProgress.grades>();
    currentProgress.grades.forEach(g => {
      const course = courseMap.get(g.courseId);
      if (!course) return;
      const cat = course.category;
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(g);
    });
    return grouped;
  }, [currentProgress.grades, courseMap]);

  // Calculate projected course grade based on component weights
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
    // ... logic to determine letter grade
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

  // Shared aggregate: total grade points and graded credits (used by targetGPAResult and what-if)
  const gradeAggregates = useMemo(() => {
    let points = 0, credits = 0;
    currentProgress.grades.forEach(g => {
      const course = courseMap.get(g.courseId);
      const c = course?.credits ?? 0;
      points += (GRADE_POINTS[g.grade] ?? 0) * c;
      credits += c;
    });
    return { totalGradePoints: points, totalGradedCredits: credits };
  }, [currentProgress.grades, courseMap]);

  // Calculate needed GPA for remaining credits to reach target
  const targetGPAResult = useMemo(() => {
    if (currentProgress.grades.length === 0) return null;
    const targetGPA = 3.5;
    const remainingCredits = totalCredits - gradeAggregates.totalGradedCredits;
    if (remainingCredits <= 0) return null;
    const neededPoints = targetGPA * (gradeAggregates.totalGradedCredits + remainingCredits) - gradeAggregates.totalGradePoints;
    const neededGPA = neededPoints / remainingCredits;
    return { needed: Math.max(0, neededGPA), remaining: remainingCredits };
  }, [currentProgress.grades, gradeAggregates, totalCredits]);

  useEffect(() => {
    if (!gradeModal) {
      setNumericScoreInput('');
      return;
    }
    const existing = currentProgress.grades.find(g => g.courseId === gradeModal);
    const existingScore = existing?.score;
    const hasNumericScore = typeof existingScore === 'number'
      && existingScore >= 0
      && existingScore <= 100
      && (existingScore > 4 || existingScore === 0);
    setNumericScoreInput(hasNumericScore ? String(existingScore) : '');
  }, [gradeModal, currentProgress.grades]);



  const closeGradeModal = useCallback(() => {
    setGradeModal(null);
  }, []);

  const closeModal = useCallback(() => {
    setShowManage(false);
  }, []);

  const renderManageItem = useCallback(({ item: course }: { item: typeof courses[0] }) => {
    const status = getCourseStatus(course.id);
    return (
      <View style={[styles.manageCourseRow, { borderBottomColor: colors.cardBorder + '50' }]}>
        <View style={styles.manageCourseInfo}>
          <Text style={[styles.manageCourseCode, { color: colors.textMuted }]}>{course.code}</Text>
          <Text style={[styles.manageCourseTitle, { color: colors.text }]} numberOfLines={1}>{course.title}</Text>
        </View>
        <View style={styles.manageBtns}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleCourseInProgress(course.id);
            }}
            style={[styles.manageStatusBtn,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
            status === 'in_progress' && { backgroundColor: Colors.courseInProgress + '30' }
            ]}
          >
            <Ionicons
              name="time"
              size={14}
              color={status === 'in_progress' ? Colors.courseInProgress : colors.textMuted}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleCourseCompleted(course.id);
            }}
            style={[styles.manageStatusBtn,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
            status === 'completed' && { backgroundColor: Colors.courseCompleted + '30' }
            ]}
          >
            <Ionicons
              name="checkmark"
              size={14}
              color={status === 'completed' ? Colors.courseCompleted : colors.textMuted}
            />
          </Pressable>
        </View>
      </View>
    );
  }, [getCourseStatus, toggleCourseInProgress, toggleCourseCompleted, colors]);

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
    ? currentProgress.grades.find(g => g.courseId === gradeModal)
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
      <View style={[styles.loadingContainer, { paddingTop: insets.top + webTopInset, backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 12 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Academic Tools</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowSupport(true);
            }}
            style={[styles.manageBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowManage(true);
            }}
            style={[styles.manageBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <MaterialCommunityIcons name="cog-outline" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.tabRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
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
            style={[styles.tab, activeTab === tab.key && [styles.tabActive, { backgroundColor: colors.primary + '20' }]]}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.key ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.tabText, { color: activeTab === tab.key ? colors.primary : colors.textMuted }]}>
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
              <Text style={[styles.gpaValue, { color: colors.text }]}>{gpa > 0 ? gpa.toFixed(2) : '--'}</Text>
              <View style={styles.gpaLabelRow}>
                <Text style={[styles.gpaLabel, { color: colors.textSecondary }]}>Cumulative GPA</Text>
                <TermInfo term="Cumulative GPA" size={14} />
              </View>
              {targetGPAResult && (
                <View style={styles.targetCard}>
                  <Ionicons name="flag" size={14} color={Colors.warning} />
                  <Text style={styles.targetText}>
                    Need {targetGPAResult.needed.toFixed(2)} GPA across {targetGPAResult.remaining}cr for 3.50 target
                  </Text>
                </View>
              )}
            </View>

            {gradesByCategory.size > 0 && (() => {
              const categoryData = Array.from(gradesByCategory.entries()).map(([cat, grades]) => {
                const totalPoints = grades.reduce((sum, g) => {
                  const course = courseMap.get(g.courseId);
                  return sum + (GRADE_POINTS[g.grade] ?? 0) * (course?.credits ?? 0);
                }, 0);
                const totalCreds = grades.reduce((sum, g) => {
                  const course = courseMap.get(g.courseId);
                  return sum + (course?.credits ?? 0);
                }, 0);
                const avgGPA = totalCreds > 0 ? totalPoints / totalCreds : 0;
                return { category: cat, avgGPA, count: grades.length };
              });



              const allGrades = currentProgress.grades;
              const totalGraded = allGrades.length;
              const avgScore = totalGraded > 0
                ? allGrades.reduce((sum, g) => sum + (g.score ?? 0), 0) / totalGraded
                : 0;

              const allLetters = allGrades.map(g => g.grade);
              const sortedByPoints = allLetters
                .map(l => ({ letter: l, points: GRADE_POINTS[l] ?? 0 }))
                .sort((a, b) => b.points - a.points);
              const highest = sortedByPoints.length > 0 ? sortedByPoints[0].letter : '--';
              const lowest = sortedByPoints.length > 0 ? sortedByPoints[sortedByPoints.length - 1].letter : '--';

              return (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Grade Distribution</Text>
                  <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Performance by category</Text>

                  <View style={[styles.distContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    {categoryData.map(({ category, avgGPA, count }) => {
                      const color = (Colors.categoryColors as Record<string, string>)[category] ?? Colors.primary;
                      const barWidth = `${Math.min(100, (avgGPA / 4.0) * 100)}%`;
                      return (
                        <View key={category} style={styles.distRow}>
                          <View style={styles.distLabelRow}>
                            <View style={[styles.distDot, { backgroundColor: color }]} />
                            <View style={styles.distLabelContent}>
                              <Text style={[styles.distCategory, { color: colors.text }]}>{category}</Text>
                              <Text style={[styles.distCount, { color: colors.textMuted }]}>{count} course{count !== 1 ? 's' : ''}</Text>
                            </View>
                          </View>
                          <View style={styles.distBarRow}>
                            <View style={[styles.distBarTrack, { backgroundColor: colors.cardBorder }]}>
                              <View style={[styles.distBarFill, { width: barWidth as any, backgroundColor: color }]} />
                            </View>
                            <Text style={[styles.distGPA, { color }]}>{avgGPA.toFixed(2)}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  <View style={[styles.distSummary, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={styles.distSummaryItem}>
                      <Text style={[styles.distSummaryValue, { color: colors.text }]}>{totalGraded}</Text>
                      <Text style={[styles.distSummaryLabel, { color: colors.textMuted }]}>Graded</Text>
                    </View>
                    <View style={[styles.distSummaryDivider, { backgroundColor: colors.cardBorder }]} />
                    <View style={styles.distSummaryItem}>
                      <Text style={[styles.distSummaryValue, { color: colors.text }]}>{avgScore.toFixed(1)}</Text>
                      <Text style={[styles.distSummaryLabel, { color: colors.textMuted }]}>Avg Score</Text>
                    </View>
                    <View style={[styles.distSummaryDivider, { backgroundColor: colors.cardBorder }]} />
                    <View style={styles.distSummaryItem}>
                      <Text style={[styles.distSummaryValue, { color: colors.text }]}>{highest}</Text>
                      <Text style={[styles.distSummaryLabel, { color: colors.textMuted }]}>Highest</Text>
                    </View>
                    <View style={[styles.distSummaryDivider, { backgroundColor: colors.cardBorder }]} />
                    <View style={styles.distSummaryItem}>
                      <Text style={[styles.distSummaryValue, { color: colors.text }]}>{lowest}</Text>
                      <Text style={[styles.distSummaryLabel, { color: colors.textMuted }]}>Lowest</Text>
                    </View>
                  </View>
                </>
              );
            })()}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Set Grades</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Tap a course to assign a grade</Text>

            {courses.filter(c =>
              currentProgress.completedCourses.includes(c.id) || currentProgress.inProgressCourses.includes(c.id)
            ).map(course => {
              const existingGrade = currentProgress.grades.find(g => g.courseId === course.id);
              return (
                <Pressable
                  key={course.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setGradeModal(course.id);
                  }}
                  style={[styles.gradeRow, { borderBottomColor: colors.cardBorder + '50' }]}
                >
                  <View style={styles.gradeRowLeft}>
                    <Text style={[styles.gradeRowCode, { color: colors.textMuted }]}>{course.code}</Text>
                    <Text style={[styles.gradeRowTitle, { color: colors.text }]} numberOfLines={1}>{course.title}</Text>
                  </View>
                  <View style={styles.gradeRowRight}>
                    <Text style={[styles.gradeRowCredits, { color: colors.textSecondary }]}>{course.credits}cr</Text>
                    <View style={[styles.gradeTag, { backgroundColor: colors.card, borderColor: colors.cardBorder }, existingGrade && styles.gradeTagSet]}>
                      <Text style={[styles.gradeTagText, existingGrade && styles.gradeTagTextSet]}>
                        {existingGrade?.grade ?? 'Set'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}

            {currentProgress.completedCourses.length === 0 && currentProgress.inProgressCourses.length === 0 && (
              <View style={styles.emptyGrades}>
                <Ionicons name="school-outline" size={36} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Mark courses as completed or in-progress to set grades</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'projection' && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Grade Projection</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Calculate your expected final grade</Text>

            <View style={styles.projGrid}>
              {['quizzes', 'midterm', 'final'].map(comp => {
                const totalWeight = ['quizzes', 'midterm', 'final'].reduce(
                  (sum, key) => sum + (parseFloat((projWeights as any)[key]) || 0), 0
                );
                return (
                  <View key={comp} style={styles.projItem}>
                    <Text style={[styles.projLabel, { color: colors.text }]}>{comp.charAt(0).toUpperCase() + comp.slice(1)}</Text>
                    <View style={styles.projInputRow}>
                      <View style={styles.projInputContainer}>
                        <Text style={[styles.projInputLabel, { color: colors.textMuted }]}>Weight %</Text>
                        <TextInput
                          style={[styles.projInput, { backgroundColor: colors.card, borderColor: totalWeight > 100 ? Colors.danger : colors.cardBorder, color: colors.text }]}
                          value={(projWeights as any)[comp]}
                          onChangeText={v => {
                            const cleaned = v.replace(/[^0-9.]/g, '');
                            const newVal = parseFloat(cleaned) || 0;
                            // Calculate sum of OTHER weights
                            const otherWeights = ['quizzes', 'midterm', 'final']
                              .filter(k => k !== comp)
                              .reduce((sum, k) => sum + (parseFloat((projWeights as any)[k]) || 0), 0);
                            // Clamp so total can't exceed 100
                            const maxAllowed = 100 - otherWeights;
                            const clamped = Math.min(newVal, Math.max(0, maxAllowed));
                            setProjWeights(prev => ({ ...prev, [comp]: cleaned === '' ? '' : String(clamped) }));
                          }}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor={colors.textMuted}
                        />
                      </View>
                      <View style={styles.projInputContainer}>
                        <Text style={[styles.projInputLabel, { color: colors.textMuted }]}>Score %</Text>
                        <TextInput
                          style={[styles.projInput, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
                          value={(projScores as any)[comp]}
                          onChangeText={v => {
                            const cleaned = v.replace(/[^0-9.]/g, '');
                            const num = parseFloat(cleaned) || 0;
                            const clamped = Math.min(num, 100);
                            setProjScores(prev => ({ ...prev, [comp]: cleaned === '' ? '' : String(clamped) }));
                          }}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor={colors.textMuted}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Total weight indicator */}
            {(() => {
              const total = ['quizzes', 'midterm', 'final'].reduce(
                (sum, k) => sum + (parseFloat((projWeights as any)[k]) || 0), 0
              );
              return (
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 4, marginTop: -4, marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: total === 100 ? Colors.courseCompleted : total > 100 ? Colors.danger : colors.textMuted }}>
                    Total weight: {total}%{total === 100 ? ' ✓' : total < 100 ? ` (${100 - total}% remaining)` : ' ⚠ exceeds 100%'}
                  </Text>
                </View>
              );
            })()}

            {projectionResult && (
              <View style={[styles.projResult, { backgroundColor: colors.card }]}>
                <Text style={[styles.projResultLabel, { color: colors.textSecondary }]}>Projected Grade</Text>
                <View style={styles.projResultRow}>
                  <Text style={[styles.projResultScore, { color: colors.text }]}>{projectionResult.score.toFixed(1)}%</Text>
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>What-If Simulator</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Simulate scenarios & plan graduation</Text>

            {/* Target GPA Calculator */}
            <View style={[styles.whatifCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Ionicons name="flag" size={20} color={Colors.warning} />
              <View style={styles.whatifContent}>
                <Text style={[styles.whatifTitle, { color: colors.text }]}>Target GPA Calculator</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 }}>
                  <Text style={{ color: colors.textSecondary }}>Target GPA:</Text>
                  <TextInput
                    style={[styles.projInput, { flex: 1, backgroundColor: colors.background, borderColor: colors.cardBorder, color: colors.text, height: 44, paddingHorizontal: 12, paddingVertical: 8 }]}
                    value={targetGPAInput}
                    onChangeText={setTargetGPAInput}
                    keyboardType="numeric"
                    placeholder="3.5"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                {(() => {
                  const inputVal = targetGPAInput.trim();
                  if (inputVal === '') return null;
                  const target = parseFloat(inputVal);

                  if (isNaN(target) || target < 0 || target > 4.0) {
                    return (
                      <Text style={[styles.whatifDesc, { color: Colors.danger, marginTop: 8 }]}>
                        Please enter a valid GPA between 0.0 and 4.0.
                      </Text>
                    );
                  }

                  const remaining = totalCredits - gradeAggregates.totalGradedCredits;
                  if (remaining <= 0) return <Text style={[styles.whatifDesc, { color: colors.textMuted, marginTop: 8 }]}>No remaining credits.</Text>;
                  const needed = (target * (gradeAggregates.totalGradedCredits + remaining) - gradeAggregates.totalGradePoints) / remaining;
                  const possible = needed <= 4.0;
                  return (
                    <Text style={[styles.whatifDesc, { color: possible ? Colors.primary : Colors.danger, marginTop: 8 }]}>
                      You need to average a {Math.max(0, needed).toFixed(2)} GPA across your remaining {remaining} credits ({possible ? 'achievable' : 'not mathematically possible'}).
                    </Text>
                  );
                })()}
              </View>
            </View>

            {/* Course Grade Impact */}
            {courses.length > 0 && (
              <View style={[styles.whatifCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, flexDirection: 'column', alignItems: 'stretch' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Ionicons name="calculator" size={20} color={Colors.accent} />
                  <Text style={[styles.whatifTitle, { color: colors.text }]}>Grade Impact Simulator</Text>
                </View>
                <Text style={[styles.whatifDesc, { color: colors.textSecondary, marginTop: 8, marginBottom: 8 }]}>
                  Select a course and a simulated grade to see its impact on your cumulative GPA.
                </Text>

                {/* Course Search Bar */}
                {whatIfCourseId ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: Colors.accent + '15', borderRadius: 10, padding: 10, gap: 8 }}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: Colors.accent, fontWeight: '600', fontSize: 14 }}>
                        {courseMap.get(whatIfCourseId)?.code}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }} numberOfLines={1}>
                        {courseMap.get(whatIfCourseId)?.title}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setWhatIfCourseId(null);
                        setWhatIfSimulatedGrade(null);
                        setWhatIfSearch('');
                      }}
                      style={{ padding: 4 }}
                    >
                      <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 10, borderWidth: 1, borderColor: colors.cardBorder, paddingHorizontal: 10, marginBottom: 8 }}>
                      <Ionicons name="search" size={16} color={colors.textMuted} />
                      <TextInput
                        style={{ flex: 1, height: 40, paddingHorizontal: 8, color: colors.text, fontSize: 14 }}
                        value={whatIfSearch}
                        onChangeText={setWhatIfSearch}
                        placeholder="Search by code or name..."
                        placeholderTextColor={colors.textMuted}
                      />
                      {whatIfSearch.length > 0 && (
                        <Pressable onPress={() => setWhatIfSearch('')}>
                          <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                        </Pressable>
                      )}
                    </View>
                    {(() => {
                      const query = whatIfSearch.toLowerCase().trim();
                      const filtered = query.length > 0
                        ? courses.filter(c => c.code.toLowerCase().includes(query) || c.title.toLowerCase().includes(query))
                        : courses.slice(0, 5);
                      return (
                        <View style={{ marginBottom: 12 }}>
                          {query.length === 0 && (
                            <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>Showing first 5 — type to search all courses</Text>
                          )}
                          {filtered.length === 0 && (
                            <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingVertical: 12 }}>No courses found</Text>
                          )}
                          {filtered.map(course => {
                            const existingGrade = currentProgress.grades.find(g => g.courseId === course.id);
                            return (
                              <Pressable
                                key={course.id}
                                onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  setWhatIfCourseId(course.id);
                                  setWhatIfSimulatedGrade(null);
                                  setWhatIfSearch('');
                                }}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  paddingVertical: 8,
                                  paddingHorizontal: 8,
                                  borderBottomWidth: 1,
                                  borderBottomColor: colors.cardBorder + '40',
                                }}
                              >
                                <View style={{ flex: 1, marginRight: 8 }}>
                                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: '500' }}>{course.code}</Text>
                                  <Text style={{ color: colors.textMuted, fontSize: 11 }} numberOfLines={1}>{course.title}</Text>
                                </View>
                                {existingGrade && (
                                  <View style={{ backgroundColor: Colors.courseCompleted + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                    <Text style={{ color: Colors.courseCompleted, fontSize: 11, fontWeight: '600' }}>{existingGrade.grade}</Text>
                                  </View>
                                )}
                              </Pressable>
                            );
                          })}
                        </View>
                      );
                    })()}
                  </>
                )}

                {whatIfCourseId && (
                  <>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'].map(grade => {
                        const isSelected = whatIfSimulatedGrade === grade;
                        return (
                          <Pressable
                            key={grade}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setWhatIfSimulatedGrade(grade);
                            }}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 8,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: isSelected ? Colors.primary : colors.cardBorder,
                              backgroundColor: isSelected ? Colors.primary : colors.background,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text style={{ color: isSelected ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>
                              {grade}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    {whatIfSimulatedGrade && (() => {
                      const course = courseMap.get(whatIfCourseId);
                      const credits = course?.credits ?? 0;
                      const simPoints = (GRADE_POINTS[whatIfSimulatedGrade] ?? 0) * credits;

                      let newTotalPoints = gradeAggregates.totalGradePoints;
                      let newTotalCredits = gradeAggregates.totalGradedCredits;

                      const existingGrade = currentProgress.grades.find(g => g.courseId === whatIfCourseId);
                      if (existingGrade) {
                        newTotalPoints -= (GRADE_POINTS[existingGrade.grade] ?? 0) * credits;
                        // credits won't change
                      } else {
                        newTotalCredits += credits;
                      }
                      newTotalPoints += simPoints;

                      const newGPA = newTotalCredits > 0 ? (newTotalPoints / newTotalCredits) : 0;
                      const diff = newGPA - gpa;

                      return (
                        <View style={{ marginTop: 8, padding: 12, backgroundColor: colors.background, borderRadius: 8 }}>
                          <Text style={{ color: colors.text }}>
                            New Cumulative GPA: <Text style={{ fontWeight: 'bold' }}>{newGPA.toFixed(2)}</Text>
                          </Text>
                          <Text style={{ color: diff > 0 ? Colors.primary : diff < 0 ? Colors.danger : colors.textMuted, fontSize: 13, marginTop: 4 }}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(2)} Change
                          </Text>
                        </View>
                      );
                    })()}
                  </>
                )}
              </View>
            )}

            {/* Graduation Timeline Adjuster */}
            <View style={[styles.whatifCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Ionicons name="time" size={20} color={Colors.courseInProgress} />
              <View style={styles.whatifContent}>
                <Text style={[styles.whatifTitle, { color: colors.text }]}>Dynamic Graduation Timeline</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 }}>
                  <Text style={{ color: colors.textSecondary }}>Credits / Semester:</Text>
                  <TextInput
                    style={[styles.projInput, { flex: 1, backgroundColor: colors.background, borderColor: colors.cardBorder, color: colors.text, height: 44, paddingHorizontal: 12, paddingVertical: 8 }]}
                    value={creditsPerSemester}
                    onChangeText={setCreditsPerSemester}
                    keyboardType="numeric"
                    placeholder="15"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                {(() => {
                  const cps = parseFloat(creditsPerSemester);
                  if (isNaN(cps) || cps <= 0) return null;
                  const remaining = totalCredits - completedCredits;
                  if (remaining <= 0) return <Text style={[styles.whatifDesc, { color: colors.textMuted, marginTop: 8 }]}>Already graduated!</Text>;
                  const semesters = Math.ceil(remaining / cps);
                  return (
                    <Text style={[styles.whatifDesc, { color: Colors.courseInProgress, marginTop: 8 }]}>
                      At {cps} credits per semester, you have ~{semesters} semester{semesters !== 1 ? 's' : ''} remaining to complete your {remaining} outstanding credits.
                    </Text>
                  );
                })()}
              </View>
            </View>
          </>
        )}



        <AppFooter />
      </ScrollView>

      <BottomSheet
        visible={!!gradeModal}
        onClose={closeGradeModal}
        title={courseMap.get(gradeModal!)?.code}
        subtitle={courseMap.get(gradeModal!)?.title}
      >
        {gradeModal && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            style={{ flexGrow: 0, flexShrink: 1 }}
          >
            <View style={styles.scoreInputSection}>
              <Text style={[styles.scoreInputLabel, { color: colors.textMuted }]}>Numeric Score (0-100)</Text>
              <TextInput
                style={[styles.scoreInput, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
                value={numericScoreInput}
                onChangeText={handleScoreChange}
                keyboardType="numeric"
                placeholder="0-100"
                placeholderTextColor={colors.textMuted}
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
              <View style={[styles.gradePreviewItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.gradePreviewLabel, { color: colors.textMuted }]}>Score</Text>
                <Text style={[styles.gradePreviewValue, { color: colors.text }]}>
                  {isValidScore && numericScoreValue !== null ? numericScoreValue : '--'}
                </Text>
              </View>
              <View style={[styles.gradePreviewItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.gradePreviewLabel, { color: colors.textMuted }]}>Letter Grade</Text>
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
          </ScrollView>
        )}
      </BottomSheet>

      <BottomSheet
        visible={showManage}
        onClose={closeModal}
        title="Manage Courses"
        subtitle="Toggle course status"
      >
        <FlatList
          data={courses}
          renderItem={renderManageItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          style={{ flexGrow: 1, maxHeight: '95%' }} // Grow but leave small room for footer
          ListFooterComponent={() => (
            <Pressable
              onPress={async () => {
                if (await confirm({
                  title: 'Reset All Progress',
                  message: 'This will clear all grades, courses, and plans. This action cannot be undone.',
                  confirmText: 'Reset',
                  variant: 'danger',
                })) {
                  resetProfile();
                  setShowManage(false);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                }
              }}
              style={styles.resetBtn}
            >
              <Ionicons name="refresh" size={16} color={Colors.danger} />
              <Text style={styles.resetText}>Reset All Progress</Text>
            </Pressable>
          )}
        />
      </BottomSheet>
      <BottomSheet
        visible={showSupport}
        onClose={() => setShowSupport(false)}
        title="Feedback & Support"
        subtitle="Encountered a bug or have a suggestion? Let us know!"
      >
        <View style={{ paddingBottom: 20 }}>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={() => Linking.openURL('https://wa.me/96179307904')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#25D366' + '20' }]}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Contact via WhatsApp</Text>
              <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>Chat directly with the developer</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.7 : 1, marginTop: 12 }
            ]}
            onPress={() => Linking.openURL('mailto:aghandour090@gmail.com?subject=StudentOS Feedback')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#EA4335' + '20' }]}>
              <Ionicons name="mail" size={24} color="#EA4335" />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Send an Email</Text>
              <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>Submit a detailed bug report</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    padding: 6,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
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
    marginTop: 0,
  },
  gpaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    fontSize: 16,
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
  distContainer: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 14,
  },
  distRow: {
    gap: 6,
  },
  distLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  distLabelContent: {
    flex: 1,
  },
  distCategory: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
  },
  distCount: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
  },
  distBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 16,
  },
  distBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.cardBorder,
    overflow: 'hidden' as const,
  },
  sectionHeader: {
    marginBottom: 24,
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  actionDesc: {
    fontSize: 13,
  },
  distBarFill: {
    height: 6,
    borderRadius: 3,
  },
  distGPA: {
    fontSize: 13,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    minWidth: 36,
    textAlign: 'right' as const,
  },
  distSummary: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  distSummaryValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    fontFamily: 'Inter_700Bold',
  },
  distSummaryLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  distSummaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.cardBorder,
  },
});
