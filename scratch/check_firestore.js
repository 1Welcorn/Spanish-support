import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC4m1XkKdQu4YsCqZcpNGZzCOwakvuFbd8",
  authDomain: "spanish-project-f52fb.firebaseapp.com",
  projectId: "spanish-project-f52fb",
  storageBucket: "spanish-project-f52fb.firebasestorage.app",
  messagingSenderId: "261428005074",
  appId: "1:261428005074:web:877d83e65d9d0124d7850b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Checking units in Firestore...");
  try {
    const snapshot = await getDocs(collection(db, 'units'));
    console.log("Success! Units count in Firestore:", snapshot.size);
    snapshot.forEach(doc => {
      console.log(`- [${doc.id}]: ${doc.data().title}`);
    });
  } catch (err) {
    console.error("Error reading from Firestore:", err);
  }
}

run();
