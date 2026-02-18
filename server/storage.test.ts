
import { describe, expect, test, mock, beforeEach } from "bun:test";

// Mock the firebase module using absolute path to be sure
mock.module("/app/server/firebase.ts", () => {
  return {
    db: {}
  };
});
// And relative just in case
mock.module("./firebase", () => {
  return {
    db: {}
  };
});

import { FirebaseStorage } from "./storage";

describe("FirebaseStorage", () => {
  let storage: FirebaseStorage;
  let mockDb: any;
  let mockCollection: any;
  let mockWhere: any;
  let mockGet: any;

  beforeEach(() => {
    mockGet = mock(() => Promise.resolve({
      docs: [
        { data: () => ({ id: "p1", courseId: "C1", requiresCourseId: "P1" }) }
      ]
    }));

    mockWhere = mock(() => ({
      get: mockGet
    }));

    mockCollection = mock(() => ({
      where: mockWhere,
      get: mockGet
    }));

    mockDb = {
      collection: mockCollection,
      batch: mock(() => ({
        set: mock(),
        commit: mock()
      }))
    };

    storage = new FirebaseStorage(mockDb);
  });

  test("getPrerequisitesForCourse should query prerequisites where courseId == id", async () => {
    const courseId = "test-course-id";
    await storage.getPrerequisitesForCourse(courseId);

    expect(mockCollection).toHaveBeenCalledWith("prerequisites");
    expect(mockWhere).toHaveBeenCalledWith("courseId", "==", courseId);
    expect(mockGet).toHaveBeenCalled();
  });

  test("getPostrequisitesForCourse should query prerequisites where requiresCourseId == id", async () => {
    const courseId = "test-course-id";
    await storage.getPostrequisitesForCourse(courseId);

    expect(mockCollection).toHaveBeenCalledWith("prerequisites");
    expect(mockWhere).toHaveBeenCalledWith("requiresCourseId", "==", courseId);
    expect(mockGet).toHaveBeenCalled();
  });

  test("getAllCourses should cache results", async () => {
    // Setup a specific mock for this test to avoid sort errors
    const mockGetCourses = mock(() => Promise.resolve({
      docs: [
        { data: () => ({ id: "c1", year: 2023, semester: 1 }) }
      ]
    }));

    const mockCollectionCourses = mock((name) => ({
      get: mockGetCourses
    }));

    const mockDbCourses = {
      collection: mockCollectionCourses,
      batch: mock(() => ({ set: mock(), commit: mock() }))
    };

    const storageCourses = new FirebaseStorage(mockDbCourses);

    // First call - should hit DB
    await storageCourses.getAllCourses();

    // Second call - should hit cache
    await storageCourses.getAllCourses();

    // Verify collection was accessed only once (for "courses")
    // Note: If implementation is correct, it should be called once.
    // If not, it will be called twice.
    expect(mockCollectionCourses).toHaveBeenCalledTimes(1);
  });
});
