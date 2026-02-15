import admin from "firebase-admin";

// Initialize Firebase Admin SDK
// This requires a service account key file to be present at the root of the project
// DO NOT commit the service-account.json file to version control!
if (!admin.apps.length) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const serviceAccount = require("../service-account.json");

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin SDK initialized successfully");
    } catch (error) {
        console.error("Failed to initialize Firebase Admin SDK:", error);
        console.error("Make sure service-account.json is present in the project root.");
    }
}

export const db = admin.firestore();
