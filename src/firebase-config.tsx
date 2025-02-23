// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6J8W8OQkdbLw_UVZcAqeNBGz4st0bc9E",
  authDomain: "litsoc-jeaporady.firebaseapp.com",
  projectId: "litsoc-jeaporady",
  storageBucket: "litsoc-jeaporady.firebasestorage.app",
  messagingSenderId: "1000912160668",
  appId: "1:1000912160668:web:01d38f6c3ffc58af896a59",
  measurementId: "G-35P205C06S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };