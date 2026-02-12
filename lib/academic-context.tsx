import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import {
  type CourseWithPrereqs, type SemesterPlan, type UserGrade, type UserProfile, type CourseNote,
  GRADE_POINTS
} from '@shared/schema';
import { offlineCourses } from './offline-data';
import { getApiUrl } from './query-client';

const STORAGE_KEY = '@uniflow_user_profile';

const DEFAULT_PROFILE: UserProfile = {
  major: 'Computer Engineering',
  campus: 'Main',
  startYear: 2024,
  completedCourses: [],
  inProgressCourses: [],
  semesterPlans: [],
  grades: [],
  notes: [],
};

type CourseStatus = 'completed' | 'in_progress' | 'available' | 'locked' | 'future';

interface AcademicContextValue {
  profile: UserProfile;
  courses: CourseWithPrereqs[];
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
  setGrade: (courseId: string, grade: string, score: number) => void;
  removeGrade: (courseId: string) => void;
  addSemesterPlan: (plan: SemesterPlan) => void;
  removeSemesterPlan: (planId: string) => void;
  addCourseToSemester: (planId: string, courseId: string) => void;
  removeCourseFromSemester: (planId: string, courseId: string) => void;
  setCourseNote: (courseId: string, note: string) => void;
  getCourseNote: (courseId: string) => string;
  getPrerequisiteChain: (courseId: string) => CourseWithPrereqs[][];
  calculateGPA: () => number;
  calculateSemesterGPA: (courseIds: string[]) => number;
  totalCredits: number;
  completedCredits: number;
  inProgressCredits: number;
  resetProfile: () => void;
}

const AcademicContext = createContext<AcademicContextValue | null>(null);

