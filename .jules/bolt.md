## 2024-06-25 - Academic Context Optimization
**Learning:** React Contexts that store derived data like arrays frequently trigger re-renders because `Array.includes` is an O(N) operation and arrays do not have referential equality. The previous implementation checked `currentProgress.completedCourses.includes` inside multiple useCallbacks.
**Action:** By extracting the `completedCourses` and `inProgressCourses` arrays into `useMemo` Sets, we get O(1) lookup speed for all course prerequisite calculations and avoid re-renders caused by unrelated profile state changes.
