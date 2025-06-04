// src/components/dashboard/DashboardSummary.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const DashboardSummary = () => {
    const [totalBalance, setTotalBalance] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
    const [totalDebit, setTotalDebit] = useState(0);
    const [transactionCount, setTransactionCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummaryData = async () => {
            setLoading(true);
            setError(null);
            // console.log('DashboardSummary: Starting data fetch...'); // Debug log
            try {
                // Fetch all bank accounts to sum up their current balances
                // console.log('DashboardSummary: Fetching bank accounts...'); // Debug log
                const accountsResponse = await axiosInstance.get('bank-accounts/');
                const accounts = accountsResponse.data;
                // console.log('DashboardSummary: Bank Accounts fetched:', accounts); // Debug log

                const currentTotalBalance = accounts.reduce((sum, account) => {
                    const balance = parseFloat(account.current_balance);
                    if (isNaN(balance)) {
                        console.warn(`DashboardSummary: Invalid balance for account ${account.name}:`, account.current_balance);
                        return sum;
                    }
                    return sum + balance;
                }, 0);
                setTotalBalance(currentTotalBalance);
                // console.log('DashboardSummary: Calculated totalBalance:', currentTotalBalance);

                // Fetch all transactions to calculate total credit/debit and count
                // console.log('DashboardSummary: Fetching all transactions...'); // Debug log
                const transactionsResponse = await axiosInstance.get('transactions/');
                const transactions = transactionsResponse.data;
                // console.log('DashboardSummary: Transactions fetched:', transactions);

                let creditSum = 0;
                let debitSum = 0;

                transactions.forEach(tx => {
                    const amount = parseFloat(tx.amount);
                    if (isNaN(amount)) {
                        console.warn(`DashboardSummary: Invalid amount for transaction ID ${tx.id}:`, tx.amount);
                        return;
                    }

                    if (tx.transaction_type === 'CREDIT') {
                        creditSum += amount;
                    } else if (tx.transaction_type === 'DEBIT') {
                        debitSum += amount;
                    }
                });

                setTotalCredit(creditSum);
                setTotalDebit(debitSum);
                setTransactionCount(transactions.length);
                // console.log('DashboardSummary: Calculated totalCredit:', creditSum, 'totalDebit:', debitSum, 'transactionCount:', transactions.length);

            } catch (err) {
                console.error('DashboardSummary: Error during data fetch:', err.response?.data || err.message);
                setError('Failed to load dashboard summary. Please check console for details.');
            } finally {
                setLoading(false);
                // console.log('DashboardSummary: Data fetch complete.');
            }
        };

        fetchSummaryData();
    }, []);

    if (loading) {
        return <div className="text-center py-4 text-blue-500">Loading overall summary...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center py-4">{error}</div>;
    }

    // Ensure values are numbers before toFixed and handle NaN for display
    const displayTotalBalance = isNaN(totalBalance) ? '0.00' : totalBalance.toFixed(2);
    const displayTotalCredit = isNaN(totalCredit) ? '0.00' : totalCredit.toFixed(2);
    const displayTotalDebit = isNaN(totalDebit) ? '0.00' : totalDebit.toFixed(2);

    return (
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-6 rounded-lg shadow-xl mb-8 transform hover:scale-105 transition duration-300 ease-in-out">
            <h2 className="text-3xl font-extrabold mb-6 text-center tracking-wide">Overall Financial Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Bank Balance Card */}
                <div className="bg-white p-5 rounded-lg shadow-md flex flex-col items-center justify-center border border-blue-200">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Total Bank Balance</p>
                    <p className="text-2xl font-bold text-blue-800">₹{displayTotalBalance}</p>
                </div>

                {/* Total Credit Card */}
                <div className="bg-white p-5 rounded-lg shadow-md flex flex-col items-center justify-center border border-green-200">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Total Credit (All Time)</p>
                    <p className="text-2xl font-bold text-green-700">₹{displayTotalCredit}</p>
                </div>

                {/* Total Debit Card */}
                <div className="bg-white p-5 rounded-lg shadow-md flex flex-col items-center justify-center border border-red-200">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Total Debit (All Time)</p>
                    <p className="text-2xl font-bold text-red-700">₹{displayTotalDebit}</p>
                </div>

                {/* Total Transactions Card */}
                <div className="bg-white p-5 rounded-lg shadow-md flex flex-col items-center justify-center border border-purple-200">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Total Transactions</p>
                    <p className="text-2xl font-bold text-purple-700">{transactionCount}</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardSummary;