import { storage } from "../server/storage";

async function verify() {
    console.log("Initializing storage...");
    try {
        const courses = await storage.getAllCourses();
        console.log(`Found ${courses.length} courses.`);

        if (courses.length === 0) {
            console.log("Seeding data...");
            await storage.seedData();
            console.log("Seeding complete.");

            const newCourses = await storage.getAllCourses();
            console.log(`Found ${newCourses.length} courses after seeding.`);
        } else {
            console.log("Data already exists.");
        }

        console.log("Verification successful!");
        process.exit(0);
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
}

verify();
