## $(date +%Y-%m-%d) - BFS Traversal Level Deduplication
**Learning:** BFS traversals calculating prerequisite chains can accidentally process the same node multiple times on the same breadth level if multiple incoming nodes share the same dependency (diamond dependency structures). This causes duplicate items in the chain levels and redundant downstream processing.
**Action:** Always maintain a `Set` for the current or next level during BFS in graph traversals to ensure identical nodes aren't added multiple times within the exact same breadth step, in addition to the global `visited` Set.
