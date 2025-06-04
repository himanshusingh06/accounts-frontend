// src/components/CashbookPage.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Import useDispatch and useSelector
import axiosInstance from '../utils/axiosInstance';

// Import selectors and the fetch action from your new account slice
import {
  fetchBankAccounts,
  selectAllBankAccounts,
  selectAccountsLoading,
  selectAccountsError,
} from '../redux/features/accounts/accountSlice'; // NEW IMPORTS

const CashbookPage = () => {
  const dispatch = useDispatch();

  // Get data from Redux store
  const bankAccounts = useSelector(selectAllBankAccounts);
  const loadingAccounts = useSelector(selectAccountsLoading);
  const accountsError = useSelector(selectAccountsError);

  const [selectedAccountId, setSelectedAccountId] = useState(''); // State for selected account in dropdown
  const [selectedAccountBalance, setSelectedAccountBalance] = useState(0); // State for the balance of the selected account
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [debitTransactions, setDebitTransactions] = useState([]);

  const [loadingTransactions, setLoadingTransactions] = useState(false); // Loading state for transactions per account
  const [transactionsError, setTransactionsError] = useState(null); // Error for transactions fetch

  // Helper function to format date as DD-MM-YYYY
  const formatIndianDate = (dateString) => {
    if (!dateString) {
      return '';
    }
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('en-GB').format(date).replace(/\//g, '-');
  };

  // Helper function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // 1. Effect to fetch all bank accounts on initial load (now from Redux)
  useEffect(() => {
    if (bankAccounts.length === 0 && !loadingAccounts && !accountsError) {
      dispatch(fetchBankAccounts());
    }
  }, [dispatch, bankAccounts.length, loadingAccounts, accountsError]);

  // 2. Effect to set initial selected account and fetch transactions
  useEffect(() => {
    // Set default selected account once accounts are loaded
    if (bankAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(bankAccounts[0].id);
    }
  }, [bankAccounts, selectedAccountId]); // Add selectedAccountId to dependencies

  // 3. Effect to fetch transactions and update balance for the selected account
  useEffect(() => {
    const fetchTransactionsForAccount = async () => {
      if (!selectedAccountId) {
        setCreditTransactions([]);
        setDebitTransactions([]);
        setSelectedAccountBalance(0);
        setLoadingTransactions(false);
        return;
      }

      setLoadingTransactions(true);
      setTransactionsError(null);

      try {
        const transactionsResponse = await axiosInstance.get(
          `transactions/?account=${selectedAccountId}`
        );

        const accountDetailsResponse = await axiosInstance.get(
          `bank-accounts/${selectedAccountId}/`
        );
        setSelectedAccountBalance(accountDetailsResponse.data.current_balance);

        const credits = transactionsResponse.data.filter(
          (t) => t.transaction_type === 'CREDIT'
        );
        const debits = transactionsResponse.data.filter(
          (t) => t.transaction_type === 'DEBIT'
        );
        setCreditTransactions(credits);
        setDebitTransactions(debits);

      } catch (err) {
        console.error('Error fetching transactions for account:', err.response?.data || err.message);
        setTransactionsError('Failed to load transactions for the selected account.');
        setCreditTransactions([]);
        setDebitTransactions([]);
        setSelectedAccountBalance(0);
      } finally {
        setLoadingTransactions(false);
      }
    };

    // Only fetch if accounts are loaded and an account is selected
    if (bankAccounts.length > 0 && selectedAccountId) {
        fetchTransactionsForAccount();
    }
  }, [selectedAccountId, bankAccounts]); // Re-run when selectedAccountId or bankAccounts change

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">Cashbook</h1>

      {/* Account Selection Dropdown */}
      <div className="mb-6">
        <label htmlFor="accountSelect" className="block text-gray-700 text-sm font-bold mb-2">Select Bank Account</label>
        {loadingAccounts ? (
          <p className="text-gray-500">Loading accounts...</p>
        ) : accountsError ? (
          <p className="text-red-500">{accountsError}</p>
        ) : bankAccounts.length === 0 ? (
          <p className="text-gray-500">No bank accounts available. Please create one.</p>
        ) : (
          <select
            id="accountSelect"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(parseInt(e.target.value))}
          >
            {bankAccounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.account_number})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Display Current Balance */}
      <div className="bg-blue-100 p-4 rounded-lg shadow-md mb-6">
        <p className="text-blue-800 text-lg font-semibold">
          Current Balance: {formatCurrency(selectedAccountBalance)}
        </p>
      </div>

      {/* Transaction Lists */}
      {loadingTransactions ? (
        <p className="text-center py-4">Loading transactions for selected account...</p>
      ) : transactionsError ? (
        <p className="text-red-500 text-center py-4">{transactionsError}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Credit Transactions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-green-700 mb-4">Credit Transactions</h2>
            {creditTransactions.length === 0 ? (
              <p className="text-gray-500">No credit transactions for this account.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {creditTransactions.map(tx => (
                      <tr key={tx.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatIndianDate(tx.transaction_date)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatCurrency(tx.amount)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{tx.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Debit Transactions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-red-700 mb-4">Debit Transactions</h2>
            {debitTransactions.length === 0 ? (
              <p className="text-gray-500">No debit transactions for this account.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {debitTransactions.map(tx => (
                      <tr key={tx.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatIndianDate(tx.transaction_date)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{formatCurrency(tx.amount)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{tx.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CashbookPage;