// src/components/dashboard/DashboardSummary.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // Import useDispatch as well
import { selectAllBankAccounts } from '../../redux/features/accounts/accountSlice'; // Get bank accounts from Redux
import {
  fetchAllTransactions, // Import fetchAllTransactions thunk
  selectAllTransactions, // Select ALL transactions for summary
  selectTransactionsLoadingAll, // Get loading state for all transactions
  selectTransactionsError,
} from '../../redux/features/transactions/transactionSlice'; // Assuming you have a transactions slice and selector


const DashboardSummary = () => {
    const dispatch = useDispatch(); // Initialize useDispatch
    const [totalBalance, setTotalBalance] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
    const [totalDebit, setTotalDebit] = useState(0);
    const [transactionCount, setTransactionCount] = useState(0);
    const [loadingSummary, setLoadingSummary] = useState(true); // Separate loading state for summary calculation
    const [error, setError] = useState(null);

    // Select latest bank accounts and ALL transactions from Redux store.
    // These selectors will cause this component to re-render whenever
    // the underlying Redux state for bank accounts or all transactions changes.
    const bankAccounts = useSelector(selectAllBankAccounts);
    const allTransactionsFromRedux = useSelector(selectAllTransactions);
    const loadingAllTransactions = useSelector(selectTransactionsLoadingAll);
    const transactionsError = useSelector(selectTransactionsError);


    // Effect to initially fetch all transactions into Redux for the summary
    useEffect(() => {
        // Only dispatch if not already loading or there's an error
        if (!loadingAllTransactions && !transactionsError && allTransactionsFromRedux.length === 0) {
            dispatch(fetchAllTransactions());
        }
    }, [dispatch, loadingAllTransactions, transactionsError, allTransactionsFromRedux.length]);


    // Effect to calculate summary data whenever Redux accounts or ALL transactions change
    useEffect(() => {
        const calculateSummaryData = () => {
            setLoadingSummary(true); // Indicate summary calculation is in progress
            setError(null);
            try {
                // Calculate Total Bank Balance from Redux-managed bank accounts
                const currentTotalBalance = bankAccounts.reduce((sum, account) => {
                    const balance = parseFloat(account.current_balance);
                    if (isNaN(balance)) {
                        console.warn(`DashboardSummary: Invalid balance for account ${account.name}:`, account.current_balance);
                        return sum;
                    }
                    return sum + balance;
                }, 0);
                setTotalBalance(currentTotalBalance);

                // Calculate Total Credit, Total Debit, and Transaction Count from Redux-managed ALL transactions
                let creditSum = 0;
                let debitSum = 0;

                allTransactionsFromRedux.forEach(tx => {
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
                setTransactionCount(allTransactionsFromRedux.length);

            } catch (err) {
                console.error('DashboardSummary: Error during data calculation:', err);
                setError('Failed to calculate dashboard summary. Please check console for details.');
            } finally {
                setLoadingSummary(false); // Calculation complete
            }
        };

        // Only calculate if the data has been loaded and there are no errors
        if (!loadingAllTransactions && !transactionsError) {
          calculateSummaryData();
        }

    }, [bankAccounts, allTransactionsFromRedux, loadingAllTransactions, transactionsError]); // Dependencies: Re-run when Redux states change


    // Ensure values are numbers before toFixed and handle NaN for display
    const displayTotalBalance = isNaN(totalBalance) ? '0.00' : totalBalance.toFixed(2);
    const displayTotalCredit = isNaN(totalCredit) ? '0.00' : totalCredit.toFixed(2);
    const displayTotalDebit = isNaN(totalDebit) ? '0.00' : totalDebit.toFixed(2);

    if (loadingSummary || loadingAllTransactions) {
        return <div className="text-center py-4 text-blue-500">Loading overall summary...</div>;
    }

    if (error || transactionsError) {
        return <div className="text-red-500 text-center py-4">{error || transactionsError}</div>;
    }

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