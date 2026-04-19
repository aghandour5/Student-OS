## 2026-04-19 - O(1) Sets and React Dependency Scoping
**Learning:** In deep React contexts, passing large objects like `profile` into dependency arrays triggers excessive re-renders for consumers. Furthermore, repeatedly using `Array.includes()` for data cross-referencing inside render paths is an O(N) bottleneck.
**Action:** Extract specific properties (e.g., `grades`, `completedCourses`) before hooks and derive O(1) Sets for lookups. Use these specific variables in hook dependencies instead of the full root object.
