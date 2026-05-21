## 2024-05-15 - BFS duplicate tracking
**Learning:** `getPrerequisiteChain` uses a global visited set for BFS but within a level if there are multiple prerequisites leading to the same prerequisite it might be added twice in `levelCourses` and `nextLevel` if the duplicate occurs *within the same level loop*.
**Action:** Use a `nextLevelSet` to avoid adding duplicates to the same level in the prerequisite chain BFS.
