import { getApp, getApps, initializeApp } from 'firebase/app';
import type { User } from 'firebase/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDownloadURL, getStorage, ref as storageRef, uploadString } from 'firebase/storage';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCKse5ho1AMV-HqWgEIecsWQVRMwZCJd6c",
    authDomain: "explore-bbda5.firebaseapp.com",
    databaseURL: "https://explore-bbda5-default-rtdb.firebaseio.com",
    projectId: "explore-bbda5",
    storageBucket: "explore-bbda5.firebasestorage.app",
    messagingSenderId: "981779805283",
    appId: "1:981779805283:android:a66c1313f61b616e53b456",
    measurementId: "",
};

// Initialize Firebase app (singleton pattern - only initialize once)
export const app = (() => {
    const existingApps = getApps();
    if (existingApps.length > 0) {
        console.log('✅ Firebase app already initialized, using existing instance');
        return getApp();
    }
    console.log('🔥 Initializing Firebase app for first time');
    return initializeApp(firebaseConfig);
})();

// Initialize Firestore
export const db = getFirestore(app);

// Storage and Functions
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Helper: Wait for Auth to be ready (solves race conditions)
export function waitForAuthReady(timeoutMs = 2000): Promise<User | null> {
    return new Promise((resolve) => {
        const auth = getAuth(app);
        // If already logged in, return immediately
        if (auth.currentUser) {
            resolve(auth.currentUser);
            return;
        }

        // Wait for state change
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });

        // Fallback timeout
        setTimeout(() => {
            unsubscribe();
            resolve(auth.currentUser);
        }, timeoutMs);
    });
}

// Helper to upload a file and get its download URL
export async function uploadFileAndGetUrl(path: string, blob: Blob, debugUser?: any): Promise<string> {
    try {
        console.log(`[Upload] Starting upload to ${path}`);
        console.log(`[Upload] Blob size: ${blob.size}, type: ${blob.type}`);


        // 1. Explicit SDK Auth Check
        const sdkAuth = getAuth(app);
        const currentUser = sdkAuth.currentUser;

        console.log(`[Upload] SDK Auth Check:`, {
            uid: currentUser?.uid || 'null',
            email: currentUser?.email || 'null',
            isAnonymous: currentUser?.isAnonymous,
            bucket: storage.app.options.storageBucket
        });

        if (!currentUser) {
            throw new Error('PRE-UPLOAD CHECK FAILED: Firebase SDK says user is NOT logged in. Cannot upload.');
        }

        if (debugUser) {
            console.log(`[Upload] App State Connection Debug:`, debugUser);
        }

        const ref = storageRef(storage, path);
        const metadata = { contentType: blob.type || 'application/octet-stream' };

        // Use uploadBytesResumable for better reliability and detailed monitoring
        const { uploadBytesResumable } = await import('firebase/storage');
        const uploadTask = uploadBytesResumable(ref, blob, metadata);

        // Wait for upload to complete
        await uploadTask;

        console.log(`[Upload] Upload successful. Total bytes: ${uploadTask.snapshot.totalBytes}`);
        const url = await getDownloadURL(ref);
        console.log(`[Upload] Got download URL: ${url}`);
        return url;
    } catch (error: any) {
        console.error(`[Upload] Failed to upload to ${path}`);
        console.error(`[Upload] Error Details:`, JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        if (error.code) console.error(`[Upload] Error Code: ${error.code}`);
        if (error.serverResponse) console.error(`[Upload] Server Response:`, error.serverResponse);
        throw error;
    }
}

// Re-export Firestore utilities for convenience
export {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    httpsCallable,
    serverTimestamp,
    setDoc
};

// Test function to upload a simple string (Blob)
export async function testUpload(debugUserInfo?: any): Promise<string> {
    try {
        if (!debugUserInfo?.uid) {
            throw new Error("Test Upload requires a valid User ID (uid) to match security rules.");
        }

        const testContent = "This is a test upload string " + new Date().toISOString();
        const testBlob = new Blob([testContent], { type: 'text/plain' });
        // UPDATE: Path must match security rule: partner_uploads/{uid}/...
        const path = `partner_uploads/${debugUserInfo.uid}/test_${Date.now()}.txt`;

        console.log(`[TestUpload] Starting test upload to ${path}`);
        return await uploadFileAndGetUrl(path, testBlob, debugUserInfo);
    } catch (error) {
        console.error('[TestUpload] Failed:', error);
        throw error;
    }
}

// Test function to upload a simple string (Raw String - No Blob)
export async function testUploadString(): Promise<string> {
    // NOTE: This legacy test function might fail under new rules if not updated with UID
    // Leaving as-is for now, focusing on the Blob upload used in verification
    try {
        console.log('[TestUploadString] Starting string upload...');
        const path = `test_uploads/string_${Date.now()}.txt`;
        const ref = storageRef(storage, path);
        const message = "Raw string upload test " + new Date().toISOString();

        await uploadString(ref, message);
        console.log('[TestUploadString] Upload successful');

        const url = await getDownloadURL(ref);
        return url;
    } catch (error: any) {
        console.error('[TestUploadString] Failed:', error);
        throw error;
    }
}
