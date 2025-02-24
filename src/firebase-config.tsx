// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { setPersistence,signOut,browserSessionPersistence } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAg2RCztavZ1xTXw9H79NovskJk0XtdvxQ",
  
    authDomain: "litsoc-week.firebaseapp.com",
  
    projectId: "litsoc-week",
  
    storageBucket: "litsoc-week.firebasestorage.app",
  
    messagingSenderId: "379873397570",
  
    appId: "1:379873397570:web:9f03b6d3a95877099c96db",
  
    measurementId: "G-TWVNP9CX9Q"
  

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

const auth = getAuth(app)

export { db,auth };
setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });
window.addEventListener('beforeunload', () => {
  signOut(auth);
});


