import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  users, courses, prerequisites, offerings,
  type User, type InsertUser, type Course, type Prerequisite, type Offering,
  type CourseWithPrereqs
} from "@shared/schema";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  getAllPrerequisites(): Promise<Prerequisite[]>;
  getAllOfferings(): Promise<Offering[]>;
  getOfferingsForCourse(courseId: string): Promise<Offering[]>;
  getCoursesWithPrereqs(): Promise<CourseWithPrereqs[]>;
  seedData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllCourses(): Promise<Course[]> {
    return db.select().from(courses).orderBy(courses.year, courses.semester);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getAllPrerequisites(): Promise<Prerequisite[]> {
    return db.select().from(prerequisites);
  }

  async getAllOfferings(): Promise<Offering[]> {
    return db.select().from(offerings);
  }

  async getOfferingsForCourse(courseId: string): Promise<Offering[]> {
    return db.select().from(offerings).where(eq(offerings.courseId, courseId));
  }

  async getCoursesWithPrereqs(): Promise<CourseWithPrereqs[]> {
    const allCourses = await this.getAllCourses();
    const allPrereqs = await this.getAllPrerequisites();

    const prereqMap = new Map<string, string[]>();
    const unlocksMap = new Map<string, string[]>();

    for (const p of allPrereqs) {
      if (!prereqMap.has(p.courseId)) prereqMap.set(p.courseId, []);
      prereqMap.get(p.courseId)!.push(p.requiresCourseId);

      if (!unlocksMap.has(p.requiresCourseId)) unlocksMap.set(p.requiresCourseId, []);
      unlocksMap.get(p.requiresCourseId)!.push(p.courseId);
    }

    return allCourses.map(course => ({
      ...course,
      prerequisites: prereqMap.get(course.id) || [],
      unlocks: unlocksMap.get(course.id) || [],
    }));
  }

  async seedData(): Promise<void> {
    const { seedCourses, seedPrerequisites, seedOfferings } = await import("./seed-data");

    const existingCourses = await db.select().from(courses);
    if (existingCourses.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database with Computer Engineering courses...");

    for (const c of seedCourses) {
      await db.insert(courses).values(c);
    }

    for (const p of seedPrerequisites) {
      await db.insert(prerequisites).values(p);
    }

    for (const o of seedOfferings) {
      await db.insert(offerings).values(o);
    }

    console.log(`Seeded ${seedCourses.length} courses, ${seedPrerequisites.length} prerequisites, ${seedOfferings.length} offerings`);
  }
}

export const storage = new DatabaseStorage();
