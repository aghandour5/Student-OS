## 2024-05-24 - Optimize BFS prerequisite traversal
**Learning:** When calculating complex graph traversals like BFS for prerequisites, using Array.includes() on a large array (like completedCourses) creates O(N^2) bottlenecks. Pre-computing to a Set turns these lookups into O(1). Additionally, a local nextLevelSet prevents duplication within the same BFS level due to diamond dependency structures.
**Action:** Pre-compute reference arrays into Sets before performing BFS or nested loop traversals, and use localized sets within levels to prune duplicate graph edges.
