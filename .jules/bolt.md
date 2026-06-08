## 2024-03-24 - BFS Prerequisite Chain Performance
**Learning:** Found an O(N^2) bottleneck in `getPrerequisiteChain` due to doing array `.includes()` on `completedCourses` inside a BFS graph traversal of a course's prerequisites tree. Also noticed missing protection against duplicate processing in the exact same breadth level during BFS for diamond dependencies (e.g. A->B->D and A->C->D).
**Action:** Pre-computed `completedCourses` into an O(1) Set (`completedSet`) before the loop. Introduced `nextLevelSet` to avoid queueing the same prerequisite node multiple times in the same level.
