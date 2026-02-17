import {
  users,
  type User, type InsertUser, type Course, type Prerequisite, type Offering,
  type CourseWithPrereqs
} from "@shared/schema";
import { db } from "./firebase";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  getAllPrerequisites(): Promise<Prerequisite[]>;
  getPrerequisitesForCourse(courseId: string): Promise<Prerequisite[]>;
  getPostrequisitesForCourse(courseId: string): Promise<Prerequisite[]>;
  getAllOfferings(): Promise<Offering[]>;
  getOfferingsForCourse(courseId: string): Promise<Offering[]>;
  getCoursesWithPrereqs(): Promise<CourseWithPrereqs[]>;
  seedData(): Promise<void>;
}

export class FirebaseStorage implements IStorage {
  private db: any;
  private coursesCache: { data: CourseWithPrereqs[], timestamp: number } | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(firestoreInstance: any = db) {
    this.db = firestoreInstance;
  }

  async getUser(id: string): Promise<User | undefined> {
    const doc = await this.db.collection("users").doc(id).get();
    return doc.exists ? (doc.data() as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const snapshot = await this.db.collection("users").where("username", "==", username).limit(1).get();
    if (snapshot.empty) return undefined;
    return snapshot.docs[0].data() as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = crypto.randomUUID();
    const newUser: User = { ...insertUser, id };
    await this.db.collection("users").doc(id).set(newUser);
    return newUser;
  }

  async getAllCourses(): Promise<Course[]> {
    const snapshot = await this.db.collection("courses").get();
    const courses = snapshot.docs.map(doc => doc.data() as Course);
    return courses.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.semester - b.semester;
    });
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const doc = await this.db.collection("courses").doc(id).get();
    return doc.exists ? (doc.data() as Course) : undefined;
  }

  async getAllPrerequisites(): Promise<Prerequisite[]> {
    const snapshot = await this.db.collection("prerequisites").get();
    return snapshot.docs.map(doc => doc.data() as Prerequisite);
  }

  async getPrerequisitesForCourse(courseId: string): Promise<Prerequisite[]> {
    const snapshot = await this.db.collection("prerequisites")
      .where("courseId", "==", courseId)
      .get();
    return snapshot.docs.map(doc => doc.data() as Prerequisite);
  }

  async getPostrequisitesForCourse(courseId: string): Promise<Prerequisite[]> {
    const snapshot = await this.db.collection("prerequisites")
      .where("requiresCourseId", "==", courseId)
      .get();
    return snapshot.docs.map(doc => doc.data() as Prerequisite);
  }

  async getAllOfferings(): Promise<Offering[]> {
    const snapshot = await this.db.collection("offerings").get();
    return snapshot.docs.map(doc => doc.data() as Offering);
  }

  async getOfferingsForCourse(courseId: string): Promise<Offering[]> {
    const snapshot = await this.db.collection("offerings").where("courseId", "==", courseId).get();
    return snapshot.docs.map(doc => doc.data() as Offering);
  }

  async getCoursesWithPrereqs(): Promise<CourseWithPrereqs[]> {
    if (this.coursesCache && Date.now() - this.coursesCache.timestamp < this.CACHE_TTL) {
      return this.coursesCache.data;
    }

    const allCourses = await this.getAllCourses();
    const allPrereqs = await this.getAllPrerequisites();

    const prereqMap = new Map<string, string[]>();
    const unlocksMap = new Map<string, string[]>();

    // In-memory join
    for (const p of allPrereqs) {
      if (!prereqMap.has(p.courseId)) prereqMap.set(p.courseId, []);
      prereqMap.get(p.courseId)!.push(p.requiresCourseId);

      if (!unlocksMap.has(p.requiresCourseId)) unlocksMap.set(p.requiresCourseId, []);
      unlocksMap.get(p.requiresCourseId)!.push(p.courseId);
    }

    const result = allCourses.map(course => ({
      ...course,
      prerequisites: prereqMap.get(course.id) || [],
      unlocks: unlocksMap.get(course.id) || [],
      corequisites: [],
    }));

    this.coursesCache = { data: result, timestamp: Date.now() };
    return result;
  }

  async seedData(): Promise<void> {
    const { seedCourses, seedPrerequisites, seedOfferings } = await import("./seed-data");

    const coursesRef = this.db.collection("courses");
    const snapshot = await coursesRef.limit(1).get();

    if (!snapshot.empty) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding Firestore database...");

    const batchSize = 400; // Firestore batch limit is 500
    let batch = this.db.batch();
    let count = 0;

    const commits = [];

    // Seed Courses
    for (const c of seedCourses) {
      batch.set(coursesRef.doc(c.id), c);
      count++;
      if (count >= batchSize) {
        commits.push(batch.commit());
        batch = this.db.batch();
        count = 0;
      }
    }

    // Seed Prerequisites
    const prereqsRef = this.db.collection("prerequisites");
    for (const p of seedPrerequisites) {
      // Use composite ID for idempotent seeding
      const id = `${p.courseId}-${p.requiresCourseId}`;
      batch.set(prereqsRef.doc(id), { ...p, id });
      count++;
      if (count >= batchSize) {
        commits.push(batch.commit());
        batch = this.db.batch();
        count = 0;
      }
    }

    // Seed Offerings
    const offeringsRef = this.db.collection("offerings");
    for (const o of seedOfferings) {
      // Create a deterministic ID if possible or use auto-id but we need one for the doc ref
      // The seed data doesn't have IDs in the array, but let's generate unique ones or let Firestore do it
      // For batch.set we need a doc ref. 
      const ref = offeringsRef.doc();
      batch.set(ref, { ...o, id: ref.id });
      count++;
      if (count >= batchSize) {
        commits.push(batch.commit());
        batch = this.db.batch();
        count = 0;
      }
    }

    if (count > 0) {
      commits.push(batch.commit());
    }

    await Promise.all(commits);
    console.log(`Seeded ${seedCourses.length} courses, ${seedPrerequisites.length} prerequisites, ${seedOfferings.length} offerings`);
  }
}

export const storage = new FirebaseStorage();
