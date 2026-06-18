
## 2024-05-18 - Batching and Memoizing Expensive Context Checks
**Learning:** Multiple array filters that each call an expensive Context method (like `getCourseStatus`) cause redundant O(N) traversals and evaluations on every render.
**Action:** Group these categorizations into a single pass (`reduce` or `forEach`) inside a `useMemo` hook to reduce time complexity from O(4N) to O(N) and avoid recalculation on unrelated state changes.
