/**
 * Konfigurasi Firebase — Firestore untuk portfolio
 * Setup: https://console.firebase.google.com → Project wazryndev
 */
const firebaseConfig = {
    apiKey: "AIzaSyAWWXiI5ReyoRndPtzSZL0-2WMtjlJ6svo",
    authDomain: "wazryndev.firebaseapp.com",
    projectId: "wazryndev",
    storageBucket: "wazryndev.firebasestorage.app",
    messagingSenderId: "899758384389",
    appId: "1:899758384389:web:aa370adffd41d877dd436c",
    measurementId: "G-QFV2VT5RRH"
};

const FIREBASE_ENABLED =
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes("GANTI") &&
    !firebaseConfig.apiKey.includes("ISI_") &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes("GANTI") &&
    !firebaseConfig.projectId.includes("ISI_");

/**
 * Firestore Security Rules (Firebase Console → Firestore → Rules):
 *
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /visitors/{id} { allow create: if true; allow read, update, delete: if false; }
 *     match /contacts/{id} { allow create: if true; allow read, update, delete: if false; }
 *     match /service_inquiries/{id} { allow create: if true; allow read, update, delete: if false; }
 *   }
 * }
 */
