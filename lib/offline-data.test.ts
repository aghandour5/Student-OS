import { describe, test, expect } from 'bun:test';
import { offlineCourses, offlineOfferings } from './offline-data';

describe('offlineCourses data integrity', () => {
    test('all course IDs are unique', () => {
        const ids = offlineCourses.map(c => c.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    test('all course codes are unique', () => {
        const codes = offlineCourses.map(c => c.code);
        const uniqueCodes = new Set(codes);
        expect(uniqueCodes.size).toBe(codes.length);
    });

    test('all prerequisites exist', () => {
        const courseIds = new Set(offlineCourses.map(c => c.id));
        for (const course of offlineCourses) {
            for (const prereqId of course.prerequisites) {
                expect(courseIds.has(prereqId)).toBe(true);
            }
        }
    });

    test('all unlocks exist', () => {
        const courseIds = new Set(offlineCourses.map(c => c.id));
        for (const course of offlineCourses) {
            for (const unlockId of course.unlocks) {
                expect(courseIds.has(unlockId)).toBe(true);
            }
        }
    });

    test('prerequisite and unlock relationships are reciprocal', () => {
        const courseMap = new Map(offlineCourses.map(c => [c.id, c]));

        for (const course of offlineCourses) {
            // If course A has course B as a prerequisite, then course B must have course A in its unlocks
            for (const prereqId of course.prerequisites) {
                const prereqCourse = courseMap.get(prereqId);
                expect(prereqCourse).toBeDefined();
                if (prereqCourse) {
                    expect(prereqCourse.unlocks).toContain(course.id);
                }
            }

            // If course A has course B in its unlocks, then course B must have course A in its prerequisites
            for (const unlockId of course.unlocks) {
                const unlockedCourse = courseMap.get(unlockId);
                expect(unlockedCourse).toBeDefined();
                if (unlockedCourse) {
                    expect(unlockedCourse.prerequisites).toContain(course.id);
                }
            }
        }
    });

    test('basic field validation', () => {
        for (const course of offlineCourses) {
            expect(course.credits).toBeGreaterThan(0);
            expect(course.year).toBeGreaterThanOrEqual(0);
            expect(course.semester).toBeGreaterThanOrEqual(1);
            expect(course.semester).toBeLessThanOrEqual(2);
            expect(course.id.length).toBeGreaterThan(0);
            expect(course.code.length).toBeGreaterThan(0);
            expect(course.title.length).toBeGreaterThan(0);
        }
    });
});

describe('offlineOfferings data integrity', () => {
    test('all offering IDs are unique', () => {
        const ids = offlineOfferings.map(o => o.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    test('all course IDs in offerings exist', () => {
        const courseIds = new Set(offlineCourses.map(c => c.id));
        for (const offering of offlineOfferings) {
            expect(courseIds.has(offering.courseId)).toBe(true);
        }
    });

    test('offering times are valid', () => {
        const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
        for (const offering of offlineOfferings) {
            expect(offering.startTime).toMatch(timeRegex);
            expect(offering.endTime).toMatch(timeRegex);
        }
    });
});
