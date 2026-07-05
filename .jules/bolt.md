## 2025-03-05 - Optimized Prerequisite BFS Traversal
**Learning:** In diamond dependency structures, a BFS traversal without a `nextLevelSet` can queue the exact same prerequisite node multiple times within the same breadth level, causing redundant O(N) array `.includes()` filtering.
**Action:** Always pre-compute O(N) arrays into `Set`s before BFS loops and use a local `nextLevelSet` to prevent queueing duplicates within the same traversal layer.
