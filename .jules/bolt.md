## 2024-05-24 - [React Context Performance Optimization]
**Learning:** Pre-computing memoized `Set`s for O(1) lookups in React Context prevents performance bottlenecks during array mapping operations. Using `useMemo` for sets like `completedSet` over `.includes()` avoids O(N^2) complexity.
**Action:** Always pre-compute and memoize frequently accessed arrays as Sets at the component/context level when they are used in mapping operations or loops.
