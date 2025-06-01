// src/components/dashboard/AccountOverviewCard.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const AccountOverviewCard = ({ account }) => {
    const [accountTransactions, setAccountTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAccountTransactions = async () => {
            setLoading(true);
            setError(null);
            try {
                // Filter transactions by this account ID
                // Ideally, you'd have an API endpoint like /api/transactions/?account={accountId}
                // For now, we'll fetch all and filter in frontend.
                const response = await axiosInstance.get('transactions/');
                const filteredTransactions = response.data.filter(tx => tx.account === account.id);
                setAccountTransactions(filteredTransactions);
            } catch (err) {
                console.error(`Error fetching transactions for account ${account.name}:`, err);
                setError('Failed to load account transactions.');
            } finally {
                setLoading(false);
            }
        };

        fetchAccountTransactions();
    }, [account.id, account.name]); // Re-fetch if account changes

    const totalAccountCredit = accountTransactions.reduce((sum, tx) => 
        tx.transaction_type === 'CREDIT' ? sum + parseFloat(tx.amount) : sum, 0
    );

    const totalAccountDebit = accountTransactions.reduce((sum, tx) => 
        tx.transaction_type === 'DEBIT' ? sum + parseFloat(tx.amount) : sum, 0
    );

    if (loading) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-md mb-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="bg-white p-4 rounded-lg shadow-md mb-4 text-red-500">{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{account.name}</h3>
            <p className="text-gray-600 text-sm">Account No: <span className="font-medium">{account.account_number}</span></p>
            <p className="text-gray-600 text-sm mb-4">Current Balance: <span className="font-bold text-blue-600">₹{parseFloat(account.current_balance).toFixed(2)}</span></p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center border-t pt-4 mt-4">
                <div>
                    <p className="text-sm text-gray-500">Total Credit</p>
                    <p className="text-sm font-semibold text-green-600">₹{totalAccountCredit.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Total Debit</p>
                    <p className="text-sm font-semibold text-red-600">₹{totalAccountDebit.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Total Transactions</p>
                    <p className="text-sm font-semibold text-purple-600">{accountTransactions.length}</p>
                </div>
            </div>
        </div>
    );
};

export default AccountOverviewCard;