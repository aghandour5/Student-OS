import type { CourseWithPrereqs } from '@shared/schema';

/**
 * Build the full prerequisite chain for a course using BFS.
 * Returns an array of levels — level 0 is the furthest-back prerequisites,
 * and the last level is the direct prerequisites of the target course.
 * Only includes courses the student has NOT yet completed.
 *
 * Optimized to avoid duplicates in diamond dependencies.
 */
export function computePrerequisiteChain(
  targetCourseId: string,
  courseMap: Map<string, CourseWithPrereqs>,
  completedCourses: string[] | undefined
): CourseWithPrereqs[][] {
  const chain: CourseWithPrereqs[][] = [];
  let currentLevel = [targetCourseId];
  const visited = new Set<string>();
  const completedSet = new Set(completedCourses || []);

  // visited tracks all nodes we have *expanded* or *enqueued* to prevent cycles/re-processing
  visited.add(targetCourseId);

  while (currentLevel.length > 0) {
    const nextLevelIds: string[] = [];
    const levelCourses: CourseWithPrereqs[] = [];

    // Use a Set for the next level to strictly ensure uniqueness,
    // though the 'visited' check also handles cross-parent duplicates.
    // We iterate currentLevel, find children.

    for (const id of currentLevel) {
      const course = courseMap.get(id);
      if (!course) continue;

      // Find missing prerequisites for this course
      const missingPrereqs = course.prerequisites.filter(pid => !completedSet.has(pid));

      for (const pid of missingPrereqs) {
        if (!visited.has(pid)) {
          // Add to visited immediately so we don't add it again in this level (via another parent)
          visited.add(pid);

          const prereqCourse = courseMap.get(pid);
          if (prereqCourse) {
            levelCourses.push(prereqCourse);
            nextLevelIds.push(pid);
          }
        }
      }
    }

    if (levelCourses.length > 0) {
      chain.push(levelCourses);
      currentLevel = nextLevelIds;
    } else {
      currentLevel = [];
    }
  }

  // Reverse so that the earliest prerequisites appear first (level 0)
  return chain.reverse();
}
