
import { db } from "../server/firebase";
import { storage } from "../server/storage";

async function clearCollection(collectionPath: string) {
    const collectionRef = db.collection(collectionPath);
    const snapshot = await collectionRef.get();

    if (snapshot.size === 0) {
        console.log(`Collection ${collectionPath} is already empty.`);
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Cleared collection ${collectionPath} (${snapshot.size} documents).`);
}

async function seed() {
    try {
        console.log("Starting database re-seed...");

        // Clear existing data to avoid duplicates (especially for offerings) and stale data
        await clearCollection("courses");
        await clearCollection("prerequisites");
        await clearCollection("offerings");

        // Re-seed with new data
        console.log("Seeding new data...");
        await storage.seedData();

        console.log("Database re-seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seed();
