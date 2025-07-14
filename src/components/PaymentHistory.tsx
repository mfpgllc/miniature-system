import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: string;
  updated: string;
  paymentMethodId?: string;
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'succeeded' | 'failed'>('all');

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const { payments } = await apiService.getPaymentHistory();
      setPayments(payments);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return '✅';
      case 'failed':
      case 'canceled':
        return '❌';
      case 'processing':
        return '⏳';
      default:
        return '❓';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    if (filter === 'succeeded') return payment.status === 'succeeded';
    if (filter === 'failed') return payment.status === 'failed' || payment.status === 'canceled';
    return true;
  });

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const successfulPayments = filteredPayments.filter(p => p.status === 'succeeded').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading payment history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <div className="flex items-center">
          <div className="text-red-600 text-xl mr-2">⚠️</div>
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Payment History</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={loadPaymentHistory}
          className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
        <button
          onClick={loadPaymentHistory}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{filteredPayments.length}</div>
          <div className="text-sm text-blue-600">Total Payments</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">${(totalAmount / 100).toFixed(2)}</div>
          <div className="text-sm text-green-600">Total Amount</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{successfulPayments}</div>
          <div className="text-sm text-purple-600">Successful</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('succeeded')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'succeeded' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Successful
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'failed' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Failed
          </button>
        </div>
      </div>

      {/* Payment List */}
      {filteredPayments.length > 0 ? (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getStatusIcon(payment.status)}</span>
                    <span className="font-semibold text-gray-900">
                      ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Payment ID: {payment.id}</p>
                    <p>Created: {formatDate(payment.created)}</p>
                    {payment.updated !== payment.created && (
                      <p>Updated: {formatDate(payment.updated)}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => navigator.clipboard.writeText(payment.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    title="Copy Payment ID"
                  >
                    📋 Copy ID
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? "You haven't made any payments yet." 
              : `No ${filter} payments found.`
            }
          </p>
        </div>
      )}

      {/* Export Options */}
      {filteredPayments.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const csv = [
                  'Payment ID,Amount,Currency,Status,Created,Updated',
                  ...filteredPayments.map(p => 
                    `${p.id},${p.amount/100},${p.currency},${p.status},"${formatDate(p.created)}","${formatDate(p.updated)}"`
                  )
                ].join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
            >
              📊 Export CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory; 