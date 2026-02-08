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

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const allPrereqs = await storage.getAllPrerequisites();
      const prereqs = allPrereqs.filter(p => p.courseId === course.id).map(p => p.requiresCourseId);
      const unlocks = allPrereqs.filter(p => p.requiresCourseId === course.id).map(p => p.courseId);
      const courseOfferings = await storage.getOfferingsForCourse(course.id);

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
