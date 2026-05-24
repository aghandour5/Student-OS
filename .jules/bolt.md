## 2024-05-24 - BFS Diamond Dependency Duplication
**Learning:** In diamond dependency graphs (e.g. A->B->D and A->C->D), using only a global `visited` Set to track processed nodes during a BFS traversal fails to prevent duplicates within the exact same breadth level. This causes redundant processing and duplicated elements in the resulting chain array.
**Action:** Always introduce a local `nextLevelSet` in addition to the global `visited` Set when constructing the next level of a BFS queue to ensure elements are deduplicated before being pushed.

## 2024-05-24 - O(N) Array Includes inside traversals
**Learning:** Using array `.includes()` for membership checks inside loop constructs like BFS or nested filters causes an O(N^2) time complexity bottleneck.
**Action:** Always pre-compute reference arrays (e.g., `completedCourses`) into a `Set` prior to loop execution to guarantee O(1) membership lookups.
