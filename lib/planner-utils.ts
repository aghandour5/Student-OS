import { type SemesterPlan, type CourseWithPrereqs } from '@shared/schema';
import { type OfflineOffering } from '@/lib/offline-data';

export const FALL_SPRING_MAX_CREDITS = 18;
export const SUMMER_MAX_CREDITS = 9;

export const getMaxCredits = (season: string) => {
  return season === 'Summer' ? SUMMER_MAX_CREDITS : FALL_SPRING_MAX_CREDITS;
};

export const getSeasonOrder = (season: string) => {
  switch (season) {
    case 'Spring': return 0;
    case 'Summer': return 1;
    case 'Fall': return 2;
    default: return 3;
  }
};

export const getSemesterCredits = (plan: SemesterPlan, courseMap: Map<string, CourseWithPrereqs>) => {
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

export const detectConflicts = (
  plan: SemesterPlan,
  courseMap: Map<string, CourseWithPrereqs>,
  completedCourses: string[],
  inProgressCourses: string[],
  offerings: OfflineOffering[],
  arePrereqsMet: (id: string) => boolean,
  getMissingPrereqs: (id: string) => CourseWithPrereqs[]
): string[] => {
  const warnings: string[] = [];
  const credits = getSemesterCredits(plan, courseMap);

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

export const getDifficulty = (plan: SemesterPlan, courseMap: Map<string, CourseWithPrereqs>): number => {
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
  const credits = getSemesterCredits(plan, courseMap);
  const maxCredits = getMaxCredits(plan.season);
  const heavyLoad = plan.season === 'Summer' ? 7 : 16;

  if (credits > maxCredits) diff += 1.5;
  else if (credits >= heavyLoad) diff += 0.5;

  return Math.min(5, Math.max(1, Math.round(diff)));
};
