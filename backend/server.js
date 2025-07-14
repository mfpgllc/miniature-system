const express = require('express');
const cors = require('cors');
const stripe = require('stripe');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Stripe
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: "rosterblockbuster",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Middleware to verify Firebase token
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Create payment intent
app.post('/api/create-payment-intent', authenticateUser, async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;
    
    if (!amount || amount < 50) {
      return res.status(400).json({ error: 'Amount must be at least 50 cents' });
    }

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount,
      currency,
      metadata: {
        ...metadata,
        userId: req.user.uid,
        userEmail: req.user.email
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store payment intent in Firestore
    await db.collection('paymentIntents').doc(paymentIntent.id).set({
      userId: req.user.uid,
      amount,
      currency,
      status: paymentIntent.status,
      created: admin.firestore.FieldValue.serverTimestamp(),
      metadata
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment
app.post('/api/confirm-payment', authenticateUser, async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const paymentIntent = await stripeClient.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    // Update payment record in Firestore
    await db.collection('payments').doc(paymentIntent.id).set({
      userId: req.user.uid,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      paymentMethodId,
      created: admin.firestore.FieldValue.serverTimestamp(),
      updated: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: paymentIntent.status === 'succeeded',
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      }
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Get payment history
app.get('/api/payment-history', authenticateUser, async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    
    let paymentsRef = db.collection('payments')
      .where('userId', '==', req.user.uid)
      .orderBy('created', 'desc');

    // Add status filter if provided
    if (status && status !== 'all') {
      paymentsRef = paymentsRef.where('status', '==', status);
    }

    // Apply pagination
    paymentsRef = paymentsRef.limit(parseInt(limit)).offset(parseInt(offset));

    const snapshot = await paymentsRef.get();
    const payments = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      payments.push({
        id: doc.id,
        ...data,
        created: data.created?.toDate?.()?.toISOString(),
        updated: data.updated?.toDate?.()?.toISOString()
      });
    });

    // Get total count for pagination
    const totalSnapshot = await db.collection('payments')
      .where('userId', '==', req.user.uid)
      .get();
    
    const totalCount = totalSnapshot.size;

    res.json({ 
      payments,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + payments.length < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Get payment intent status
app.get('/api/payment-intent/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const paymentIntent = await stripeClient.paymentIntents.retrieve(id);
    
    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    res.status(500).json({ error: 'Failed to retrieve payment intent' });
  }
});

// Get payment statistics
app.get('/api/payment-stats', authenticateUser, async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    let startDate = null;
    const now = new Date();
    
    // Calculate start date based on period
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = null; // All time
    }

    let paymentsRef = db.collection('payments')
      .where('userId', '==', req.user.uid);

    if (startDate) {
      paymentsRef = paymentsRef.where('created', '>=', admin.firestore.Timestamp.fromDate(startDate));
    }

    const snapshot = await paymentsRef.get();
    
    let totalAmount = 0;
    let successfulPayments = 0;
    let failedPayments = 0;
    let processingPayments = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      totalAmount += data.amount || 0;
      
      switch (data.status) {
        case 'succeeded':
          successfulPayments++;
          break;
        case 'failed':
        case 'canceled':
          failedPayments++;
          break;
        case 'processing':
          processingPayments++;
          break;
      }
    });

    res.json({
      period,
      totalPayments: snapshot.size,
      totalAmount,
      successfulPayments,
      failedPayments,
      processingPayments,
      successRate: snapshot.size > 0 ? (successfulPayments / snapshot.size * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
});

// Webhook endpoint for Stripe events
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Update payment record in Firestore
        await db.collection('payments').doc(paymentIntent.id).set({
          userId: paymentIntent.metadata.userId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          created: admin.firestore.FieldValue.serverTimestamp(),
          updated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        
        // Update payment record in Firestore
        await db.collection('payments').doc(failedPayment.id).set({
          userId: failedPayment.metadata.userId,
          amount: failedPayment.amount,
          currency: failedPayment.currency,
          status: failedPayment.status,
          lastPaymentError: failedPayment.last_payment_error,
          created: admin.firestore.FieldValue.serverTimestamp(),
          updated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
}); 