## 2024-05-18 - Avoid O(N^2) Array Includes in Context Callbacks
**Learning:** Calling array `.includes()` on nested loops or mapping operations inside React Context callbacks (like `getCourseStatus` and `getPrerequisiteChain` traversing prerequisites) causes severe O(N^2) performance degradation, especially when rendering lists.
**Action:** Always pre-compute and memoize reference lists into `Set` objects at the component/context level using `useMemo` so that lookups inside frequently invoked callbacks or loop traversals become O(1).
