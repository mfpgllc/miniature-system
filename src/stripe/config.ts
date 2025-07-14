import { loadStripe } from '@stripe/stripe-js';

// Stripe publishable key (test environment)
// Replace with your actual Stripe publishable key
const stripePublishableKey = 'pk_test_51RkeCGRkpTifFDd8rWhdUQCvhYVvn66wWM75EzUYY42HCtd1UieZCqYCjC1MhM2Ue2DmLANdOr3WesFvKziAUAl300lIMTqUIb';

export const stripePromise = loadStripe(stripePublishableKey);

// Test card numbers for development
export const testCards = {
  success: '4242424242424242',
  decline: '4000000000000002',
  insufficientFunds: '4000000000009995',
  expired: '4000000000000069',
  incorrectCvc: '4000000000000127',
  processingError: '4000000000000119',
};

// Test card details
export const testCardDetails = {
  cvc: '123',
  expMonth: '12',
  expYear: '2025',
  name: 'Test User',
}; 