## 2024-05-03 - Combine Filter Passes into O(N) Traversal
**Learning:** Performing multiple independent `.filter()` passes on a list to bin objects by status results in evaluating the status calculation function (e.g. `getCourseStatus`) multiple times per object, causing redundant overhead, particularly in React renders.
**Action:** Always combine multiple grouping/binning `.filter()` passes into a single `.forEach()` or `.reduce()` traversal to compute statuses once per element, wrapping the computation in `useMemo`.
