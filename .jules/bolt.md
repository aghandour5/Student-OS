## 2023-10-25 - Optimize BFS Prerequisite Traversal
**Learning:** Using array `.includes()` inside BFS traversals for graph relationships causes O(N^2) bottlenecks, and diamond dependency structures cause redundant node processing if only a global `visited` set is used without a per-level set.
**Action:** Pre-compute reference arrays (like `completedCourses`) into a `Set` prior to loop execution for O(1) lookups, and always use a local `nextLevelSet` to prevent duplicate queuing of nodes in the same breadth level.
