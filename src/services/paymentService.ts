// Payment service for handling Stripe payments
// In a real application, this would communicate with your backend

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'processing' | 'requires_payment_method';
  client_secret: string;
}

export const createPaymentIntent = async (amount: number): Promise<PaymentIntent> => {
  // Simulate API call to your backend
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: `pi_${Math.random().toString(36).substr(2, 9)}`,
    amount,
    currency: 'usd',
    status: 'succeeded',
    client_secret: `pi_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`
  };
};

export const confirmPayment = async (paymentMethodId: string, amount: number): Promise<{ success: boolean; paymentId?: string; error?: string }> => {
  // Simulate payment confirmation
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate different payment scenarios
  const random = Math.random();
  
  if (random > 0.1) { // 90% success rate
    return {
      success: true,
      paymentId: `ch_${Math.random().toString(36).substr(2, 9)}`
    };
  } else {
    return {
      success: false,
      error: 'Payment was declined. Please try a different card.'
    };
  }
};

export const getPaymentHistory = async (): Promise<Array<{ id: string; amount: number; status: string; date: string }>> => {
  // Simulate fetching payment history
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      id: 'ch_1234567890',
      amount: 2500,
      status: 'succeeded',
      date: new Date().toISOString()
    },
    {
      id: 'ch_0987654321',
      amount: 1500,
      status: 'succeeded',
      date: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    }
  ];
}; 