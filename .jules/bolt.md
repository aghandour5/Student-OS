## 2023-10-25 - Prevent Duplicate Graph Traversal in BFS
**Learning:** In a graph structure with diamond dependencies (A -> B -> D and A -> C -> D), a BFS traversal using a naive visited check at the start of the loop may process a shared node (D) multiple times if it's pushed to the `nextLevel` array by both paths in the same iteration (breadth level).
**Action:** Use a local Set (`nextLevelSet`) alongside the global `visited` Set to track nodes added during the current breadth level's loop, preventing duplicate entries and extraneous work in algorithms like prerequisite calculations.
