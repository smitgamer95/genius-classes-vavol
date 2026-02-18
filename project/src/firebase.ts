import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBSHnoSvUbngvO8VOWFbMr-7xxSftZwf58",
  authDomain: "genius-classes-vaavol.firebaseapp.com",
  projectId: "genius-classes-vaavol",
  storageBucket: "genius-classes-vaavol.firebasestorage.app",
  messagingSenderId: "646240113944",
  appId: "1:646240113944:web:6ec159d3c4735cbca8ba6d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
