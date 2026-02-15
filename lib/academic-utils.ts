import type { CourseWithPrereqs } from '@shared/schema';

export type CourseStatus = 'completed' | 'in_progress' | 'available' | 'locked' | 'future';

/**
 * Checks if all prerequisites for a course are completed.
 * Uses a Set for O(1) lookup of completed courses.
 */
export function arePrereqsMet(
  course: CourseWithPrereqs,
  completedCoursesSet: Set<string>
): boolean {
  if (course.prerequisites.length === 0) return true;
  return course.prerequisites.every(pid => completedCoursesSet.has(pid));
}

/**
 * Determines the status of a course based on student progress.
 * optimized with O(1) Set lookups.
 */
export function getCourseStatus(
  courseId: string,
  completedCoursesSet: Set<string>,
  inProgressCoursesSet: Set<string>,
  courseMap: Map<string, CourseWithPrereqs>
): CourseStatus {
  if (completedCoursesSet.has(courseId)) return 'completed';
  if (inProgressCoursesSet.has(courseId)) return 'in_progress';

  const course = courseMap.get(courseId);
  if (!course) return 'locked';

  if (arePrereqsMet(course, completedCoursesSet)) return 'available';
  return 'locked';
}

/**
 * Returns a list of prerequisites that are NOT yet completed.
 */
export function getMissingPrereqs(
  course: CourseWithPrereqs,
  completedCoursesSet: Set<string>,
  courseMap: Map<string, CourseWithPrereqs>
): CourseWithPrereqs[] {
  return course.prerequisites
    .filter(pid => !completedCoursesSet.has(pid))
    .map(pid => courseMap.get(pid))
    .filter((c): c is CourseWithPrereqs => !!c);
}

/**
 * Checks if all courses in a given year are completed.
 */
export function isYearCompleted(
  year: number,
  allCourses: CourseWithPrereqs[],
  completedCoursesSet: Set<string>
): boolean {
  const yearCourses = allCourses.filter(c => c.year === year);
  if (yearCourses.length === 0) return false;
  return yearCourses.every(c => completedCoursesSet.has(c.id));
}

/**
 * Builds a visual chain of prerequisites for a course (BFS).
 * Only includes prerequisites that are NOT completed.
 */
export function getPrerequisiteChain(
  courseId: string,
  courseMap: Map<string, CourseWithPrereqs>,
  completedCoursesSet: Set<string>
): CourseWithPrereqs[][] {
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

      // Only include prerequisites that are NOT completed
      const missingPrereqs = course.prerequisites.filter(pid => !completedCoursesSet.has(pid));

      if (missingPrereqs.length > 0) {
        for (const pid of missingPrereqs) {
          // Avoid duplicate processing in the next level
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
    // Filter duplicates in nextLevel to avoid processing same node twice?
    // Actually `visited` handles checking if we already visited `id`.
    // But pushing to `nextLevel` multiple times is okay as long as we check visited when popping.
    currentLevel = nextLevel;
  }

  return chain.reverse();
}
