import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Your Firebase configuration
// Replace these values with your actual Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

// Authentication functions
export const signInWithEmailAndPassword = async (email: string, password: string) => {
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  return signInWithEmailAndPassword(auth, email, password);
};

export const createUserWithEmailAndPassword = async (email: string, password: string) => {
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  const { signOut } = await import('firebase/auth');
  return signOut(auth);
};

// Firestore functions
export const addDocument = async (collection: string, data: any) => {
  const { collection: firestoreCollection, addDoc } = await import('firebase/firestore');
  const docRef = await addDoc(firestoreCollection(db, collection), data);
  return docRef;
};

export const getDocuments = async (collection: string) => {
  const { collection: firestoreCollection, getDocs } = await import('firebase/firestore');
  const querySnapshot = await getDocs(firestoreCollection(db, collection));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Messaging functions
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY'
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

export default app; 