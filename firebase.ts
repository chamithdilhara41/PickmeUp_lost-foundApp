// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"; 
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsgK4NN8bBOiRwJYBTWXfgwIyp3cujNwU",
  authDomain: "pickmeup-app-20a88.firebaseapp.com",
  projectId: "pickmeup-app-20a88",
  storageBucket: "pickmeup-app-20a88.firebasestorage.app",
  messagingSenderId: "361147794816",
  appId: "1:361147794816:web:a7b68e9a3eaaa7bb8c6d65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
