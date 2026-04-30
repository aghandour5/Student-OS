## 2024-04-30 - O(N) Derived State Multiple Pass Anti-Pattern
**Learning:** Found multiple independent `Array.filter` calls acting on the same array (`courses`) in `app/(tabs)/index.tsx`, each evaluating an expensive React Context callback (`getCourseStatus` which does BFS for prerequisites). This multiplied rendering cost by 5x (4 status filters + 1 year filter inside loop).
**Action:** Always combine multi-filter/count operations on core datasets into a single-pass `useMemo` block that iterates once, groups elements, and returns an object of multiple arrays/counts.
