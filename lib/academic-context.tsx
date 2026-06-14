/**
 * AcademicContext — Central state manager for student academic data.
 *
 * Architecture:
 * - Offline-first: uses embedded course data from offline-data.ts as the default.
 * - When a server URL is configured (EXPO_PUBLIC_DOMAIN), attempts to fetch
 *   live course/offering data via React Query, falling back to offline data.
 * - Student profile (completed courses, grades, semester plans, notes) is
 *   persisted to AsyncStorage and hydrated on launch.
 */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import {
  type CourseWithPrereqs, type SemesterPlan, type UserGrade, type UserProfile, type CourseNote,
  GRADE_POINTS
} from '@shared/schema';
import { offlineCourses, offlineOfferings, type OfflineOffering } from './offline-data';
import { getApiUrl } from './query-client';
import { useAuth } from './auth-context';

// AsyncStorage key for persisted student profile
const STORAGE_KEY = '@uniflow_user_profile';

const DEFAULT_MAJOR_PROGRESS = {
  completedCourses: [],
  inProgressCourses: [],
  semesterPlans: [],
  grades: [],
};

const DEFAULT_PROFILE: UserProfile = {
  major: 'CENG',
  campus: 'Nabatieh',
  startYear: 2024,
  progress: {
    'CENG': { ...DEFAULT_MAJOR_PROGRESS },
    'EENG': { ...DEFAULT_MAJOR_PROGRESS },
    'MENG': { ...DEFAULT_MAJOR_PROGRESS },
  },
  notes: [],
};

/** Course lifecycle states — determines visual treatment and interaction availability */
type CourseStatus = 'completed' | 'in_progress' | 'available' | 'locked' | 'future';

interface AcademicContextValue {
  profile: UserProfile;
  courses: CourseWithPrereqs[];
  offerings: OfflineOffering[];
  isLoading: boolean;
  isOnline: boolean;
  getCourseStatus: (courseId: string) => CourseStatus;
  getPrerequisitesFor: (courseId: string) => CourseWithPrereqs[];
  getUnlockedBy: (courseId: string) => CourseWithPrereqs[];
  arePrereqsMet: (courseId: string) => boolean;
  getMissingPrereqs: (courseId: string) => CourseWithPrereqs[];
  toggleCourseCompleted: (courseId: string) => void;
  toggleCourseInProgress: (courseId: string) => void;
  toggleYearCompleted: (year: number) => void;
  isYearCompleted: (year: number) => boolean;
  grades: UserGrade[];
  semesterPlans: SemesterPlan[];
  completedCourses: string[];
  inProgressCourses: string[];
  setGrade: (courseId: string, grade: string, score: number) => void;
  removeGrade: (courseId: string) => void;
  addSemesterPlan: (plan: SemesterPlan) => void;
  removeSemesterPlan: (planId: string) => void;
  addCourseToSemester: (planId: string, courseId: string) => void;
  removeCourseFromSemester: (planId: string, courseId: string) => void;
  setSelectedOffering: (planId: string, courseId: string, offeringId: string) => void;
  getOfferingsForCourse: (courseId: string, semester?: string) => OfflineOffering[];
  setCourseNote: (courseId: string, note: string) => void;
  getCourseNote: (courseId: string) => string;
  getPrerequisiteChain: (courseId: string) => CourseWithPrereqs[][];
  calculateGPA: () => number;
  calculateSemesterGPA: (courseIds: string[]) => number;
  totalCredits: number;
  completedCredits: number;
  inProgressCredits: number;
  resetProfile: () => void;
  setMajor: (major: string) => void;
}

const AcademicContext = createContext<AcademicContextValue | null>(null);

