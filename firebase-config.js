/**
 * Firebase Configuration
 * -----------------------------------------------------------------
 * File sebelumnya rusak (berisi salinan index.html lama, bukan
 * JavaScript config), sehingga Firebase tidak pernah benar-benar
 * menyala dan semua data (visitor, pesan kontak) diam-diam hanya
 * tersimpan di localStorage browser masing-masing pengunjung.
 *
 * Cara mengaktifkan Firestore yang sesungguhnya:
 * 1. Buka https://console.firebase.google.com -> buat/ pilih project.
 * 2. Project settings -> General -> "Your apps" -> Web app -> copy
 *    objek firebaseConfig yang diberikan Firebase ke bawah ini.
 * 3. Aktifkan Firestore Database di menu Build -> Firestore Database.
 * 4. Ubah FIREBASE_ENABLED menjadi true.
 *
 * Selama FIREBASE_ENABLED masih false, database.js otomatis
 * memakai localStorage sebagai fallback — situs tetap berjalan
 * normal, hanya datanya tidak tersinkron ke cloud.
 * -----------------------------------------------------------------
 */

const FIREBASE_ENABLED = false; // ubah ke true setelah mengisi config asli di bawah

const firebaseConfig = {
    apiKey: "GANTI_DENGAN_API_KEY_ANDA",
    authDomain: "GANTI.firebaseapp.com",
    projectId: "GANTI_PROJECT_ID",
    storageBucket: "GANTI.appspot.com",
    messagingSenderId: "GANTI_SENDER_ID",
    appId: "GANTI_APP_ID"
};