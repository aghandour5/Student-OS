
import { describe, expect, test } from "bun:test";
import { seedCourses, seedPrerequisites, seedOfferings } from "./seed-data";

describe("Seed Data Integrity", () => {
  const courseIds = new Set(seedCourses.map((c) => c.id));

  describe("seedCourses", () => {
    test("should have courses", () => {
      expect(seedCourses.length).toBeGreaterThan(0);
    });

    test("should have unique IDs", () => {
      expect(courseIds.size).toBe(seedCourses.length);
    });

    test("should have valid properties", () => {
      seedCourses.forEach((course) => {
        expect(course.id).toBeDefined();
        expect(course.code).toBeDefined();
        expect(course.title).toBeDefined();
        expect(course.credits).toBeGreaterThan(0);
        expect(course.description).toBeDefined();
        expect(course.category).toBeDefined();
        expect(course.year).toBeGreaterThan(-1);
        expect(course.semester).toBeGreaterThan(0);
        expect(course.major).toBeDefined();

        // Ensure ID matches code (convention in this project)
        expect(course.id).toBe(course.code);
      });
    });

    test("should have valid major", () => {
        const validMajors = ['CENG', 'EENG', 'shared'];
        seedCourses.forEach((course) => {
            expect(validMajors).toContain(course.major);
        });
    });
  });

  describe("seedPrerequisites", () => {
    test("should have valid course IDs", () => {
      seedPrerequisites.forEach((prereq) => {
        expect(courseIds.has(prereq.courseId)).toBeTrue();
      });
    });

    test("should have valid required course IDs", () => {
      seedPrerequisites.forEach((prereq) => {
        expect(courseIds.has(prereq.requiresCourseId)).toBeTrue();
      });
    });

    test("should not have self-referential prerequisites", () => {
        seedPrerequisites.forEach((prereq) => {
            expect(prereq.courseId).not.toBe(prereq.requiresCourseId);
        });
    });
  });

  describe("seedOfferings", () => {
    test("should have valid course IDs", () => {
      seedOfferings.forEach((offering) => {
        expect(courseIds.has(offering.courseId)).toBeTrue();
      });
    });

    test("should have valid properties", () => {
        seedOfferings.forEach((offering) => {
            expect(offering.section).toBeDefined();
            expect(offering.semester).toBeDefined();
            expect(offering.campus).toBeDefined();
            expect(offering.instructor).toBeDefined();
            expect(offering.dayOfWeek).toBeDefined();
            expect(offering.startTime).toBeDefined();
            expect(offering.endTime).toBeDefined();
            expect(offering.room).toBeDefined();
        });
    });
  });
});
