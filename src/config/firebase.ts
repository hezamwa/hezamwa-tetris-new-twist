import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789:web:demo123456789',
};

// Check if we're using demo/placeholder config
const isUsingDemoConfig = firebaseConfig.apiKey === 'demo-api-key';

if (isUsingDemoConfig) {
  console.warn(
    '🔥 Firebase is using demo configuration. Authentication features will not work.\n' +
    'To enable Firebase features:\n' +
    '1. Create a .env file in the project root\n' +
    '2. Add your Firebase configuration from https://console.firebase.google.com/\n' +
    '3. See README.md for detailed setup instructions'
  );
}

let app;
let auth;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Create null exports so the app doesn't crash
  auth = null as any;
  db = null as any;
  storage = null as any;
}

export { auth, db, storage }; 