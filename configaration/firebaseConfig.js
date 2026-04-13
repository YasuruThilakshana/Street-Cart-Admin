  // // 🔴 STEP 1: Import Firebase SDKs
  //    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
  //   import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


  //   // 🔴 STEP 2: Paste your Firebase config here
  //   const firebaseConfig = {
  //   apiKey: "AIzaSyBOgRZ1oQblp1ZvGvhMf4ZmlqyXwTs6MQw",
  //   authDomain: "streetcart-c0ee9.firebaseapp.com",
  //   projectId: "streetcart-c0ee9",
  //   storageBucket: "streetcart-c0ee9.firebasestorage.app",
  //   messagingSenderId: "349484919360",
  //   appId: "1:349484919360:web:fd1dbff1d3bd2c91290da5",
  //   measurementId: "G-BSPTNN431C"
  // };

  //   // 🔴 STEP 3: Initialize Firebase
  //   const app = initializeApp(firebaseConfig);
  //   const db = getFirestore(app);

  //  export { db };


   import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBOgRZ1oQblp1ZvGvhMf4ZmlqyXwTs6MQw",
  authDomain: "streetcart-c0ee9.firebaseapp.com",
  projectId: "streetcart-c0ee9",
  storageBucket: "streetcart-c0ee9.firebasestorage.app",
  messagingSenderId: "349484919360",
  appId: "1:349484919360:web:fd1dbff1d3bd2c91290da5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };