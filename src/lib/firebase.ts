import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDqigE7ER2M-i3V3P0ZXYhww-WPzK2KIkI",
  authDomain: "vaultify-app-cd7bd.firebaseapp.com",
  projectId: "vaultify-app-cd7bd",
  storageBucket: "vaultify-app-cd7bd.firebasestorage.app",
  messagingSenderId: "282350979715",
  appId: "1:282350979715:web:9687482e50eb233a2de9b6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);