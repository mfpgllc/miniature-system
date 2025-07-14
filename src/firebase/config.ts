import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5lOZr-D9EwGekT9kDhYmZeUASSooJPjo",
  authDomain: "rosterblockbuster.firebaseapp.com",
  projectId: "rosterblockbuster",
  storageBucket: "rosterblockbuster.firebasestorage.app",
  messagingSenderId: "451804725199",
  appId: "1:451804725199:web:cfb0ac9293772c213a5cba",
  measurementId: "G-WFCC474JWX"
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
        vapidKey: 'BKLI84T0ixoMfv3tGo_reC6_Odqc-wH2pEpsGyGC0W-SDw8w0OIut6WWfmqseZ7lGM1xnyJ8Fyw9MsfYyg_B1O8'
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