// src/pages/DashboardPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Import useDispatch and useSelector
import axiosInstance from '../utils/axiosInstance';
import { selectCurrentUser } from '../redux/features/auth/authSlice';
import {
  fetchBankAccounts,
  selectAllBankAccounts, // Selects accounts from Redux store
  selectAccountsLoading,
  selectAccountsError,
} from '../redux/features/accounts/accountSlice';

// Make sure these components are imported correctly
import DashboardSummary from '../components/dashboard/DashboardSummary';
import AccountOverviewCard from '../components/dashboard/AccountOverviewCard';
// If TransactionsPage is directly embedded and not just linked, ensure its path is correct
// import TransactionsPage from './TransactionsPage'; // This line might not be needed if it's only linked


const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  // Get bank accounts and their loading/error states from Redux store using selectors
  const bankAccounts = useSelector(selectAllBankAccounts);
  const loadingAccounts = useSelector(selectAccountsLoading);
  const accountsError = useSelector(selectAccountsError);

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingRecentTransactions, setLoadingRecentTransactions] = useState(true);
  const [recentTransactionsError, setRecentTransactionsError] = useState(null);

  // Helper function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Fetch bank accounts into Redux store when component mounts (or if not loaded yet)
  useEffect(() => {
    if (bankAccounts.length === 0 && !loadingAccounts && !accountsError) {
      dispatch(fetchBankAccounts());
    }
  }, [dispatch, bankAccounts.length, loadingAccounts, accountsError]); // Dependencies: re-run if Redux state for accounts is empty or error/loading status changes

  // Fetch recent transactions
  const fetchRecentTransactions = useCallback(async () => {
    setLoadingRecentTransactions(true);
    setRecentTransactionsError(null);
    try {
      const response = await axiosInstance.get('transactions/', {
        params: {
          ordering: '-created_at',
          limit: 5,
        },
      });
      setRecentTransactions(response.data.slice(0, 5));
    } catch (err) {
      console.error('Error fetching recent transactions:', err);
      setRecentTransactionsError('Failed to load recent transactions.');
    } finally {
      setLoadingRecentTransactions(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentTransactions();
  }, [fetchRecentTransactions]);

  // Handle navigation to reconciliation page
  const handleReconciliationClick = () => {
    navigate('/reconciliation');
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">
        Welcome, {currentUser ? currentUser.username : 'Guest'}!
      </h1>

      {/* Overall Dashboard Summary - now uses Redux too */}
      <DashboardSummary />

      {/* Accounts Overview and Navigation Cards */}
      <h2 className="text-2xl font-bold text-blue-700 mb-4 mt-8">Your Accounts & Quick Links</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Render AccountOverviewCards dynamically from Redux state */}
        {loadingAccounts ? (
          <div className="md:col-span-3 text-center py-4 text-blue-500">Loading bank accounts...</div>
        ) : accountsError ? (
          <div className="md:col-span-3 text-red-500 text-center py-4">{accountsError}</div>
        ) : bankAccounts.length === 0 ? (
          <div className="md:col-span-3 text-center py-4 text-gray-500">No bank accounts added yet.</div>
        ) : (
          bankAccounts.map(account => (
            <AccountOverviewCard key={account.id} account={account} />
          ))
        )}

        {/* View All Transactions Link Card */}
        <Link to="/transactions" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-700">View All Transactions</h3>
            <p className="text-lg text-gray-500 mt-2">Add, edit, or view transaction history.</p>
          </div>
          <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </Link>

        {/* Bank Reconciliation Link Card */}
        <div
          onClick={handleReconciliationClick}
          className="cursor-pointer block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-between"
        >
          <div>
            <h3 className="text-xl font-semibold text-gray-700">Bank Reconciliation</h3>
            <p className="text-lg text-gray-500 mt-2">Reconcile your bank statements.</p>
          </div>
          <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Recent Transactions</h2>
        {loadingRecentTransactions ? (
          <p className="text-gray-600">Loading recent transactions...</p>
        ) : recentTransactionsError ? (
          <p className="text-red-500">{recentTransactionsError}</p>
        ) : recentTransactions.length === 0 ? (
          <p className="text-gray-600">No recent transactions found. Add some transactions to see them here!</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="max-h-80 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.account_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{tx.transaction_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.transaction_head}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(tx.amount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">{tx.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;