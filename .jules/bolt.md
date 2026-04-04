
## 2025-02-23 - [Optimizing React Context Derived State lookups]
**Learning:** Using `Array.includes()` inside `useCallback` hooks within a widely-used React Context (like `AcademicContext`) leads to O(N) performance hits during re-renders. Converting these to O(1) `Set.has()` lookups must be done carefully to avoid exhaustive-deps linting rules when extracting optional lists from deeply nested objects (e.g. `profile.progress[profile.major]?.completedCourses`).
**Action:** When memoizing derived Set objects from deeply nested, potentially optional state, extract the optional chaining resolution into its own local variable *before* passing it into the `useMemo` dependency array to cleanly decouple the dependencies from the parent object structure.
