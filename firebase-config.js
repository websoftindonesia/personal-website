/**
 * Konfigurasi Firebase — ganti nilai di bawah dengan data proyek Anda.
 * Cara setup: https://console.firebase.google.com → Create project → Web app → copy config
 * Aktifkan Firestore: Build → Firestore Database → Create database (mode test/production)
 */
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAWWXiI5ReyoRndPtzSZL0-2WMtjlJ6svo",
    authDomain: "wazryndev.firebaseapp.com",
    projectId: "wazryndev",
    storageBucket: "wazryndev.firebasestorage.app",
    messagingSenderId: "899758384389",
    appId: "1:899758384389:web:aa370adffd41d877dd436c",
    measurementId: "G-QFV2VT5RRH"
  };

/** Set true setelah semua field di atas sudah diisi (bukan placeholder) */
const FIREBASE_ENABLED =
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes("ISI_") &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes("ISI_");

/**
 * Firestore Security Rules (tempel di Firebase Console → Firestore → Rules):
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
