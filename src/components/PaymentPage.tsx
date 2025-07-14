import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../stripe/config';
import PaymentForm from './PaymentForm';

const PaymentPage: React.FC = () => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [paymentId, setPaymentId] = useState<string>('');

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentId(paymentId);
    setPaymentStatus('success');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setPaymentStatus('error');
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your payment has been processed successfully.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Payment ID: {paymentId}
          </p>
          <button
            onClick={() => setPaymentStatus('pending')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Make Another Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <Elements stripe={stripePromise}>
        <PaymentForm
          amount={2500} // $25.00 in cents
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </Elements>
    </div>
  );
};

export default PaymentPage; 