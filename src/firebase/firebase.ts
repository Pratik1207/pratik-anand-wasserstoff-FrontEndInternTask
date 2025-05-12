
import { initializeApp } from "firebase/app";

import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyDRGm5pqj2y1Ae0R39PAwU-35XayIc2blk",
  authDomain: "collaborative-editor-faf45.firebaseapp.com",
  databaseURL: "https://collaborative-editor-faf45-default-rtdb.firebaseio.com/",
  projectId: "collaborative-editor-faf45",
  storageBucket: "collaborative-editor-faf45.firebasestorage.app",
  messagingSenderId: "617153419342",
  appId: "1:617153419342:web:16e62b3900474d92740b1f",
  measurementId: "G-YGRP6EHPXG"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);