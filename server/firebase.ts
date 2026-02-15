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

let _db;
try {
    if (admin.apps.length) {
        _db = admin.firestore();
    } else {
        if (process.env.NODE_ENV === 'test') {
            console.warn("Firebase app not initialized, using mock DB object for tests.");
            _db = {
                collection: () => ({
                    doc: () => ({
                        get: () => Promise.resolve({ exists: false }),
                        set: () => Promise.resolve(),
                    }),
                    where: () => ({
                        limit: () => ({
                            get: () => Promise.resolve({ empty: true, docs: [] }),
                        }),
                        get: () => Promise.resolve({ empty: true, docs: [] }),
                    }),
                    get: () => Promise.resolve({ docs: [] }),
                }),
                batch: () => ({
                    set: () => { },
                    commit: () => Promise.resolve(),
                }),
            } as any;
        } else {
            throw new Error("Firebase Admin SDK not initialized. Ensure service-account.json is present or environment variables are set.");
        }
    }
} catch (error) {
    if (process.env.NODE_ENV === 'test') {
        _db = {
            collection: () => ({
                doc: () => ({
                    get: () => Promise.resolve({ exists: false }),
                    set: () => Promise.resolve(),
                }),
                where: () => ({
                    limit: () => ({
                        get: () => Promise.resolve({ empty: true, docs: [] }),
                    }),
                    get: () => Promise.resolve({ empty: true, docs: [] }),
                }),
                get: () => Promise.resolve({ docs: [] }),
            }),
            batch: () => ({
                set: () => { },
                commit: () => Promise.resolve(),
            }),
        } as any;
    } else {
        console.error("Error creating Firestore instance:", error);
        throw error;
    }
}

export const db = _db;
