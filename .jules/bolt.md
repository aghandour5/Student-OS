
## 2024-03-25 - O(1) Sets instead of Arrays for lookups
**Learning:** During heavy operations like `getPrerequisiteChain`'s BFS traversal, doing O(N) array `.includes()` operations on user profile data (`completedCourses`, `inProgressCourses`) creates significant CPU overhead, especially as these lists grow or when these functions are used in list rendering maps (e.g. `SemesterCard`).
**Action:** Extract these arrays and memoize them into JS `Set`s using `useMemo` immediately. Then, update contextual callbacks to use `.has()` (O(1) lookup). Also, for BFS traversal of prerequisites, use a local `nextLevelSet` to track uniqueness within the current BFS depth loop to prevent duplicate evaluation on diamond dependency structures.
