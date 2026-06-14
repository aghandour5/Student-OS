## 2024-03-24 - Pre-compute Derived State for Performance
**Learning:** In contexts with heavy derived state, frequently used fields (like completedCourses) should be mapped into a `Set` once per render to enable O(1) lookups instead of O(N) array `.includes()`. I noticed this is incredibly crucial in React context functions used widely throughout the application logic.
**Action:** When updating React Context values containing arrays, extract derived lists into a `useMemo` Set if they are queried multiple times inside callbacks.
