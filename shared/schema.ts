import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  credits: integer("credits").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  year: integer("year").notNull(),
  semester: integer("semester").notNull(),
});

export const prerequisites = pgTable("prerequisites", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  requiresCourseId: varchar("requires_course_id").notNull().references(() => courses.id),
});

export const offerings = pgTable("offerings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  section: text("section").notNull(),
  semester: text("semester").notNull(),
  campus: text("campus").notNull(),
  instructor: text("instructor").notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  room: text("room").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Prerequisite = typeof prerequisites.$inferSelect;
export type Offering = typeof offerings.$inferSelect;

export interface CourseWithPrereqs extends Course {
  prerequisites: string[];
  unlocks: string[];
}

export interface SemesterPlan {
  id: string;
  name: string;
  season: 'Fall' | 'Spring' | 'Summer';
  year: number;
  courseIds: string[];
  selectedOfferings?: Record<string, string>;
}

export interface UserGrade {
  courseId: string;
  grade: string;
  score: number;
}

export interface CourseNote {
  courseId: string;
  note: string;
}

export interface UserProfile {
  major: string;
  campus: string;
  startYear: number;
  completedCourses: string[];
  inProgressCourses: string[];
  semesterPlans: SemesterPlan[];
  grades: UserGrade[];
  notes: CourseNote[];
}

export const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0,
};

export const getLetterGrade = (score: number): string => {
  const normalized = Math.max(0, Math.min(100, score));
  if (normalized >= 93) return 'A';
  if (normalized >= 90) return 'A-';
  if (normalized >= 87) return 'B+';
  if (normalized >= 83) return 'B';
  if (normalized >= 80) return 'B-';
  if (normalized >= 77) return 'C+';
  if (normalized >= 73) return 'C';
  if (normalized >= 70) return 'C-';
  if (normalized >= 67) return 'D+';
  if (normalized >= 63) return 'D';
  if (normalized >= 60) return 'D-';
  return 'F';
};

export const GRADE_OPTIONS = Object.keys(GRADE_POINTS);
