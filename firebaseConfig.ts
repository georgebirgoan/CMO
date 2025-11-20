// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { FirebaseApp, getApps } from 'firebase/app';
import {
  Firestore,
  getFirestore,
} from 'firebase/firestore';



const firebaseConfig = {
  apiKey: "AIzaSyA3yD7mCKJNh-3hVHey1bWdXQZudQ6cy7I",
  authDomain: "cmo-proj.firebaseapp.com",
  projectId: "cmo-proj",
  storageBucket: "cmo-proj.firebasestorage.app",
  messagingSenderId: "882756103578",
  appId: "1:882756103578:web:3298094a24f4069b8e9e23",
  measurementId: "G-MFPV38J75V"
};

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const firestore: Firestore = getFirestore(app);

// Small helper for later (collection path)
export const getUserNotesCollectionPath = (uid: string) =>
  ['users', uid, 'notes'] as const;
