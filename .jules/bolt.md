## 2024-05-24 - Optimizing BFS Prerequisite Resolution
**Learning:** Diamond dependencies in prerequisite chains cause duplicate traversals within the same BFS level, and nested O(N) array `.includes()` calls degrade performance significantly for deep graphs.
**Action:** Pre-compute `completedCourses` into a Set before loops, and introduce a `nextLevelSet` to deduplicate nodes at the current BFS level.
