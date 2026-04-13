## 2026-04-13 - BFS Graph Traversal UI Duplication
**Learning:** Graph traversal algorithms (like BFS for prerequisite chains) in UI data derivations must implement explicit local deduplication (e.g. tracking a \`nextLevelSet\` inside the level loop) to prevent exponential render paths in diamond dependency setups. Using only a global visited set leaves a gap where nodes can be duplicated within the exact same breadth level.
**Action:** Always implement a local level deduplication set alongside the global visited set when extracting hierarchical data from graphs for React rendering.
