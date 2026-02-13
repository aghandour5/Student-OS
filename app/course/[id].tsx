import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, TextInput,
  KeyboardAvoidingView, Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import Colors from '@/constants/colors';
import { useTheme } from '@/lib/theme-context';
import { TermInfo } from '@/components/TermInfo';
import { useAcademic } from '@/lib/academic-context';
import { getApiUrl } from '@/lib/query-client';
import type { Offering } from '@shared/schema';

const statusConfig = {
  completed: { color: Colors.courseCompleted, icon: 'checkmark-circle', label: 'Completed', bgColor: Colors.courseCompleted + '15' },
  in_progress: { color: Colors.courseInProgress, icon: 'time', label: 'In Progress', bgColor: Colors.courseInProgress + '15' },
  available: { color: Colors.primary, icon: 'arrow-forward-circle', label: 'Available', bgColor: Colors.primary + '15' },
  locked: { color: Colors.courseLocked, icon: 'lock-closed', label: 'Locked', bgColor: Colors.courseLocked + '15' },
  future: { color: Colors.courseFuture, icon: 'ellipsis-horizontal-circle', label: 'Future', bgColor: Colors.courseFuture + '15' },
};

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const {
    courses, getCourseStatus, getPrerequisitesFor, getUnlockedBy,
    getMissingPrereqs, toggleCourseCompleted, toggleCourseInProgress,
    arePrereqsMet, profile, setCourseNote, getCourseNote, getPrerequisiteChain,
  } = useAcademic();
  const { colors } = useTheme();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  // Only fetch from server if server is configured
  const { data: courseDetail } = useQuery<any>({
    queryKey: ['/api/courses', id],
    enabled: !!id && !!getApiUrl(),
    queryFn: async () => {
      const baseUrl = getApiUrl();
      if (!baseUrl) throw new Error('Server not available');
      const res = await fetch(`${baseUrl}/api/courses/${id}`);
      if (!res.ok) throw new Error('Failed to fetch course');
      return res.json();
    },
  });

  const course = useMemo(() => courses.find(c => c.id === id), [courses, id]);
  const status = course ? getCourseStatus(course.id) : 'locked';
  const config = statusConfig[status];
  const prereqs = course ? getPrerequisitesFor(course.id) : [];
  const unlocks = course ? getUnlockedBy(course.id) : [];
  const missingPrereqs = course ? getMissingPrereqs(course.id) : [];
  const offerings: Offering[] = courseDetail?.offerings || [];
  const grade = profile.grades.find(g => g.courseId === id);

  const courseId = id!;
  const chain = getPrerequisiteChain(courseId);
  const [noteText, setNoteText] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const note = getCourseNote(courseId);
  const noteRef = useRef(noteText);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setNoteText(note); noteRef.current = note; }, [note]);

  // Debounced auto-save: saves 500ms after user stops typing
  const handleNoteChange = useCallback((text: string) => {
    setNoteText(text);
    noteRef.current = text;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setCourseNote(courseId, text);
    }, 500);
  }, [courseId, setCourseNote]);

  // Flush any pending save on unmount (navigating away)
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      // Save whatever is in the ref right now
      setCourseNote(courseId, noteRef.current);
    };
  }, [courseId, setCourseNote]);

  // Track keyboard state
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardOpen(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardOpen(false)
    );
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const { cleanDescription, corequisites } = useMemo(() => {
    if (!course) return { cleanDescription: '', corequisites: [] };

    const parts = course.description.split(/Corequisites:\s*/);
    if (parts.length === 1) return { cleanDescription: course.description, corequisites: [] };

    const desc = parts[0].trim();
    const coreqText = parts[1].trim();

    if (coreqText === 'None.' || coreqText === 'None') {
      return { cleanDescription: desc, corequisites: [] };
    }

    const codes = coreqText.replace(/\.$/, '').split(',').map(c => c.trim());
    const matchedCourses = codes
      .map(code => courses.find(c => c.code === code))
      .filter((c): c is typeof courses[0] => !!c);

    return { cleanDescription: desc, corequisites: matchedCourses };
  }, [course, courses]);

  if (!course) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top + webTopInset, backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + webTopInset + 8 }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.topBarTitle, { color: colors.text }]} numberOfLines={1}>{course.code}</Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.dismissAll();
            router.replace('/');
          }}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        >
          <Ionicons name="home-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 60 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: keyboardOpen ? 100 : 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={[config.bgColor, colors.background]}
            style={styles.heroGradient}
          >
            <View style={[styles.statusChip, { backgroundColor: config.color + '20' }]}>
              <Ionicons name={config.icon as any} size={14} color={config.color} />
              <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
            </View>

            <Text style={[styles.courseTitle, { color: colors.text }]}>{course.title}</Text>
            <Text style={[styles.courseCode, { color: colors.textSecondary }]}>{course.code}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="school" size={16} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>{course.credits} Credits</Text>
                <TermInfo term="Credits" size={14} />
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="folder-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>{course.category}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>Year {course.year}, Sem {course.semester}</Text>
              </View>
            </View>

            {grade && (
              <View style={styles.gradeDisplay}>
                <Text style={styles.gradeDisplayLabel}>Your Grade</Text>
                <Text style={styles.gradeDisplayValue}>{grade.grade}</Text>
              </View>
            )}
          </LinearGradient>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{cleanDescription}</Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                toggleCourseInProgress(course.id);
              }}
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder },
              status === 'in_progress' && { backgroundColor: Colors.courseInProgress + '20', borderColor: Colors.courseInProgress }
              ]}
            >
              <Ionicons
                name="time"
                size={18}
                color={status === 'in_progress' ? Colors.courseInProgress : colors.textSecondary}
              />
              <Text style={[styles.actionBtnText, { color: colors.textSecondary },
              status === 'in_progress' && { color: Colors.courseInProgress }
              ]}>In Progress</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                toggleCourseCompleted(course.id);
              }}
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder },
              status === 'completed' && { backgroundColor: Colors.courseCompleted + '20', borderColor: Colors.courseCompleted }
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={status === 'completed' ? Colors.courseCompleted : colors.textSecondary}
              />
              <Text style={[styles.actionBtnText, { color: colors.textSecondary },
              status === 'completed' && { color: Colors.courseCompleted }
              ]}>Completed</Text>
            </Pressable>
          </View>

          {prereqs.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Prerequisites</Text>
                <TermInfo term="Prerequisites" />
              </View>
              {prereqs.map((prereq: any) => {
                const pStatus = getCourseStatus(prereq.id);
                const isMissing = missingPrereqs.some(m => m.id === prereq.id);
                return (
                  <Pressable
                    key={prereq.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push({ pathname: '/course/[id]', params: { id: prereq.id } });
                    }}
                    style={[styles.prereqCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  >
                    <View style={[styles.prereqDot, {
                      backgroundColor: pStatus === 'completed' ? Colors.courseCompleted : Colors.courseLocked
                    }]} />
                    <View style={styles.prereqInfo}>
                      <Text style={[styles.prereqCode, { color: colors.textMuted }]}>{prereq.code}</Text>
                      <Text style={[styles.prereqTitle, { color: colors.text }]}>{prereq.title}</Text>
                    </View>
                    {isMissing && (
                      <View style={styles.missingBadge}>
                        <Ionicons name="alert-circle" size={12} color={Colors.danger} />
                        <Text style={styles.missingText}>Needed</Text>
                      </View>
                    )}
                    {!isMissing && (
                      <Ionicons name="checkmark" size={16} color={Colors.courseCompleted} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {corequisites.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Corequisites</Text>
                <TermInfo term="Corequisites" />
              </View>
              {corequisites.map(coreq => {
                const cStatus = getCourseStatus(coreq.id);
                return (
                  <Pressable
                    key={coreq.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push({ pathname: '/course/[id]', params: { id: coreq.id } });
                    }}
                    style={[styles.prereqCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  >
                    <View style={[styles.prereqDot, {
                      backgroundColor: cStatus === 'completed' ? Colors.courseCompleted :
                        cStatus === 'in_progress' ? Colors.courseInProgress : Colors.courseLocked
                    }]} />
                    <View style={styles.prereqInfo}>
                      <Text style={[styles.prereqCode, { color: colors.textMuted }]}>{coreq.code}</Text>
                      <Text style={[styles.prereqTitle, { color: colors.text }]}>{coreq.title}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </Pressable>
                );
              })}
            </View>
          )}

          {unlocks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Unlocks</Text>
                <TermInfo term="Unlocks" />
              </View>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Completing this course enables {unlocks.length} more course{unlocks.length > 1 ? 's' : ''}
              </Text>
              {unlocks.map(unlock => (
                <Pressable
                  key={unlock.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/course/[id]', params: { id: unlock.id } });
                  }}
                  style={[styles.prereqCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                >
                  <View style={[styles.prereqDot, { backgroundColor: Colors.primary }]} />
                  <View style={styles.prereqInfo}>
                    <Text style={[styles.prereqCode, { color: colors.textMuted }]}>{unlock.code}</Text>
                    <Text style={[styles.prereqTitle, { color: colors.text }]}>{unlock.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          )}

          {offerings.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Offerings</Text>
              {offerings.map((offering: Offering, idx: number) => (
                <View key={idx} style={[styles.offeringCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.offeringHeader}>
                    <View style={styles.offeringBadge}>
                      <Ionicons
                        name={offering.semester === 'Fall' ? 'leaf' : offering.semester === 'Spring' ? 'flower' : 'sunny'}
                        size={12}
                        color={offering.semester === 'Fall' ? '#F59E0B' :
                          offering.semester === 'Spring' ? '#10B981' : '#EF4444'}
                      />
                      <Text style={[styles.offeringSemester, { color: colors.text }]}>{offering.semester}</Text>
                    </View>
                    <Text style={[styles.offeringCampus, { color: colors.textSecondary }]}>{offering.campus} Campus</Text>
                  </View>
                  <View style={styles.offeringDetails}>
                    <View style={styles.offeringDetail}>
                      <Ionicons name="person-outline" size={12} color={colors.textMuted} />
                      <Text style={[styles.offeringText, { color: colors.textSecondary }]}>{offering.instructor}</Text>
                    </View>
                    <View style={styles.offeringDetail}>
                      <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                      <Text style={[styles.offeringText, { color: colors.textSecondary }]}>{offering.dayOfWeek} {offering.startTime}-{offering.endTime}</Text>
                    </View>
                    <View style={styles.offeringDetail}>
                      <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                      <Text style={[styles.offeringText, { color: colors.textSecondary }]}>{offering.room}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {status === 'locked' && chain.length > 0 && (
            <View style={[styles.chainSection, { backgroundColor: colors.card, borderColor: Colors.warning + '30' }]}>
              <Text style={styles.chainTitle}>
                <Ionicons name="git-branch-outline" size={16} color={Colors.warning} /> Path to Unlock
              </Text>
              <Text style={[styles.chainSubtitle, { color: colors.textMuted }]}>Complete these courses in order:</Text>
              {chain.map((level, levelIndex) => (
                <View key={levelIndex} style={styles.chainLevel}>
                  <View style={styles.chainLevelHeader}>
                    <View style={styles.chainStepBadge}>
                      <Text style={styles.chainStepText}>Step {levelIndex + 1}</Text>
                    </View>
                    {levelIndex < chain.length - 1 && (
                      <View style={styles.chainConnector}>
                        <Ionicons name="arrow-down" size={14} color={colors.textMuted} />
                      </View>
                    )}
                  </View>
                  {level.map(course => {
                    const courseStatus = getCourseStatus(course.id);
                    return (
                      <Pressable
                        key={course.id}
                        style={styles.chainCourse}
                        onPress={() => router.push(`/course/${course.id}`)}
                      >
                        <Ionicons
                          name={courseStatus === 'completed' ? 'checkmark-circle' : courseStatus === 'available' ? 'arrow-forward-circle' : 'lock-closed'}
                          size={16}
                          color={courseStatus === 'completed' ? Colors.courseCompleted : courseStatus === 'available' ? Colors.primary : Colors.courseLocked}
                        />
                        <Text style={[styles.chainCourseCode, { color: colors.text }]}>{course.code}</Text>
                        <Text style={[styles.chainCourseTitle, { color: colors.textSecondary }]} numberOfLines={1}>{course.title}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          )}

          {missingPrereqs.length > 0 && (
            <View style={styles.autoSuggest}>
              <Ionicons name="bulb-outline" size={18} color={Colors.warning} />
              <View style={styles.autoSuggestContent}>
                <Text style={styles.autoSuggestTitle}>Prerequisite Path</Text>
                <Text style={[styles.autoSuggestText, { color: colors.textSecondary }]}>
                  To unlock this course, you need to complete:{'\n'}
                  {missingPrereqs.map(m => m.code).join(' → ')} → {course.code}
                </Text>
              </View>
            </View>
          )}

          <View style={[styles.notesSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.notesSectionTitle, { color: colors.textSecondary }]}>
              <Ionicons name="create-outline" size={16} color={colors.textSecondary} /> Personal Notes
            </Text>
            <TextInput
              style={[styles.notesInput, { color: colors.text, backgroundColor: colors.backgroundSecondary, borderColor: colors.cardBorder }]}
              placeholder="Add your notes about this course..."
              placeholderTextColor={colors.textMuted}
              value={noteText}
              onChangeText={handleNoteChange}
              onBlur={() => setCourseNote(courseId, noteText)}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  heroGradient: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  statusChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  gradeDisplay: {
    marginTop: 16,
    backgroundColor: Colors.courseCompleted + '15',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gradeDisplayLabel: {
    fontSize: 13,
    color: Colors.courseCompleted,
    fontFamily: 'Inter_500Medium',
  },
  gradeDisplayValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.courseCompleted,
    fontFamily: 'Inter_700Bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  actionBtn: {
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
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    fontFamily: 'Inter_600SemiBold',
  },
  prereqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 10,
  },
  prereqDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  prereqInfo: {
    flex: 1,
  },
  prereqCode: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  prereqTitle: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: 'Inter_500Medium',
  },
  missingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.danger + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  missingText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.danger,
    fontFamily: 'Inter_600SemiBold',
  },
  offeringCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  offeringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  offeringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  offeringSemester: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
  },
  offeringCampus: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  offeringDetails: {
    gap: 6,
  },
  offeringDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offeringText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
  },
  autoSuggest: {
    flexDirection: 'row',
    backgroundColor: Colors.warning + '10',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  autoSuggestContent: {
    flex: 1,
  },
  autoSuggestTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.warning,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  autoSuggestText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  chainSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  chainTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.warning,
    marginBottom: 4,
    fontFamily: 'Inter_600SemiBold',
  },
  chainSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 12,
    fontFamily: 'Inter_400Regular',
  },
  chainLevel: {
    marginBottom: 12,
  },
  chainLevelHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 6,
  },
  chainStepBadge: {
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  chainStepText: {
    fontSize: 11,
    color: Colors.warning,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
  },
  chainConnector: {
    marginLeft: 8,
  },
  chainCourse: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 8,
  },
  chainCourseCode: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
    minWidth: 70,
  },
  chainCourseTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  notesSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  notesSectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  notesInput: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Inter_400Regular',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
});
