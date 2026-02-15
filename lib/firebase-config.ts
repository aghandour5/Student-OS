/**
 * Client-side Firebase configuration for UniFlow.
 *
 * Initializes the Firebase app and exports the Auth instance
 * for use across the mobile/web client. This is separate from
 * the server-side Firebase Admin SDK (server/firebase.ts).
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, Auth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
    apiKey: "AIzaSyCc9FXUCv5w6poiwaKr2yc-7zU915LkMZg",
    authDomain: "uniflow-59a56.firebaseapp.com",
    projectId: "uniflow-59a56",
    storageBucket: "uniflow-59a56.firebasestorage.app",
    messagingSenderId: "537865534343",
    appId: "1:537865534343:web:5204d22a9290ca1f283122",
    measurementId: "G-JSCRY79PJK",
};

// Initialize Firebase (avoid duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with AsyncStorage persistence on native, default on web
let auth: Auth;
if (Platform.OS === 'web') {
    auth = getAuth(app);
} else {
    // @ts-ignore — getReactNativePersistence types may not resolve but it works at runtime
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
}

// Initialize Firestore for user profile storage
const firestore = getFirestore(app);

export { auth, firestore };
export default app;
