## 2024-06-25 - Combined Filter Optimization
**Learning:** Combining multiple `.filter` passes over the same dataset into a single `O(N)` traversal using `forEach` or `reduce` inside a `useMemo` hook significantly reduces CPU overhead, especially when deriving data requires evaluating expensive Context methods like `getCourseStatus`.
**Action:** Always check if a dataset is being filtered multiple times for different conditions in React components. If so, consolidate them into a single memoized iteration.
