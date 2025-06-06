// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation cards
import { useSelector } from 'react-redux'; // Import useSelector to access Redux state
import axiosInstance from '../utils/axiosInstance';
import DashboardSummary from '../components/dashboard/DashboardSummary';
import AccountOverviewCard from '../components/dashboard/AccountOverviewCard';

import TransactionsPage from './TransactionsPage'; // Assuming this is your full transactions page
import { selectCurrentUser } from '../redux/features/auth/authSlice'; // Import selectCurrentUser

const DashboardPage = () => {
    const navigate = useNavigate();
    const currentUser = useSelector(selectCurrentUser); // Access the current user from Redux store

    const [bankAccounts, setBankAccounts] = useState([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [accountsError, setAccountsError] = useState(null);

    useEffect(() => {
        const fetchBankAccounts = async () => {
            setLoadingAccounts(true);
            setAccountsError(null);
            try {
                const response = await axiosInstance.get('bank-accounts/');
                setBankAccounts(response.data);
            } catch (err) {
                console.error('Error fetching bank accounts:', err);
                setAccountsError('Failed to load bank accounts for individual summaries.');
            } finally {
                setLoadingAccounts(false);
            }
        };

        fetchBankAccounts();
    }, []);

    // Function to handle navigation to reconciliation page
    const handleReconciliationClick = () => {
      navigate('/reconciliation');
    };

    return (
        <div className="container mx-auto p-4 md:p-6">
            {/* Welcome Message - now dynamically displays username */}
            <h1 className="text-4xl font-bold text-blue-800 mb-6">
                Welcome, {currentUser ? currentUser.username : 'Guest'}!
            </h1>

            {/* Overall Dashboard Summary */}
            <DashboardSummary />

            {/* Individual Account Overviews (and Bank Reconciliation card) */}
            <h2 className="text-2xl font-bold text-blue-700 mb-4 mt-8">Accounts Overview</h2>
            {loadingAccounts ? (
                <div className="text-center py-4 text-blue-500">Loading accounts...</div>
            ) : accountsError ? (
                <div className="text-red-500 text-center py-4">{accountsError}</div>
            ) : bankAccounts.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No bank accounts added yet.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bankAccounts.map(account => (
                        <AccountOverviewCard key={account.id} account={account} />
                    ))}
                    {/* Bank Reconciliation Link Card */}
                    <div
                      onClick={handleReconciliationClick}
                      className="cursor-pointer block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-between"
                    >
                      <div>
                        <h2 className="text-xl font-semibold text-gray-700">Bank Reconciliation</h2>
                        <p className="text-lg text-gray-500 mt-2">Reconcile your bank statements.</p>
                      </div>
                      <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                    </div>
                </div>
            )}

            {/* Your Existing Transaction List (could be renamed to RecentTransactions) */}
            <h2 className="text-2xl font-bold text-blue-700 mb-4 mt-8">Recent Transactions</h2>
            <TransactionsPage /> {/* Assuming TransactionList fetches its own data */}

            {/* You can add more sections here, like charts, analytics, etc. */}
        </div>
    );
};

export default DashboardPage;