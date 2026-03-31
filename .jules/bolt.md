## 2026-03-31 - [Optimize React Context array operations]
**Learning:** Frequent O(N) `.includes()` checks inside derived context calculations (like checking if prerequisites are met via `completedCourses.includes(pid)`) can cause unnecessary performance bottlenecks during large array traversals.
**Action:** Extract nested arrays into local variables (e.g. `currentCompletedArr = profile.progress[profile.major]?.completedCourses`) and memoize them into a `Set` using `useMemo`. This allows `.has()` lookups to run in O(1) time while keeping the dependency arrays safe.
