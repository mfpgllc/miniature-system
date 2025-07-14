import { auth } from '../firebase/config';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async getAuthToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return await user.getIdToken();
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Payment Intent API
  async createPaymentIntent(amount: number, currency: string = 'usd', metadata: any = {}): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    return this.makeRequest('/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, metadata }),
    });
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<{
    success: boolean;
    paymentIntent: {
      id: string;
      status: string;
      amount: number;
      currency: string;
    };
  }> {
    return this.makeRequest('/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, paymentMethodId }),
    });
  }

  async getPaymentHistory(limit?: number, offset?: number, status?: string): Promise<{
    payments: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      created: string;
      updated: string;
    }>;
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    if (status) params.append('status', status);
    
    return this.makeRequest(`/payment-history?${params.toString()}`);
  }

  async getPaymentStats(period: string = 'all'): Promise<{
    period: string;
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    processingPayments: number;
    successRate: string;
  }> {
    return this.makeRequest(`/payment-stats?period=${period}`);
  }

  async getPaymentIntentStatus(paymentIntentId: string): Promise<{
    id: string;
    status: string;
    amount: number;
    currency: string;
  }> {
    return this.makeRequest(`/payment-intent/${paymentIntentId}`);
  }
}

export const apiService = new ApiService(); 