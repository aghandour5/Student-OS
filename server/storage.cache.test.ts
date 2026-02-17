
import { describe, expect, test, mock, beforeEach } from "bun:test";
import { FirebaseStorage } from "./storage";

describe("FirebaseStorage Caching", () => {
  let storage: FirebaseStorage;
  let mockDb: any;
  let mockCollection: any;
  let mockGetCourses: any;
  let mockGetPrerequisites: any;

  beforeEach(() => {
    mockGetCourses = mock(() => Promise.resolve({
      docs: [
        { data: () => ({ id: "C1", title: "Course 1", year: 1, semester: 1 }) }
      ]
    }));

    mockGetPrerequisites = mock(() => Promise.resolve({
      docs: [
        { data: () => ({ courseId: "C1", requiresCourseId: "C0" }) }
      ]
    }));

    mockCollection = mock((name: string) => {
      if (name === "courses") {
        return { get: mockGetCourses };
      }
      if (name === "prerequisites") {
        return { get: mockGetPrerequisites };
      }
      return { get: mock(() => Promise.resolve({ docs: [] })) };
    });

    mockDb = {
      collection: mockCollection,
    };

    storage = new FirebaseStorage(mockDb);
  });

  test("getCoursesWithPrereqs should cache the result", async () => {
    // First call
    await storage.getCoursesWithPrereqs();

    expect(mockCollection).toHaveBeenCalledWith("courses");
    expect(mockCollection).toHaveBeenCalledWith("prerequisites");
    expect(mockGetCourses).toHaveBeenCalledTimes(1);
    expect(mockGetPrerequisites).toHaveBeenCalledTimes(1);

    // Second call
    await storage.getCoursesWithPrereqs();

    // Should still be called only once if cached
    expect(mockGetCourses).toHaveBeenCalledTimes(1);
    expect(mockGetPrerequisites).toHaveBeenCalledTimes(1);
  });
});
