## 2024-05-11 - Prevent duplicate BFS node processing in getPrerequisiteChain
**Learning:** Diamond dependency structures in course prerequisites (e.g., A -> B -> D and A -> C -> D) can cause duplicate processing of nodes in the same breadth level if only a global visited set is used after they are pulled from the queue, leading to redundant work in `getPrerequisiteChain`.
**Action:** When implementing BFS graph traversals, use a local `nextLevelSet` to prevent duplicate nodes from being queued in the same breadth level alongside the global visited set.
