
## 2025-02-14 - React Context Performance: Array vs Set for O(1) Lookups
**Learning:** Frequent O(N) Array.includes() lookups in Context derived state methods (getCourseStatus, arePrereqsMet) create rendering bottlenecks when scaling.
**Action:** Always pre-compute and memoize these arrays into Sets using useMemo at the Context level, then pass the sets or use them internally for O(1) lookups.
