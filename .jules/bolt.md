## 2026-06-01 - Optimize O(N) array lookups to O(1) Set lookups
**Learning:** Checking prerequisites and course statuses uses `.includes()` on arrays like `completedCourses` inside frequently called hooks and context methods. This causes an O(N) performance bottleneck when iterating over lists of courses, especially inside maps or loops.
**Action:** Convert arrays like `completedCourses` and `inProgressCourses` into `Set`s locally within the context or memoize them, then use `.has()` for O(1) lookups.
