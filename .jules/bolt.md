## 2025-02-17 - O(1) Prerequisite Validation

**Learning:** Re-evaluating arrays with `Array.includes()` for checking prerequisites inside deeply nested callback functions (like `arePrereqsMet` and `getPrerequisiteChain` in `lib/academic-context.tsx`) leads to O(N^2) or O(N^3) time complexity across repeated UI renders. `completedCourses` array looks small initially, but the algorithm re-computes these repeatedly.

**Action:** Extracted `completedCoursesArray` and converted them into `completedSet = useMemo(() => new Set(completedCoursesArray), ...)` once at the context scope, changing multiple `O(N)` inclusion checks into `O(1)` set lookups, vastly accelerating performance with nearly no overhead. Used `completedSet.has()` instead of `.includes()`. Applied Set creation safely locally inside hooks without violating reference integrity by scoping dependencies accurately.
