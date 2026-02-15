import { expect, test, describe } from "bun:test";
import { arePrereqsMet, getCourseStatus, getMissingPrereqs, isYearCompleted, getPrerequisiteChain } from "./academic-utils";
import type { CourseWithPrereqs } from "@shared/schema";

const mockCourse = (id: string, prerequisites: string[] = [], year: number = 1): CourseWithPrereqs => ({
  id,
  code: id,
  title: `Course ${id}`,
  credits: 3,
  description: "",
  category: "Core",
  year,
  semester: 1,
  major: "CENG",
  prerequisites,
  unlocks: [],
  corequisites: [],
});

describe("Academic Utils", () => {
  const courseA = mockCourse("A");
  const courseB = mockCourse("B", ["A"]); // B depends on A
  const courseC = mockCourse("C", ["B"]); // C depends on B
  const courseD = mockCourse("D", ["A", "B"]); // D depends on A and B
  const courseE = mockCourse("E", ["C"], 2); // E depends on C, year 2

  const courseMap = new Map<string, CourseWithPrereqs>([
    ["A", courseA],
    ["B", courseB],
    ["C", courseC],
    ["D", courseD],
    ["E", courseE],
  ]);

  describe("arePrereqsMet", () => {
    test("returns true for course with no prerequisites", () => {
      const completed = new Set<string>();
      expect(arePrereqsMet(courseA, completed)).toBe(true);
    });

    test("returns false if prerequisite is missing", () => {
      const completed = new Set<string>();
      expect(arePrereqsMet(courseB, completed)).toBe(false);
    });

    test("returns true if prerequisite is completed", () => {
      const completed = new Set<string>(["A"]);
      expect(arePrereqsMet(courseB, completed)).toBe(true);
    });

    test("returns false if one of multiple prerequisites is missing", () => {
      const completed = new Set<string>(["A"]);
      expect(arePrereqsMet(courseD, completed)).toBe(false); // Needs B too
    });
  });

  describe("getCourseStatus", () => {
    test("returns completed if in completed set", () => {
      const completed = new Set<string>(["A"]);
      const inProgress = new Set<string>();
      expect(getCourseStatus("A", completed, inProgress, courseMap)).toBe("completed");
    });

    test("returns in_progress if in inProgress set", () => {
      const completed = new Set<string>();
      const inProgress = new Set<string>(["A"]);
      expect(getCourseStatus("A", completed, inProgress, courseMap)).toBe("in_progress");
    });

    test("returns available if prerequisites met", () => {
      const completed = new Set<string>(["A"]);
      const inProgress = new Set<string>();
      expect(getCourseStatus("B", completed, inProgress, courseMap)).toBe("available");
    });

    test("returns locked if prerequisites not met", () => {
      const completed = new Set<string>();
      const inProgress = new Set<string>();
      expect(getCourseStatus("B", completed, inProgress, courseMap)).toBe("locked");
    });
  });

  describe("getMissingPrereqs", () => {
    test("returns missing prerequisites", () => {
      const completed = new Set<string>();
      const missing = getMissingPrereqs(courseB, completed, courseMap);
      expect(missing).toHaveLength(1);
      expect(missing[0].id).toBe("A");
    });

    test("returns empty array if all met", () => {
      const completed = new Set<string>(["A"]);
      const missing = getMissingPrereqs(courseB, completed, courseMap);
      expect(missing).toHaveLength(0);
    });
  });

  describe("isYearCompleted", () => {
    const allCourses = [courseA, courseB, courseE]; // A, B year 1; E year 2

    test("returns true if all courses in year are completed", () => {
      const completed = new Set<string>(["A", "B"]);
      expect(isYearCompleted(1, allCourses, completed)).toBe(true);
    });

    test("returns false if any course in year is missing", () => {
      const completed = new Set<string>(["A"]);
      expect(isYearCompleted(1, allCourses, completed)).toBe(false);
    });

    test("returns false if year has no courses (edge case)", () => {
        expect(isYearCompleted(3, allCourses, new Set())).toBe(false);
    });
  });

  describe("getPrerequisiteChain", () => {
    test("returns full chain when nothing completed", () => {
      const completed = new Set<string>();
      const chain = getPrerequisiteChain("C", courseMap, completed);
      expect(chain).toHaveLength(2);
      expect(chain[0][0].id).toBe("A");
      expect(chain[1][0].id).toBe("B");
    });

    test("stops chain at completed courses", () => {
      const completed = new Set<string>(["A"]);
      // C -> B -> A. A is completed.
      // Chain: [B].
      const chain = getPrerequisiteChain("C", courseMap, completed);
      expect(chain).toHaveLength(1);
      expect(chain[0][0].id).toBe("B");
    });

    test("returns empty chain if all prerequisites completed", () => {
        const completed = new Set<string>(["A", "B"]);
        const chain = getPrerequisiteChain("C", courseMap, completed);
        expect(chain).toHaveLength(0);
    });
  });
});
