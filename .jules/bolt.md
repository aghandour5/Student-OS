## 2024-05-18 - Optimized BFS in getPrerequisiteChain and arePrereqsMet Sets
**Learning:** O(N) array includes checks (`.includes(pid)`) over user progress arrays inside loops (like `getPrerequisiteChain` and `arePrereqsMet`) can cause performance degradation as the array grows, and a BFS without `nextLevelSet` processes diamond dependencies redundantly.
**Action:** Use Sets locally (e.g. `const completedSet = new Set(currentProgress.completedCourses);`) to transform O(N) lookup times into O(1), and use `nextLevelSet` in BFS algorithm to prevent redundant traversal.
