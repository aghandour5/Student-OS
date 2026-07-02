## 2024-07-02 - Combine multiple expensive filters in useMemo

**Learning:** `app/(tabs)/index.tsx` was doing 4 separate `O(N)` `.filter` iterations over the `courses` array on every render, each evaluating the potentially expensive `getCourseStatus` context method (`completed`, `in_progress`, `available`, `locked`). It was also deriving some unused `categoryStats` using another loop.

**Action:** Combined all 4 `.filter` passes into a single `O(N)` loop inside a `useMemo` hook, grouping items into arrays by their status. Removed the dead `categoryStats` code completely.
