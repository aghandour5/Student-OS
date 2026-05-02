## 2024-05-24 - BFS Duplicate Processing in Dependency Trees
**Learning:** In complex graph structures like academic prerequisites, "diamond dependencies" (e.g., A depends on B and C, which both depend on D) can cause BFS traversals to evaluate the same node multiple times in a single breadth level before the global `visited` set catches it in the next iteration.
**Action:** Use a local `nextLevelSet` in addition to the global `visited` Set during BFS graph traversals to ensure duplicate nodes are deduplicated within the exact same breadth level.
