// Firebase messaging service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5lOZr-D9EwGekT9kDhYmZeUASSooJPjo",
  authDomain: "rosterblockbuster.firebaseapp.com",
  projectId: "rosterblockbuster",
  storageBucket: "rosterblockbuster.firebasestorage.app",
  messagingSenderId: "451804725199",
  appId: "1:451804725199:web:cfb0ac9293772c213a5cba"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png',
    badge: '/firebase-logo.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}); 