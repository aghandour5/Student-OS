## 2026-03-28 - O(1) State Lookups & BFS Duplicate Prevention
**Learning:** Derived state like completed courses should be memoized as Sets to turn O(N) array scans into O(1) lookups inside Context handlers, avoiding O(N^2) renders. BFS traversals in diamond structures require a per-level deduplication Set.
**Action:** Always derive Sets from arrays using useMemo before passing them into complex calculations or callbacks.
