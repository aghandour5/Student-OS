/**
 * AuthContext — Manages Firebase authentication state.
 *
 * Provides login, register, logout, password reset, and guest mode.
 * User profiles (major, name) are stored in Firestore 'users' collection.
 * Guest users get a read-only experience with restricted abilities.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from './firebase-config';

export interface UserProfileData {
    uid: string;
    email: string;
    displayName: string;
    major: string;
    createdAt: number;
}

interface AuthContextValue {
    user: User | null;
    userProfile: UserProfileData | null;
    isGuest: boolean;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string, major: string) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                setIsGuest(false);
                // Fetch user profile from Firestore
                try {
                    const profileDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
                    if (profileDoc.exists()) {
                        setUserProfile(profileDoc.data() as UserProfileData);
                    }
                } catch (err) {
                    console.error('[Auth] Error fetching user profile:', err);
                }
            } else {
                setUserProfile(null);
            }
            setIsLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            setIsGuest(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (email: string, password: string, displayName: string, major: string) => {
        setIsLoading(true);
        try {
            const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
            const firebaseUser = credential.user;

            // Update Firebase Auth display name
            await updateProfile(firebaseUser, { displayName });

            // Save extended profile to Firestore
            const profileData: UserProfileData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || email.trim(),
                displayName,
                major,
                createdAt: Date.now(),
            };
            await setDoc(doc(firestore, 'users', firebaseUser.uid), profileData);
            setUserProfile(profileData);
            setIsGuest(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        await signOut(auth);
        setUser(null);
        setUserProfile(null);
        setIsGuest(false);
    }, []);

    const resetPassword = useCallback(async (email: string) => {
        await sendPasswordResetEmail(auth, email.trim());
    }, []);

    const continueAsGuest = useCallback(() => {
        setIsGuest(true);
        setIsLoading(false);
    }, []);

    const isAuthenticated = !!user || isGuest;

    return (
        <AuthContext.Provider value={{
            user,
            userProfile,
            isGuest,
            isLoading,
            isAuthenticated,
            login,
            register,
            logout,
            resetPassword,
            continueAsGuest,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
