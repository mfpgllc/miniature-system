# Backend Server - Payment Processing API

A Node.js/Express backend server that handles Stripe payment processing with Firebase authentication and Firestore database integration.

## Features

- 🔐 **Firebase Authentication** - Secure user authentication
- 💳 **Stripe Payment Processing** - Real payment processing with Stripe
- 📊 **Firestore Integration** - Payment history and data storage
- 🔔 **Webhook Support** - Real-time payment event handling
- 🛡️ **Security** - JWT token verification and CORS protection

## Prerequisites

- Node.js (v16 or higher)
- Firebase project with Firestore enabled
- Stripe account with API keys
- Firebase Admin SDK service account

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Update the `.env` file with your actual values:

```env
# Server Configuration
PORT=3001

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Firebase Admin Configuration
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@rosterblockbuster.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40rosterblockbuster.iam.gserviceaccount.com
```

### 3. Get Firebase Admin SDK Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service accounts**
4. Click **Generate new private key**
5. Download the JSON file and extract the values to your `.env` file

### 4. Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your **Secret key** (starts with `sk_test_`)
4. For webhooks, go to **Developers** → **Webhooks**
5. Create an endpoint and copy the **Signing secret**

### 5. Start the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication Required Endpoints

All endpoints require a valid Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

### Payment Endpoints

- `POST /api/create-payment-intent` - Create a new payment intent
- `POST /api/confirm-payment` - Confirm a payment with payment method
- `GET /api/payment-history` - Get user's payment history
- `GET /api/payment-intent/:id` - Get payment intent status

### Webhook Endpoints

- `POST /api/webhook` - Stripe webhook endpoint for payment events

### Health Check

- `GET /health` - Server health check

## Request Examples

### Create Payment Intent

```bash
curl -X POST http://localhost:3001/api/create-payment-intent \
  -H "Authorization: Bearer <firebase_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2500,
    "currency": "usd",
    "metadata": {
      "description": "Test payment"
    }
  }'
```

### Confirm Payment

```bash
curl -X POST http://localhost:3001/api/confirm-payment \
  -H "Authorization: Bearer <firebase_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "pi_1234567890",
    "paymentMethodId": "pm_1234567890"
  }'
```

## Database Schema

### Collections

- `payments` - Payment records
- `paymentIntents` - Payment intent records

### Payment Document Structure

```javascript
{
  userId: string,
  amount: number,
  currency: string,
  status: string,
  paymentMethodId: string,
  created: timestamp,
  updated: timestamp
}
```

## Security

- All endpoints require Firebase authentication
- CORS enabled for frontend communication
- Stripe webhook signature verification
- Input validation and error handling

## Deployment

### Environment Variables

Make sure to set all required environment variables in your production environment.

### Firebase Admin SDK

Ensure your Firebase Admin SDK service account has the necessary permissions for Firestore and Authentication.

### Stripe Webhooks

Configure your Stripe webhook endpoint in production to point to your deployed server's `/api/webhook` endpoint.

## Error Handling

The server includes comprehensive error handling for:
- Authentication failures
- Invalid payment data
- Stripe API errors
- Database errors
- Network issues

All errors are logged and appropriate HTTP status codes are returned. 