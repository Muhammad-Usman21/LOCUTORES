// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: "locutores-1e156.firebaseapp.com",
	projectId: "locutores-1e156",
	storageBucket: "locutores-1e156.appspot.com",
	messagingSenderId: "408226919783",
	appId: "1:408226919783:web:7887ef3c58929f1231ebc2",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
