
## 2024-05-18 - BFS Optimization in Prerequisite Chains
**Learning:** In graph traversals for prerequisites, nested array `.includes()` operations create O(N²) bottlenecks. Furthermore, standard BFS requires both global `visited` Sets and local `nextLevelSet` trackers to prevent duplicate processing in diamond dependency structures (e.g., A->B->D and A->C->D) across the same breadth level.
**Action:** Always pre-compute reference arrays into Sets before executing traversals, and implement a local deduping Set for next-level queues.
