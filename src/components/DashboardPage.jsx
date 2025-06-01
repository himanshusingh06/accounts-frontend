// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import DashboardSummary from '../components/dashboard/DashboardSummary';
import AccountOverviewCard from '../components/dashboard/AccountOverviewCard';

import TransactionsPage from './TransactionsPage';

const DashboardPage = () => {
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

    return (
        <div className="container mx-auto p-4 md:p-6">
            {/* Overall Dashboard Summary */}
            <DashboardSummary />

            {/* Individual Account Overviews */}
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