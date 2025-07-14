# Miniature System - Firebase Web App

A modern React TypeScript web application with Firebase integration for authentication, Firestore database, and push notifications.

## Features

- 🔐 **Firebase Authentication** - Email/password sign up and sign in
- 📊 **Firestore Database** - Real-time messaging and data storage
- 🔔 **Push Notifications** - Firebase Cloud Messaging integration
- 💳 **Stripe Payments** - Secure payment processing with test environment
- ⚡ **Vite** - Fast development and build tooling
- 🎨 **Tailwind CSS** - Modern, utility-first CSS framework
- 📱 **Responsive Design** - Works on desktop and mobile

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/mfpgllc/miniature-system.git
cd miniature-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Configuration

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the setup wizard

2. **Enable Services:**
   - **Authentication:** Go to Authentication → Sign-in method → Enable Email/Password
   - **Firestore:** Go to Firestore Database → Create database → Start in test mode
   - **Cloud Messaging:** Go to Project Settings → Cloud Messaging → Generate key pair

3. **Get Configuration:**
   - Go to Project Settings → General → Your apps
   - Click the web icon (</>) to add a web app
   - Copy the configuration object

4. **Update Configuration:**
   - Open `src/firebase/config.ts`
   - Replace the placeholder values with your Firebase config:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

5. **Update Service Worker:**
   - Open `public/firebase-messaging-sw.js`
   - Replace the Firebase config with your actual config

  6. **Get VAPID Key:**
   - In Firebase Console, go to Project Settings → Cloud Messaging
   - Generate a new key pair
   - Copy the key and replace `YOUR_VAPID_KEY` in `src/firebase/config.ts`

### 4. Stripe Configuration

1. **Create a Stripe Account:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Sign up for a free account
   - Navigate to the test environment

2. **Get Your Publishable Key:**
   - Go to Developers → API keys
   - Copy your **Publishable key** (starts with `pk_test_`)

3. **Update Stripe Configuration:**
   - Open `src/stripe/config.ts`
   - Replace `pk_test_YOUR_PUBLISHABLE_KEY` with your actual publishable key

4. **Test Cards:**
   - Use the test card numbers provided in the payment form
   - `4242424242424242` for successful payments
   - `4000000000000002` for declined payments

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── Login.tsx          # Authentication component
│   └── Dashboard.tsx      # Main app dashboard
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── firebase/
│   └── config.ts          # Firebase configuration
├── App.tsx                # Main app component
└── main.tsx              # App entry point

public/
└── firebase-messaging-sw.js  # Service worker for notifications
```

## Usage

1. **Sign Up/Sign In:** Use the login form to create an account or sign in
2. **Send Messages:** Once authenticated, you can send messages that are stored in Firestore
3. **Notifications:** Allow browser notifications to receive push messages
4. **Real-time Updates:** Messages appear in real-time across all connected users

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting:
   ```bash
   firebase init hosting
   ```

4. Deploy:
   ```bash
   firebase deploy
   ```

## Security Rules

Make sure to set up proper Firestore security rules in your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