export function AcademicProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  // Check if server is available
  const serverUrl = getApiUrl();
  const { data: serverCourses, isLoading: serverLoading } = useQuery<CourseWithPrereqs[]>({
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use server courses if available, otherwise fall back to offline data
  const courses = serverCourses ?? offlineCourses;
  // Only show loading if we're actually trying to fetch from server
  const coursesLoading = serverUrl && serverLoading && !offlineCourses.length;

  // Update isOnline status based on server availability
  useEffect(() => {
    if (serverCourses !== undefined) {
      setIsOnline(true);
    } else if (serverUrl !== null) {
      // Server was configured but fetch failed or not yet complete
      setIsOnline(false);
    } else {
      // No server configured (offline mode)
      setIsOnline(false);
    }
  }, [serverCourses, serverUrl]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProfile({ ...DEFAULT_PROFILE, ...parsed });
        } catch {
          setProfile(DEFAULT_PROFILE);
        }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
  }, [profile, loaded]);

  const courseMap = useMemo(() => {
    const map = new Map<string, CourseWithPrereqs>();
    courses.forEach(c => map.set(c.id, c));
    return map;
  }, [courses]);

  const arePrereqsMet = useCallback((courseId: string): boolean => {
    const course = courseMap.get(courseId);
    if (!course) return false;
    if (course.prerequisites.length === 0) return true;
    return course.prerequisites.every(pid => profile.completedCourses.includes(pid));
  }, [courseMap, profile.completedCourses]);

  const getCourseStatus = useCallback((courseId: string): CourseStatus => {
    if (profile.completedCourses.includes(courseId)) return 'completed';
    if (profile.inProgressCourses.includes(courseId)) return 'in_progress';
    if (arePrereqsMet(courseId)) return 'available';
    return 'locked';
  }, [profile.completedCourses, profile.inProgressCourses, arePrereqsMet]);

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
      .filter(pid => !profile.completedCourses.includes(pid))
      .map(pid => courseMap.get(pid))
      .filter(Boolean) as CourseWithPrereqs[];
  }, [courseMap, profile.completedCourses]);

  const toggleCourseCompleted = useCallback((courseId: string) => {
    setProfile(prev => {
      const isCompleted = prev.completedCourses.includes(courseId);
      if (isCompleted) {
        return {
          ...prev,
          completedCourses: prev.completedCourses.filter(id => id !== courseId),
          grades: prev.grades.filter(g => g.courseId !== courseId),
        };
      }
      return {
        ...prev,
        completedCourses: [...prev.completedCourses, courseId],
        inProgressCourses: prev.inProgressCourses.filter(id => id !== courseId),
      };
    });
  }, []);

  const toggleCourseInProgress = useCallback((courseId: string) => {
    setProfile(prev => {
      const isInProgress = prev.inProgressCourses.includes(courseId);
      if (isInProgress) {
        return {
          ...prev,
          inProgressCourses: prev.inProgressCourses.filter(id => id !== courseId),
        };
      }
      return {
        ...prev,
        inProgressCourses: [...prev.inProgressCourses, courseId],
        completedCourses: prev.completedCourses.filter(id => id !== courseId),
      };
    });
  }, []);

  const isYearCompleted = useCallback((year: number): boolean => {
    const yearCourses = courses.filter(c => c.year === year);
    if (yearCourses.length === 0) return false;
    return yearCourses.every(c => profile.completedCourses.includes(String(c.id)));
  }, [courses, profile.completedCourses]);

  const toggleYearCompleted = useCallback((year: number) => {
    setProfile(prev => {
      const yearCourseIds = courses.filter(c => c.year === year).map(c => String(c.id));
      const allCompleted = yearCourseIds.every(id => prev.completedCourses.includes(id));

      if (allCompleted) {
        return {
          ...prev,
          completedCourses: prev.completedCourses.filter(id => !yearCourseIds.includes(id)),
          grades: prev.grades.filter(g => !yearCourseIds.includes(g.courseId)),
        };
      }
      const newCompleted = [...new Set([...prev.completedCourses, ...yearCourseIds])];
      const newInProgress = prev.inProgressCourses.filter(id => !yearCourseIds.includes(id));
      return {
        ...prev,
        completedCourses: newCompleted,
        inProgressCourses: newInProgress,
      };
    });
  }, [courses]);

  const setGrade = useCallback((courseId: string, grade: string, score: number) => {
    setProfile(prev => ({
      ...prev,
      grades: [
        ...prev.grades.filter(g => g.courseId !== courseId),
        { courseId, grade, score },
      ],
      completedCourses: prev.completedCourses.includes(courseId)
        ? prev.completedCourses
        : [...prev.completedCourses, courseId],
      inProgressCourses: prev.inProgressCourses.filter(id => id !== courseId),
    }));
  }, []);

  const removeGrade = useCallback((courseId: string) => {
    setProfile(prev => ({
      ...prev,
      grades: prev.grades.filter(g => g.courseId !== courseId),
    }));
  }, []);

  const addSemesterPlan = useCallback((plan: SemesterPlan) => {
    setProfile(prev => ({
      ...prev,
      semesterPlans: [...prev.semesterPlans, plan],
    }));
  }, []);

  const removeSemesterPlan = useCallback((planId: string) => {
    setProfile(prev => ({
      ...prev,
      semesterPlans: prev.semesterPlans.filter(p => p.id !== planId),
    }));
  }, []);

  const addCourseToSemester = useCallback((planId: string, courseId: string) => {
    setProfile(prev => ({
      ...prev,
      semesterPlans: prev.semesterPlans.map(plan =>
        plan.id === planId && !plan.courseIds.includes(courseId)
          ? { ...plan, courseIds: [...plan.courseIds, courseId] }
          : plan
      ),
    }));
  }, []);

  const removeCourseFromSemester = useCallback((planId: string, courseId: string) => {
    setProfile(prev => ({
      ...prev,
      semesterPlans: prev.semesterPlans.map(plan =>
        plan.id === planId
          ? { ...plan, courseIds: plan.courseIds.filter(id => id !== courseId) }
          : plan
      ),
    }));
  }, []);

  const calculateGPA = useCallback((): number => {
    if (profile.grades.length === 0) return 0;
    let totalPoints = 0;
    let totalCredits = 0;
    for (const g of profile.grades) {
      const course = courseMap.get(g.courseId);
      if (!course) continue;
      const gradePoint = GRADE_POINTS[g.grade] ?? 0;
      totalPoints += gradePoint * course.credits;
      totalCredits += course.credits;
    }
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }, [profile.grades, courseMap]);

  const calculateSemesterGPA = useCallback((courseIds: string[]): number => {
    const semesterGrades = profile.grades.filter(g => courseIds.includes(g.courseId));
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
  }, [profile.grades, courseMap]);

  const totalCredits = useMemo(() => courses.reduce((sum, c) => sum + c.credits, 0), [courses]);

  const completedCredits = useMemo(() => {
    return profile.completedCourses.reduce((sum, cid) => {
      const course = courseMap.get(cid);
      return sum + (course?.credits ?? 0);
    }, 0);
  }, [profile.completedCourses, courseMap]);

  const inProgressCredits = useMemo(() => {
    return profile.inProgressCourses.reduce((sum, cid) => {
      const course = courseMap.get(cid);
      return sum + (course?.credits ?? 0);
    }, 0);
  }, [profile.inProgressCourses, courseMap]);

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

  const getPrerequisiteChain = useCallback((courseId: string): CourseWithPrereqs[][] => {
    const chain: CourseWithPrereqs[][] = [];
    let currentLevel = [courseId];
    const visited = new Set<string>();

    while (currentLevel.length > 0) {
      const nextLevel: string[] = [];
      const levelCourses: CourseWithPrereqs[] = [];

      for (const id of currentLevel) {
        if (visited.has(id)) continue;
        visited.add(id);
        const course = courseMap.get(id);
        if (!course) continue;

        const missingPrereqs = course.prerequisites.filter(pid => !profile.completedCourses.includes(pid));
        if (missingPrereqs.length > 0) {
          for (const pid of missingPrereqs) {
            if (!visited.has(pid)) {
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

    return chain.reverse();
  }, [courseMap, profile.completedCourses]);

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({
    profile,
    courses,
    isLoading: coursesLoading || !loaded,
    isOnline,
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
    setCourseNote,
    getCourseNote,
    getPrerequisiteChain,
    calculateGPA,
    calculateSemesterGPA,
    totalCredits,
    completedCredits,
    inProgressCredits,
    resetProfile,
  }), [
    profile, courses, coursesLoading, loaded, isOnline,
    getCourseStatus, getPrerequisitesFor, getUnlockedBy, arePrereqsMet, getMissingPrereqs,
    toggleCourseCompleted, toggleCourseInProgress, toggleYearCompleted, isYearCompleted,
    setGrade, removeGrade,
    addSemesterPlan, removeSemesterPlan, addCourseToSemester, removeCourseFromSemester,
    setCourseNote, getCourseNote, getPrerequisiteChain,
    calculateGPA, calculateSemesterGPA,
    totalCredits, completedCredits, inProgressCredits, resetProfile,
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

