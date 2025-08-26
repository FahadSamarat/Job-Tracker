// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnPi_jxCRqboKaL7lszjYrYv5sAn9xJq0",
  authDomain: "job-tracker-c833c.firebaseapp.com",
  projectId: "job-tracker-c833c",
  storageBucket: "job-tracker-c833c.firebasestorage.app",
  messagingSenderId: "868751564",
  appId: "1:868751564:web:6344053fe88050d9bb0a69",
  measurementId: "G-K9FWZ9NFKQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);