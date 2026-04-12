## 2024-05-18 - Single Pass Context Methods
**Learning:** Calling expensive React Context methods inside iterative array operations (like `.filter`) multiple times on the same dataset causes severe O(N * M) performance degradation during re-renders.
**Action:** When categorizing or evaluating items from a list against an expensive function, use `useMemo` with a single loop (e.g., `forEach` or `reduce`) to execute the context method exactly once per item.
