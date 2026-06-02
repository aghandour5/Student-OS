## 2024-06-02 - O(N) optimizations in BFS queue processing
**Learning:** In getPrerequisiteChain, complex array filtering within nested loops triggers O(N^2) calculations due to multiple inner `.includes` scans against an unmemoized progress array. Additionally, diamond dependencies cause redundant graph exploration in the same breadth level.
**Action:** Convert unmemoized arrays to Sets before while loops to achieve O(1) checks. Use local Sets inside `while` iterations to detect duplication on current loop execution queue.
