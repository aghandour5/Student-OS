## 2023-10-24 - Single Pass Traversal for Expensive Context Methods
**Learning:** Multiple `.filter` passes evaluating expensive Context methods (like `getCourseStatus`) cause significant performance bottlenecks during re-renders, resulting in redundant O(M*N) complexity where M is the number of filters.
**Action:** Combine multiple `.filter` passes over the same dataset into a single `O(N)` traversal using `forEach` or `reduce` inside a `useMemo` hook to ensure calculations are only performed once per item and only when dependencies change.
