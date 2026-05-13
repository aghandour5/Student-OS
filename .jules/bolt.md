## 2024-05-13 - [Optimize BFS prerequisite traversal]
**Learning:** Diamond dependency structures (e.g., A->B->D and A->C->D) can cause redundant processing within the same breadth level in BFS traversals if only a global `visited` set is used (since nodes in the same level haven't been visited yet).
**Action:** Always use both a global `visited` set and a local `nextLevelSet` to track and prevent duplicate node additions to the queue within the exact same breadth level.
