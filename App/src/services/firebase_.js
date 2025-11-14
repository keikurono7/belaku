import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCB-oTWfV-tN1qtNxh19TFI3HsLJ2V5hbI",
  authDomain: "crafty-nomad-400714.firebaseapp.com",
  projectId: "crafty-nomad-400714",
  storageBucket: "crafty-nomad-400714.firebasestorage.app",
  messagingSenderId: "283929521585",
  appId: "1:283929521585:web:2289b6c73e3d57040c2190",
  measurementId: "G-8KBZHRBP5H"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };