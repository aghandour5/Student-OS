import { expect, test, describe } from "bun:test";
import { computePrerequisiteChain } from "./academic-utils";
import type { CourseWithPrereqs } from "@shared/schema";

function mockCourse(id: string, prerequisites: string[] = []): CourseWithPrereqs {
  return {
    id,
    code: id,
    title: `Course ${id}`,
    credits: 3,
    description: "Desc",
    category: "Cat",
    year: 1,
    semester: 1,
    major: "CENG",
    prerequisites,
    unlocks: [],
    corequisites: [],
  };
}

describe("computePrerequisiteChain", () => {
  test("handles diamond dependency (A->B, A->C, B->D, C->D) without duplicates", () => {
    const courses = [
      mockCourse("A", ["B", "C"]),
      mockCourse("B", ["D"]),
      mockCourse("C", ["D"]),
      mockCourse("D", []),
    ];
    const map = new Map(courses.map(c => [c.id, c]));

    const chain = computePrerequisiteChain("A", map, []);

    // Expected chain structure (reversed BFS):
    // Level 0: [D] (furthest prereq)
    // Level 1: [B, C] (direct prereqs of A)

    expect(chain.length).toBe(2);
    expect(chain[0].map(c => c.id)).toEqual(["D"]);
    expect(chain[1].map(c => c.id).sort()).toEqual(["B", "C"]);

    // Check for duplicates explicitly
    const allIds = chain.flat().map(c => c.id);
    const uniqueIds = new Set(allIds);
    expect(allIds.length).toBe(uniqueIds.size);
  });

  test("handles cycle gracefully (A->B->A)", () => {
     const courses = [
      mockCourse("A", ["B"]),
      mockCourse("B", ["A"]),
    ];
    const map = new Map(courses.map(c => [c.id, c]));

    // BFS: A -> [B] -> [A] (skipped because visited)
    // Chain: [[B]]
    // Reverse: [[B]]

    const chain = computePrerequisiteChain("A", map, []);
    expect(chain.length).toBe(1);
    expect(chain[0][0].id).toBe("B");
  });

  test("filters completed courses", () => {
    const courses = [
      mockCourse("A", ["B"]),
      mockCourse("B", ["C"]),
      mockCourse("C", []),
    ];
    const map = new Map(courses.map(c => [c.id, c]));

    // C is completed
    const chain = computePrerequisiteChain("A", map, ["C"]);

    // BFS: A -> [B]. B depends on C. C is completed, so it is filtered out.
    // So next level after B is empty.
    // Chain: [[B]]
    // Reverse: [[B]]

    expect(chain.length).toBe(1);
    expect(chain[0][0].id).toBe("B");
  });

  test("returns empty if all prereqs completed", () => {
    const courses = [
      mockCourse("A", ["B"]),
      mockCourse("B", []),
    ];
    const map = new Map(courses.map(c => [c.id, c]));

    const chain = computePrerequisiteChain("A", map, ["B"]);
    expect(chain.length).toBe(0);
  });
});
