
## $(date +%Y-%m-%d) - Prevent Duplicate Processing in BFS Graph Traversal
**Learning:** In DAGs with diamond dependencies, standard BFS without level-specific deduplication (like `nextLevelSet`) will enqueue the same node multiple times on the same level, causing redundant iterations and creating duplicated return elements.
**Action:** When implementing or optimizing BFS/graph traversal for structures like prerequisites, always employ both a global `visited` check AND a local level-specific queue deduplication to maintain O(V+E) bounds without duplicated results.
