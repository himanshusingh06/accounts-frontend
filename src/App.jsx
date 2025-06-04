// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout, selectIsAuthenticated } from './redux/features/auth/authSlice'; // Ensure logout is imported if used directly

// Import the Layout component
import Layout from './components/Layout';
// IMPORTANT: Correct import path for your LoginForm component
import LoginForm from './redux/features/auth/LoginForm'; // Corrected path for LoginForm

// Assuming these are your actual page components
import DashboardPage from './components/DashboardPage';
import BankAccountsPage from './components/BankAccountsPage';
import TransactionsPage from './components/TransactionsPage';
import CashbookPage from './components/CashbookPage';
import ReportsPage from './components/ReportsPage';
import BankReconciliationPage from './components/BankReconciliationPage';

// --- LoginPage component (now directly uses LoginForm) ---
const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-4">Login</h2> {/* Changed title to just "Login" */}
        <LoginForm /> {/* Render your LoginForm component here */}
      </div>
    </div>
  );
};

// --- Placeholder components (removed data-aos) ---
const BudgetPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Budget Preparation</h1>
      <p>Manage budget planning and allocation.</p>
      {/* Your Budget content */}
    </div>
  );
};

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-red-600">404 - Page Not Found</h1>
    </div>
  );
};

// PrivateRoute component - remains the same
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Effect to initialize authentication state from localStorage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken'); // Use 'authToken' as per your LoginForm
    const storedUser = localStorage.getItem('user'); // Assuming user is stored as a stringified JSON

    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // IMPORTANT: Ensure the user object stored in localStorage (and then dispatched)
        // includes `is_staff` or `is_superuser` if you want admin-only features to work.
        // Your LoginForm currently dispatches `{ user: { username } }`.
        // You'll need to fetch full user details from your Django backend after token validation
        // or ensure your token endpoint returns these details.
        dispatch(loginSuccess({ token: storedToken, user: user }));
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
        // If parsing fails, clear token/user to prevent issues
        dispatch(logout()); // Ensure logout action is dispatched if data is corrupt
      }
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes, wrapped by PrivateRoute and Layout */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout><DashboardPage /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <PrivateRoute>
              <Layout><BankAccountsPage /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <Layout><TransactionsPage /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reconciliation"
          element={
            <PrivateRoute>
              <Layout><BankReconciliationPage /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/cashbook"
          element={
            <PrivateRoute>
              <Layout><CashbookPage /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Layout><ReportsPage /></Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <PrivateRoute>
              <Layout><BudgetPage /></Layout>
            </PrivateRoute>
          }
        />

        {/* Redirect root to dashboard if authenticated, else to login */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;