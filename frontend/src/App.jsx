import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import SubscriptionLeakDetector from './pages/SubscriptionLeakDetector';
import Analytics from './pages/Analytics';
import SmartSuggestions from './pages/SmartSuggestions';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId || clientId.includes('your_real')) {
    console.warn('Google Client ID is missing or using placeholder. Google Login will not work until configured in frontend/.env');
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/add-expense" element={<ProtectedRoute><Layout><AddExpense /></Layout></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Layout><Transactions /></Layout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
          <Route path="/suggestions" element={<ProtectedRoute><Layout><SmartSuggestions /></Layout></ProtectedRoute>} />
          <Route path="/leak-detector" element={<ProtectedRoute><Layout><SubscriptionLeakDetector /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
