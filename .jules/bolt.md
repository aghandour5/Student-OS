
## 2024-04-24 - O(N) Set Deduplication in BFS Prerequisite Chain
**Learning:** In a BFS traversal (like prerequisite tracking with diamond dependencies), `Array.includes()` checks and failing to deduplicate elements at each breadth level can lead to `O(N^2)` lookup times and rapid duplicate array growth. This creates large, redundant computational overhead when evaluating prerequisite chains.
**Action:** When computing graph chains with potential duplicate relationships (diamond dependencies), extract the current traversal level and previous completion history into `Set` structures (`completedSet` and `nextLevelSet`) before traversing. This ensures `O(1)` state lookups and naturally trims duplicate relationships during queue construction, maximizing CPU performance.