export function AcademicProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const { userProfile: authProfile, isGuest } = useAuth();

  // Sync major from authenticated user's Firestore profile
  useEffect(() => {
    if (authProfile?.major && !isGuest) {
      setProfile(prev => {
        if (prev.major !== authProfile.major) {
          const updatedProgress = { ...prev.progress };
          if (!updatedProgress[authProfile.major]) {
            updatedProgress[authProfile.major] = { ...DEFAULT_MAJOR_PROGRESS };
          }
          return { ...prev, major: authProfile.major, progress: updatedProgress };
        }
        return prev;
      });
    }
  }, [authProfile?.major, isGuest]);

  // Check if server is available
  const serverUrl = getApiUrl();
  const { data: serverCourses, isLoading: serverLoading, isError: coursesError } = useQuery<CourseWithPrereqs[]>({
    queryKey: ['/api/courses'],
    queryFn: async () => {
      const baseUrl = getApiUrl();
      if (!baseUrl) {
        throw new Error('Server not available');
      }
      const res = await fetch(`${baseUrl}/api/courses`);
      if (!res.ok) throw new Error('Failed to fetch courses');
      return res.json();
    },
    enabled: !!serverUrl, // Only run if server URL is configured
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 15 * 1000, // Re-check every 10 seconds for dynamic status
  });

  // Fetch offerings from server
  const { data: serverOfferings } = useQuery<OfflineOffering[]>({
    queryKey: ['/api/offerings'],
    queryFn: async () => {
      const baseUrl = getApiUrl();
      if (!baseUrl) throw new Error('Server not available');
      const res = await fetch(`${baseUrl}/api/offerings`);
      if (!res.ok) throw new Error('Failed to fetch offerings');
      return res.json();
    },
    enabled: !!serverUrl,
    retry: 1,
    staleTime: 30 * 1000,
    refetchInterval: 15 * 1000,

  });

  // Check if server is available and successfully fetched data
  const hasServerConnection = serverCourses !== undefined && !coursesError;

  // Filter courses based on selected major (or shared)
  const courses = useMemo(() => {
    const rawCourses = hasServerConnection ? serverCourses : offlineCourses;
    // Normalize to 'CENG' or 'EENG' just in case
    const currentMajor = profile.major === 'Electrical Engineering' ? 'EENG' :
      profile.major === 'Computer Engineering' ? 'CENG' :
        profile.major === 'Mechanical Engineering' ? 'MENG' :
          profile.major;

    return rawCourses.filter(c => c.major === currentMajor || c.major === 'shared');
  }, [hasServerConnection, serverCourses, profile.major]);

  // Filter offerings based on available courses
  const offerings = useMemo(() => {
    const rawOfferings = (hasServerConnection && serverOfferings) ? serverOfferings : offlineOfferings;
    const courseIds = new Set(courses.map(c => c.id));
    return rawOfferings.filter(o => courseIds.has(o.courseId));
  }, [hasServerConnection, serverOfferings, courses]);

  // Dynamically update isOnline status — reacts to successful fetches or errors
  useEffect(() => {
    if (serverCourses !== undefined && !coursesError) {
      setIsOnline(true);
    } else {
      setIsOnline(false);
    }
  }, [serverCourses, coursesError]);

  // Hydrate profile from AsyncStorage on mount. Merges saved data with
  // DEFAULT_PROFILE to handle schema additions between versions.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);

          // Normalize legacy major names
          if (parsed.major === 'Computer Engineering') parsed.major = 'CENG';
          if (parsed.major === 'Electrical Engineering') parsed.major = 'EENG';

          // Migration: Move legacy fields to progress['CENG'] if needed
          if (!parsed.progress) {
            console.log('Migrating legacy profile to multi-major structure...');
            const legacyProgress = {
              completedCourses: parsed.completedCourses || [],
              inProgressCourses: parsed.inProgressCourses || [],
              semesterPlans: parsed.semesterPlans || [],
              grades: parsed.grades || [],
            };
            parsed.progress = {
              'CENG': legacyProgress,
              'EENG': { ...DEFAULT_MAJOR_PROGRESS },
            };
            // Clean up legacy fields (optional, but good for clarity)
            delete parsed.completedCourses;
            delete parsed.inProgressCourses;
            delete parsed.semesterPlans;
            delete parsed.grades;
          }

          // Merge deeply to ensure all major keys exist
          const merged = { ...DEFAULT_PROFILE, ...parsed };
          if (!merged.progress['EENG']) merged.progress['EENG'] = { ...DEFAULT_MAJOR_PROGRESS };
          if (!merged.progress['MENG']) merged.progress['MENG'] = { ...DEFAULT_MAJOR_PROGRESS };

          setProfile(merged);
        } catch (e) {
          console.error('Failed to parse profile:', e);
          setProfile(DEFAULT_PROFILE);
        }
      } else {
        setProfile(DEFAULT_PROFILE);
      }
      setLoaded(true);
    });
  }, []);

  // Persist profile to AsyncStorage whenever it changes (after initial hydration)
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
  }, [profile, loaded]);


  // Memoized derived arrays/sets for O(1) lookups and dependency scoping
  const currentMajorProgress = profile.progress[profile.major];
  const completedCoursesArray = currentMajorProgress?.completedCourses;
  const inProgressCoursesArray = currentMajorProgress?.inProgressCourses;

  const completedSet = useMemo(() => new Set(completedCoursesArray || []), [completedCoursesArray]);
  const inProgressSet = useMemo(() => new Set(inProgressCoursesArray || []), [inProgressCoursesArray]);

  // O(1) course lookup used by most callbacks below
  const courseMap = useMemo(() => {
    const map = new Map<string, CourseWithPrereqs>();
    courses.forEach(c => map.set(c.id, c));
    return map;
  }, [courses]);

  /** Check if all prerequisite courses are in the student's completedCourses list */
  const arePrereqsMet = useCallback((courseId: string): boolean => {
    const course = courseMap.get(courseId);
    if (!course) return false;
    if (course.prerequisites.length === 0) return true;
    return course.prerequisites.every(pid => completedSet.has(pid));
  }, [courseMap, completedSet]);

  /** Resolve course status with priority: completed > in_progress > available > locked */
  const getCourseStatus = useCallback((courseId: string): CourseStatus => {
    if (completedSet.has(courseId)) return 'completed';
    if (inProgressSet.has(courseId)) return 'in_progress';
    if (arePrereqsMet(courseId)) return 'available';
    return 'locked';
  }, [completedSet, inProgressSet, arePrereqsMet]);

  const getPrerequisitesFor = useCallback((courseId: string): CourseWithPrereqs[] => {
    const course = courseMap.get(courseId);
    if (!course) return [];
    return course.prerequisites.map(pid => courseMap.get(pid)).filter(Boolean) as CourseWithPrereqs[];
  }, [courseMap]);

  const getUnlockedBy = useCallback((courseId: string): CourseWithPrereqs[] => {
    const course = courseMap.get(courseId);
    if (!course) return [];
    return course.unlocks.map(uid => courseMap.get(uid)).filter(Boolean) as CourseWithPrereqs[];
  }, [courseMap]);

  const getMissingPrereqs = useCallback((courseId: string): CourseWithPrereqs[] => {
    const course = courseMap.get(courseId);
    if (!course) return [];
    return course.prerequisites
      .filter(pid => !completedSet.has(pid))
      .map(pid => courseMap.get(pid))
      .filter(Boolean) as CourseWithPrereqs[];
  }, [courseMap, completedSet]);

  /** Toggle a course between completed and not-completed.
   *  Completing also removes from inProgress; un-completing also removes its grade. */
  const toggleCourseCompleted = useCallback((courseId: string) => {
    setProfile(prev => {
      const currentP = prev.progress[prev.major];
      const isCompleted = currentP.completedCourses.includes(courseId);

      let newP;
      if (isCompleted) {
        newP = {
          ...currentP,
          completedCourses: currentP.completedCourses.filter(id => id !== courseId),
          grades: currentP.grades.filter(g => g.courseId !== courseId),
        };
      } else {
        newP = {
          ...currentP,
          completedCourses: [...currentP.completedCourses, courseId],
          inProgressCourses: currentP.inProgressCourses.filter(id => id !== courseId),
        };
      }

      return {
        ...prev,
        progress: { ...prev.progress, [prev.major]: newP }
      };
    });
  }, []);

  const toggleCourseInProgress = useCallback((courseId: string) => {
    setProfile(prev => {
      const currentP = prev.progress[prev.major];
      const isInProgress = currentP.inProgressCourses.includes(courseId);

      let newP;
      if (isInProgress) {
        newP = {
          ...currentP,
          inProgressCourses: currentP.inProgressCourses.filter(id => id !== courseId),
        };
      } else {
        newP = {
          ...currentP,
          inProgressCourses: [...currentP.inProgressCourses, courseId],
          completedCourses: currentP.completedCourses.filter(id => id !== courseId),
        };
      }

      return {
        ...prev,
        progress: { ...prev.progress, [prev.major]: newP }
      };
    });
  }, []);

  const isYearCompleted = useCallback((year: number): boolean => {
    const yearCourses = courses.filter(c => c.year === year);
    if (yearCourses.length === 0) return false;
    return yearCourses.every(c => completedSet.has(String(c.id)));
  }, [courses, completedSet]);

  const toggleYearCompleted = useCallback((year: number) => {
    setProfile(prev => {
      const currentP = prev.progress[prev.major];
      if (!currentP) return prev; // Safety check

      const yearCourseIds = courses.filter(c => c.year === year).map(c => String(c.id));
      const allCompleted = yearCourseIds.every(id => currentP.completedCourses.includes(id));

      let newP;
      if (allCompleted) {
        // Unchecking a year: also uncheck all LATER years (cascade down)
        const yearsToRemove = courses
          .filter(c => c.year >= year)
          .map(c => String(c.id));
        newP = {
          ...currentP,
          completedCourses: currentP.completedCourses.filter(id => !yearsToRemove.includes(id)),
          grades: currentP.grades.filter(g => !yearsToRemove.includes(g.courseId)),
        };
      } else {
        // Checking a year: also check all PREVIOUS years (cascade up)
        const yearsToAdd = courses
          .filter(c => c.year <= year)
          .map(c => String(c.id));
        const newCompleted = [...new Set([...currentP.completedCourses, ...yearsToAdd])];
        const newInProgress = currentP.inProgressCourses.filter(id => !yearsToAdd.includes(id));
        newP = {
          ...currentP,
          completedCourses: newCompleted,
          inProgressCourses: newInProgress,
        };
      }

      return {
        ...prev,
        progress: { ...prev.progress, [prev.major]: newP }
      };
    });
  }, [courses]);

  const setGrade = useCallback((courseId: string, grade: string, score: number) => {
    setProfile(prev => {
      const currentP = prev.progress[prev.major];
      const newP = {
        ...currentP,
        grades: [
          ...currentP.grades.filter(g => g.courseId !== courseId),
          { courseId, grade, score },
        ],
        completedCourses: currentP.completedCourses.includes(courseId)
          ? currentP.completedCourses
          : [...currentP.completedCourses, courseId],
        inProgressCourses: currentP.inProgressCourses.filter(id => id !== courseId),
      };

      return {
        ...prev,
        progress: { ...prev.progress, [prev.major]: newP }
      };
    });
  }, []);

  const removeGrade = useCallback((courseId: string) => {
    setProfile(prev => {
      const currentP = prev.progress[prev.major];
      const newP = {
        ...currentP,
        grades: currentP.grades.filter(g => g.courseId !== courseId),
      };
      return {
        ...prev,
        progress: { ...prev.progress, [prev.major]: newP }
      };
    });
  }, []);

  const addSemesterPlan = useCallback((plan: SemesterPlan) => {
    setProfile(prev => {
      const currentP = prev.progress[prev.major];
      const newP = {
        ...currentP,
        semesterPlans: [...currentP.semesterPlans, plan],
      };
      return {
        ...prev,
        progress: { ...prev.progress, [prev.major]: newP }
      };
    });
  }, []);

  const removeSemesterPlan = useCallback((planId: string) => {
    setProfile(prev => {
      const currentP = prev.progress[prev.major];
      const newP = {
        ...currentP,
        semesterPlans: currentP.semesterPlans.filter(p => p.id !== planId),
      };
      return {
        ...prev,
        progress: { ...prev.progress, [prev.major]: newP }
      };
    });
  }, []);

  const addCourseToSemester = useCallback((planId: string, courseId: string) => {
    setProfile(prev => {
      const currentP = prev.progress[prev.major];
      const newP = {
        ...currentP,
        semesterPlans: currentP.semesterPlans.map(plan =>
          plan.id === planId && !plan.courseIds.includes(courseId)
            ? { ...plan, courseIds: [...plan.courseIds, courseId] }
            : plan
        ),
      };
      return {
        ...prev,
        progress: { ...prev.progress, [prev.major]: newP }
      };
    });
  }, []);

  const removeCourseFromSemester = useCallback((planId: string, courseId: string) => {
    setProfile(prev => {
      const currentP = prev.progress[prev.major];
      const newP = {
        ...currentP,
        semesterPlans: currentP.semesterPlans.map(plan => {
          if (plan.id !== planId) return plan;
          const newOfferings = { ...plan.selectedOfferings };
          delete newOfferings[courseId];
          return {
            ...plan,
            courseIds: plan.courseIds.filter(id => id !== courseId),
            selectedOfferings: newOfferings,
          };
        }),
      };
      return {
        ...prev,
        progress: { ...prev.progress, [prev.major]: newP }
      };
    });
  }, []);

  const setSelectedOffering = useCallback((planId: string, courseId: string, offeringId: string) => {
    setProfile(prev => {
      const currentP = prev.progress[prev.major];
      const newP = {
        ...currentP,
        semesterPlans: currentP.semesterPlans.map(plan =>
          plan.id === planId
            ? { ...plan, selectedOfferings: { ...plan.selectedOfferings, [courseId]: offeringId } }
            : plan
        ),
      };
      return {
        ...prev,
        progress: { ...prev.progress, [prev.major]: newP }
      };
    });
  }, []);

  const getOfferingsForCourse = useCallback((courseId: string, semester?: string): OfflineOffering[] => {
    return offerings.filter(o => o.courseId === courseId && (!semester || o.semester === semester));
  }, [offerings]);

  /** Compute cumulative GPA: sum(gradePoint × credits) / sum(credits) */
  const calculateGPA = useCallback((): number => {
    const currentProgress = profile.progress[profile.major];
    if (!currentProgress || currentProgress.grades.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;
    for (const g of currentProgress.grades) {
      const course = courseMap.get(g.courseId);
      if (!course) continue;
      const gradePoint = GRADE_POINTS[g.grade] ?? 0;
      totalPoints += gradePoint * course.credits;
      totalCredits += course.credits;
    }
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }, [profile, courseMap]);

  const calculateSemesterGPA = useCallback((courseIds: string[]): number => {
    const currentProgress = profile.progress[profile.major];
    if (!currentProgress) return 0;

    const semesterGrades = currentProgress.grades.filter(g => courseIds.includes(g.courseId));
    if (semesterGrades.length === 0) return 0;
    let totalPoints = 0;
    let totalCredits = 0;
    for (const g of semesterGrades) {
      const course = courseMap.get(g.courseId);
      if (!course) continue;
      const gradePoint = GRADE_POINTS[g.grade] ?? 0;
      totalPoints += gradePoint * course.credits;
      totalCredits += course.credits;
    }
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }, [profile, courseMap]);

  const totalCredits = useMemo(() => courses.reduce((sum, c) => sum + c.credits, 0), [courses]);

  const completedCredits = useMemo(() => {
    const currentProgress = profile.progress[profile.major];
    if (!currentProgress) return 0;

    return currentProgress.completedCourses.reduce((sum, cid) => {
      const course = courseMap.get(cid);
      return sum + (course?.credits ?? 0);
    }, 0);
  }, [profile, courseMap]);

  const inProgressCredits = useMemo(() => {
    const currentProgress = profile.progress[profile.major];
    if (!currentProgress) return 0;

    return currentProgress.inProgressCourses.reduce((sum, cid) => {
      const course = courseMap.get(cid);
      return sum + (course?.credits ?? 0);
    }, 0);
  }, [profile, courseMap]);

  const setCourseNote = useCallback((courseId: string, note: string) => {
    setProfile(prev => ({
      ...prev,
      notes: [
        ...prev.notes.filter(n => n.courseId !== courseId),
        ...(note.trim() ? [{ courseId, note: note.trim() }] : []),
      ],
    }));
  }, []);

  const getCourseNote = useCallback((courseId: string): string => {
    return profile.notes?.find(n => n.courseId === courseId)?.note ?? '';
  }, [profile.notes]);

  /**
   * Build the full prerequisite chain for a course using BFS.
   * Returns an array of levels — level 0 is the furthest-back prerequisites,
   * and the last level is the direct prerequisites of the target course.
   * Only includes courses the student has NOT yet completed.
   */
  const getPrerequisiteChain = useCallback((courseId: string): CourseWithPrereqs[][] => {
    const chain: CourseWithPrereqs[][] = [];
    let currentLevel = [courseId];
    const visited = new Set<string>();

    while (currentLevel.length > 0) {
      const nextLevel: string[] = [];
      const nextLevelSet = new Set<string>();
      const levelCourses: CourseWithPrereqs[] = [];

      for (const id of currentLevel) {
        if (visited.has(id)) continue;
        visited.add(id);
        const course = courseMap.get(id);
        if (!course) continue;

        const missingPrereqs = course.prerequisites.filter(pid => !completedSet.has(pid));
        if (missingPrereqs.length > 0) {
          for (const pid of missingPrereqs) {
            if (!visited.has(pid) && !nextLevelSet.has(pid)) {
              nextLevelSet.add(pid);
              const prereqCourse = courseMap.get(pid);
              if (prereqCourse) {
                levelCourses.push(prereqCourse);
                nextLevel.push(pid);
              }
            }
          }
        }
      }

      if (levelCourses.length > 0) {
        chain.push(levelCourses);
      }
      currentLevel = nextLevel;
    }

    // Reverse so that the earliest prerequisites appear first
    return chain.reverse();
  }, [courseMap, completedSet]);

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const setMajor = useCallback((major: string) => {
    setProfile(prev => {
      // Ensure the new major has initialized progress structure if it doesn't exist
      const updatedProgress = { ...prev.progress };
      if (!updatedProgress[major]) {
        updatedProgress[major] = { ...DEFAULT_MAJOR_PROGRESS };
      }
      return { ...prev, major, progress: updatedProgress };
    });
  }, []);

  const value = useMemo(() => ({
    profile,
    courses,
    offerings,
    isLoading: !loaded,
    isOnline: hasServerConnection,
    getCourseStatus,
    getPrerequisitesFor,
    getUnlockedBy,
    arePrereqsMet,
    getMissingPrereqs,
    toggleCourseCompleted,
    toggleCourseInProgress,
    toggleYearCompleted,
    isYearCompleted,
    setGrade,
    removeGrade,
    addSemesterPlan,
    removeSemesterPlan,
    addCourseToSemester,
    removeCourseFromSemester,
    setSelectedOffering,
    getOfferingsForCourse,
    setCourseNote,
    getCourseNote,
    getPrerequisiteChain,
    calculateGPA,
    calculateSemesterGPA,
    totalCredits,
    completedCredits,
    inProgressCredits,
    resetProfile,
    setMajor,
    grades: profile.progress[profile.major]?.grades ?? [],
    semesterPlans: profile.progress[profile.major]?.semesterPlans ?? [],
    completedCourses: profile.progress[profile.major]?.completedCourses ?? [],
    inProgressCourses: profile.progress[profile.major]?.inProgressCourses ?? [],
  }), [
    profile, courses, offerings, loaded, serverUrl, serverLoading, hasServerConnection,
    getCourseStatus, getPrerequisitesFor, getUnlockedBy, arePrereqsMet, getMissingPrereqs,
    toggleCourseCompleted, toggleCourseInProgress, toggleYearCompleted, isYearCompleted,
    setGrade, removeGrade, addSemesterPlan, removeSemesterPlan, addCourseToSemester,
    removeCourseFromSemester, setSelectedOffering, getOfferingsForCourse,
    setCourseNote, getCourseNote, getPrerequisiteChain, calculateGPA, calculateSemesterGPA,
    totalCredits, completedCredits, inProgressCredits, resetProfile, setMajor
  ]);

  return (
    <AcademicContext.Provider value={value}>
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
}

