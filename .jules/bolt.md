## 2024-06-28 - Optimize BFS Traversal with O(1) Lookups and Level Deduplication
**Learning:** When performing BFS on a graph with diamond dependencies (like academic prerequisites), checking array inclusions inside the loop results in O(N^2) complexity. Furthermore, without a local level deduplication set, the same node can be added multiple times to the next level queue.
**Action:** Always pre-compute reference arrays into Sets for O(1) lookups before starting BFS. Use both a global `visited` Set for cross-level deduplication and a local `nextLevelSet` for intra-level deduplication.
