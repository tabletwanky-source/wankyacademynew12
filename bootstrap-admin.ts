import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = 'admin@wanky.ac';
const ADMIN_PASS = 'admin123'; // In a real app, this would be set via environment variables

async function setup() {
  try {
    console.log('--- Wanky Academy System Bootstrap ---');
    
    // 1. Create Admin Auth
    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASS);
    const uid = userCredential.user.uid;

    // 2. Set Admin Document
    await setDoc(doc(db, 'admins', uid), {
      uid,
      email: ADMIN_EMAIL,
      role: 'admin',
      createdAt: new Date()
    });

    console.log('SUCCESS: Admin account initialized.');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Pass:', ADMIN_PASS);
    
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('SKIP: Admin already exists.');
    } else {
      console.error('ERROR during bootstrap:', error.message);
    }
  }
  process.exit();
}

setup();
