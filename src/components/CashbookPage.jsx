// src/components/CashbookPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../utils/axiosInstance';
import {
  fetchBankAccounts,
  selectAllBankAccounts,
  selectAccountsLoading,
  selectAccountsError,
} from '../redux/features/accounts/accountSlice';

const CashbookPage = () => {
  const dispatch = useDispatch();
  const bankAccounts = useSelector(selectAllBankAccounts);
  const loadingAccounts = useSelector(selectAccountsLoading);
  const accountsError = useSelector(selectAccountsError);

  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cashbookTransactions, setCashbookTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState(null);
  const [currentAccountBalance, setCurrentAccountBalance] = useState(0);

  // Helper function to format date as DD-MM-YYYY
  const formatIndianDate = (dateString) => {
    if (!dateString) return '';
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

  // Fetch bank accounts on initial load
  useEffect(() => {
    if (bankAccounts.length === 0 && !loadingAccounts && !accountsError) {
      dispatch(fetchBankAccounts());
    }
  }, [dispatch, bankAccounts.length, loadingAccounts, accountsError]);

  // Set default selected account once accounts are loaded
  useEffect(() => {
    if (bankAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(bankAccounts[0].id);
    }
  }, [bankAccounts, selectedAccountId]);

  // Update current account balance when selectedAccountId changes
  useEffect(() => {
    const account = bankAccounts.find(acc => acc.id === selectedAccountId);
    if (account) {
      setCurrentAccountBalance(parseFloat(account.current_balance || 0));
    } else {
      setCurrentAccountBalance(0);
    }
  }, [selectedAccountId, bankAccounts]);


  const handleGenerateCashbook = useCallback(async (e) => {
    e.preventDefault(); // Prevent form submission default behavior
    setLoadingTransactions(true);
    setTransactionsError(null);
    setCashbookTransactions([]); // Clear previous results

    if (!selectedAccountId || !startDate || !endDate) {
      setTransactionsError('Please select a bank account, start date, and end date to generate the cashbook.');
      setLoadingTransactions(false);
      return;
    }

    try {
      const response = await axiosInstance.get('transactions/', {
        params: {
          account: selectedAccountId, // Pass the selected account ID to the backend
          transaction_date__gte: startDate,
          transaction_date__lte: endDate,
          ordering: 'transaction_date' // Order by date for cashbook
        },
      });
      setCashbookTransactions(response.data);
    } catch (err) {
      console.error('Error fetching cashbook transactions:', err.response?.data || err.message);
      setTransactionsError(err.response?.data?.error || 'Failed to load cashbook transactions. Please try again.');
    } finally {
      setLoadingTransactions(false);
    }
  }, [selectedAccountId, startDate, endDate]);

  // Filter transactions into credit and debit for display
  const creditTransactions = cashbookTransactions.filter(tx => tx.transaction_type === 'CREDIT');
  const debitTransactions = cashbookTransactions.filter(tx => tx.transaction_type === 'DEBIT');

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">Cashbook</h1>

      {/* Account and Date Range Selection */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Generate Cashbook for Period</h2>
        <form onSubmit={handleGenerateCashbook} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="selectAccount" className="block text-gray-700 text-sm font-bold mb-2">Bank Account</label>
            <select
              id="selectAccount"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(parseInt(e.target.value))}
              disabled={loadingAccounts || loadingTransactions}
              required
            >
              <option value="">Select an Account</option>
              {loadingAccounts ? (
                <option disabled>Loading accounts...</option>
              ) : accountsError ? (
                <option disabled>Error: {accountsError}</option>
              ) : bankAccounts.length === 0 ? (
                <option disabled>No accounts available</option>
              ) : (
                bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.account_number})
                  </option>
                ))
              )}
            </select>
            {bankAccounts.length === 0 && !loadingAccounts && (
              <p className="text-red-500 text-xs italic mt-2">Please create a bank account first.</p>
            )}
          </div>
          <div>
            <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
            <input
              type="date"
              id="startDate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={loadingTransactions}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
            <input
              type="date"
              id="endDate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              disabled={loadingTransactions}
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              disabled={loadingTransactions || bankAccounts.length === 0 || !selectedAccountId || !startDate || !endDate}
            >
              {loadingTransactions ? 'Generating...' : 'Generate Cashbook'}
            </button>
          </div>
        </form>
        <p className="text-gray-600 mt-4 text-lg">
            Current Balance for selected account: <span className="font-bold text-blue-600">{formatCurrency(currentAccountBalance)}</span>
        </p>
      </div>


      {/* Cashbook Transactions List - Two Panels */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Transactions for Selected Period</h2>

        {transactionsError && (
          <p className="text-red-500 text-center py-4">{transactionsError}</p>
        )}

        {loadingTransactions ? (
          <p className="text-center py-4">Loading transactions...</p>
        ) : cashbookTransactions.length === 0 && selectedAccountId && startDate && endDate ? (
          <p className="text-gray-600">No transactions found for the selected account and period. Try a different date range or account.</p>
        ) : cashbookTransactions.length === 0 && (!selectedAccountId || !startDate || !endDate) ? (
          <p className="text-gray-600">Please select an account and date range above and click 'Generate Cashbook' to view transactions.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Panel: Credits (Income) */}
            <div>
              <h3 className="text-xl font-semibold text-green-700 mb-3">Credits (Income)</h3>
              <div className="overflow-x-auto border rounded-lg">
                <div className="max-h-96 overflow-y-auto"> {/* Vertical scrolling for this table */}
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {creditTransactions.length > 0 ? (
                        creditTransactions.map((tx) => (
                          <tr key={tx.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatIndianDate(tx.transaction_date)}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">{tx.description || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{formatCurrency(tx.amount)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No credit transactions found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Panel: Debits (Expenses) */}
            <div>
              <h3 className="text-xl font-semibold text-red-700 mb-3">Debits (Expenses)</h3>
              <div className="overflow-x-auto border rounded-lg">
                <div className="max-h-96 overflow-y-auto"> {/* Vertical scrolling for this table */}
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-red-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {debitTransactions.length > 0 ? (
                        debitTransactions.map((tx) => (
                          <tr key={tx.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatIndianDate(tx.transaction_date)}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">{tx.description || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">{formatCurrency(tx.amount)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No debit transactions found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashbookPage;