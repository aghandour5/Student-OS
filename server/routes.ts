import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  await storage.seedData();

  app.get("/api/courses", async (_req, res) => {
    try {
      const coursesWithPrereqs = await storage.getCoursesWithPrereqs();
      res.json(coursesWithPrereqs);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get specific course details including offerings and relational data
  app.get("/api/courses/:id", async (req, res) => {
    try {
      // Validate route parameter to prevent injection
      const id = req.params.id;
      if (!id || id.length > 50 || !/^[a-zA-Z0-9_-]+$/.test(id)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const [prereqList, unlockList, courseOfferings] = await Promise.all([
        storage.getPrerequisitesForCourse(course.id),
        storage.getPostrequisitesForCourse(course.id),
        storage.getOfferingsForCourse(course.id)
      ]);

      const prereqs = prereqList.map(p => p.requiresCourseId);
      const unlocks = unlockList.map(p => p.courseId);

      res.json({
        ...course,
        prerequisites: prereqs,
        unlocks,
        offerings: courseOfferings,
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.get("/api/offerings", async (_req, res) => {
    try {
      const allOfferings = await storage.getAllOfferings();
      res.json(allOfferings);
    } catch (error) {
      console.error("Error fetching offerings:", error);
      res.status(500).json({ message: "Failed to fetch offerings" });
    }
  });

  app.get("/api/prerequisites", async (_req, res) => {
    try {
      const allPrereqs = await storage.getAllPrerequisites();
      res.json(allPrereqs);
    } catch (error) {
      console.error("Error fetching prerequisites:", error);
      res.status(500).json({ message: "Failed to fetch prerequisites" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
