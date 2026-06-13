## 2024-06-13 - BFS Graph Traversal Optimizations
**Learning:** In academic logic involving prerequisite chains (BFS), diamond dependencies can cause identical nodes to be queued multiple times in the same breadth level if only a global `visited` set is used after popping. Also, filtering arrays using `.includes()` inside loops creates O(N^2) bottlenecks.
**Action:** Pre-compute reference arrays (like `completedCourses`) into a `Set` before loops to achieve O(1) lookups. In BFS, use a local `nextLevelSet` to prevent duplicate processing of nodes within the exact same breadth level.
