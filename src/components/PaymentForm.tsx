import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { stripePromise, testCards, testCardDetails } from '../stripe/config';
import { apiService } from '../services/api';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }

    try {
      // Create payment intent on backend
      const { clientSecret, paymentIntentId } = await apiService.createPaymentIntent(amount);

      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: testCardDetails.name,
        },
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      // Confirm payment with backend
      const { success, paymentIntent } = await apiService.confirmPayment(
        paymentIntentId,
        paymentMethod.id
      );

      if (success) {
        onSuccess(paymentIntent.id);
      } else {
        setError('Payment confirmation failed');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
      
      <div className="mb-4">
        <p className="text-lg font-semibold text-gray-700">
          Total Amount: ${(amount / 100).toFixed(2)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-md p-3">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Test Cards</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Success:</strong> {testCards.success}</p>
          <p><strong>Decline:</strong> {testCards.decline}</p>
          <p><strong>Insufficient Funds:</strong> {testCards.insufficientFunds}</p>
          <p><strong>Expired:</strong> {testCards.expired}</p>
          <p><strong>Incorrect CVC:</strong> {testCards.incorrectCvc}</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Use any future expiry date and any 3-digit CVC
        </p>
      </div>
    </div>
  );
};

export default PaymentForm; 