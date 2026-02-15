
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
});
