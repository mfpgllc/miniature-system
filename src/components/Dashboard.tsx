import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signOut, addDocument, getDocuments, requestNotificationPermission, onMessageListener } from '../firebase/config';
import PaymentPage from './PaymentPage';

interface Message {
  id: string;
  text: string;
  userId: string;
  timestamp: any;
}

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [notificationToken, setNotificationToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    loadMessages();
    setupNotifications();
  }, []);

  const loadMessages = async () => {
    try {
      const docs = await getDocuments('messages');
      setMessages(docs as Message[]);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setNotificationToken(token);
      console.log('Notification token:', token);
    }

    // Listen for foreground messages
    onMessageListener().then((payload: any) => {
      console.log('Received foreground message:', payload);
      // You can show a custom notification here
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    setLoading(true);
    try {
      await addDocument('messages', {
        text: newMessage,
        userId: currentUser.uid,
        timestamp: new Date(),
      });
      setNewMessage('');
      loadMessages(); // Reload messages
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (showPayment) {
    return <PaymentPage />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Miniature System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPayment(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                💳 Make Payment
              </button>
              <span className="text-sm text-gray-700">
                Welcome, {currentUser?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Messages</h2>
            
            {/* Messages List */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.userId === currentUser?.uid
                      ? 'bg-blue-100 ml-auto'
                      : 'bg-gray-100'
                  } max-w-xs`}
                >
                  <p className="text-sm text-gray-900">{message.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp?.toDate?.()?.toLocaleString() || 'Just now'}
                  </p>
                </div>
              ))}
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </form>

            {/* Notification Status */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Notification Status</h3>
              {notificationToken ? (
                <p className="text-sm text-green-600">
                  ✅ Notifications enabled
                </p>
              ) : (
                <p className="text-sm text-yellow-600">
                  ⚠️ Notifications not enabled. Check browser permissions.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 