## 2024-06-12 - Prevent O(N) Array Lookups in BFS Pre-computation
**Learning:** In the BFS graph traversal used for prerequisite calculations (`getPrerequisiteChain`), repeatedly calling `.includes()` on an array of completed courses scales as O(N^2) relative to the length of the prerequisite chain.
**Action:** Convert arrays to Sets (like `completedSet`) to enable O(1) lookups during complex recursive traversals and nested loop executions. Also implemented a localized Set within the breadth level to prevent duplicated work within a single tier on diamond-structured prerequisites.
