// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAn13BZrbdf-d4MB_6h6-vx5tILw5MJ2kg",
  authDomain: "moodtracker-65b0b.firebaseapp.com",
  projectId: "moodtracker-65b0b",
  storageBucket: "moodtracker-65b0b.firebasestorage.app",
  messagingSenderId: "9448514113",
  appId: "1:9448514113:web:e53de9281ffa8236539cc0",
  measurementId: "G-DKHYKF22DL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);