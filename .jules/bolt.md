## 2025-02-14 - Optimize BFS Prerequisite Traversal
**Learning:** During BFS tree traversal (`getPrerequisiteChain`), O(N) array checks for completed courses and lack of intra-level duplicate prevention for diamond dependency structures lead to performance bottlenecks.
**Action:** Use a pre-computed Set for lookup (O(1)) and introduce a `nextLevelSet` in addition to the global `visited` set to prevent duplicate nodes on the same breadth level.
