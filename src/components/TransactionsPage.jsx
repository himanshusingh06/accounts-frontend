// src/pages/TransactionsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import axiosInstance from '../utils/axiosInstance';
import TransactionForm from '../components/forms/TransactionForm';
import TransactionEditForm from '../components/forms/TransactionEditForm';
import {
  fetchBankAccounts,
  selectAllBankAccounts, // Import selector for all bank accounts
  selectAccountsLoading, // Import selector for accounts loading state
  selectAccountsError,   // Import selector for accounts error state
} from '../redux/features/accounts/accountSlice';

import { selectCurrentUser } from '../redux/features/auth/authSlice';

const TransactionsPage = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation(); // Hook to get the current URL location
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Get bank accounts from Redux store for the filter dropdown
  const bankAccounts = useSelector(selectAllBankAccounts);
  const loadingAccounts = useSelector(selectAccountsLoading);
  const accountsError = useSelector(selectAccountsError);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // State for filters within this page
  // Initialize filterAccountId from URL param if present on first render
  const initialUrlAccountId = new URLSearchParams(location.search).get('account_id');
  const [filterAccountId, setFilterAccountId] = useState(initialUrlAccountId || '');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');


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

  // Function to fetch transactions based on current filters and URL params
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};

      // Determine the effective account ID for filtering
      let currentEffectiveAccountId = filterAccountId;
      const urlAccountId = new URLSearchParams(location.search).get('account_id');

      if (!filterAccountId && urlAccountId) { // If dropdown is not set but URL has it
          currentEffectiveAccountId = urlAccountId;
      }
      // If filterAccountId is explicitly set (even to ""), it takes precedence over URL.
      // For example, if user navigates to /transactions?account_id=4 and then selects "-- All Accounts --"
      // in the dropdown, filterAccountId becomes "", overriding urlAccountId.


      if (currentEffectiveAccountId) {
        params.account = currentEffectiveAccountId; // Use 'account' for backend filtering
      }
      if (filterStartDate) {
        params.transaction_date__gte = filterStartDate;
      }
      if (filterEndDate) {
        params.transaction_date__lte = filterEndDate;
      }

      // IMPROVED DEBUG LOG: Stringify for clear output
      console.log("Fetching transactions with params:", JSON.stringify(params, null, 2));

      const response = await axiosInstance.get('transactions/', { params });
      setTransactions(response.data);
      console.log("Transactions fetched:", response.data); // DEBUG: Log fetched data
    } catch (err) {
      console.error('Error fetching transactions:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [location.search, filterAccountId, filterStartDate, filterEndDate]); // Dependencies for fetchTransactions

  // Effect to fetch transactions on initial load and when filter dependencies change
  useEffect(() => {
    fetchTransactions();
    // Fetch bank accounts into Redux when this page loads, needed for filter dropdown
    dispatch(fetchBankAccounts());
  }, [fetchTransactions, dispatch]);

  // Effect to update filterAccountId state when URL param changes
  // This ensures the dropdown correctly reflects the URL filter on initial load
  useEffect(() => {
    const urlAccountId = new URLSearchParams(location.search).get('account_id');
    // Only update if URL param is different from current filterAccountId state
    // and if filterAccountId isn't already explicitly set by user interaction
    if (urlAccountId && urlAccountId !== filterAccountId) {
      setFilterAccountId(urlAccountId);
    } else if (!urlAccountId && filterAccountId) {
      // If URL param is removed, and filterAccountId is set, clear it unless it's explicitly cleared by user
      // This helps in scenarios where user clears URL param manually
      // but only if filterAccountId wasn't already cleared by "Clear Filters" button
      if (filterAccountId !== '') { // Check if it's not already empty
         setFilterAccountId('');
      }
    }
  }, [location.search]); // Depend on location.search to react to URL changes

  const handleTransactionSaved = (newOrUpdatedTransaction) => {
    fetchTransactions(); // Refresh the transaction list in this component
    setShowAddForm(false);
    setEditingTransaction(null);
    // Crucially: Dispatch fetchBankAccounts to refresh balances on Dashboard
    dispatch(fetchBankAccounts());
  };

  const handleDeleteClick = (transactionId) => {
    setDeleteConfirmation(transactionId);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation === null) return;

    setLoading(true);
    setError(null);
    try {
      await axiosInstance.delete(`transactions/${deleteConfirmation}/`);
      setTransactions(transactions.filter(tx => tx.id !== deleteConfirmation));
      setDeleteConfirmation(null);
      // Crucially: Dispatch fetchBankAccounts to refresh balances on Dashboard after delete
      dispatch(fetchBankAccounts());
    } catch (err) {
      console.error('Error deleting transaction:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Failed to delete transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const isAdmin = currentUser && (currentUser.is_staff || currentUser.is_superuser);

  // Function to apply filters (called by form submission)
  const applyFilters = (e) => {
    if (e) e.preventDefault(); // Prevent default form submission if called from form
    console.log("Apply Filters button clicked. Triggering fetchTransactions."); // DEBUG
    fetchTransactions(); // Re-fetch based on current filter states
  };

  // Function to clear filters
  const clearFilters = () => {
    setFilterAccountId('');
    setFilterStartDate('');
    setFilterEndDate('');

    // If there's an account_id in the URL, remove it via navigation
    const currentQueryParams = new URLSearchParams(location.search);
    if (currentQueryParams.has('account_id')) {
        navigate('/transactions', { replace: true }); // Replace current URL history
    } else {
        // If no URL filter, just re-fetch with cleared local filters
        fetchTransactions();
    }
  };


  if (loading && transactions.length === 0 && !error) { // Only show full loading if no data initially
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  if (error && transactions.length === 0) { // Only show full error if no data to display
    return (
      <div className="text-red-600 p-4 bg-red-100 rounded-md">
        {error}
      </div>
    );
  }

  // Determine dynamic title based on URL or filter state
  const queryParams = new URLSearchParams(location.search);
  const urlAccountId = queryParams.get('account_id');
  const selectedAccountName = bankAccounts.find(acc => acc.id === parseInt(filterAccountId))?.name;

  let pageTitle = 'All Transactions';
  // Logic for page title
  // Priority: Specific account from URL AND dates -> Specific account from dropdown AND dates -> Specific account from URL -> Specific account from dropdown -> Only dates -> All transactions
  if (urlAccountId && !filterAccountId) { // If only URL account filter is active
    pageTitle = `Transactions for Account ID: ${urlAccountId}`;
    if (bankAccounts.length > 0) {
      const account = bankAccounts.find(acc => acc.id === parseInt(urlAccountId));
      if (account) {
        pageTitle = `Transactions for ${account.name} (${account.account_number})`;
      }
    }
  }

  if (filterAccountId) { // If filterAccountId is selected in dropdown (takes precedence over URL param)
      const account = bankAccounts.find(acc => acc.id === parseInt(filterAccountId));
      if (account) {
          pageTitle = `Transactions for ${account.name} (${account.account_number})`;
      }
  }

  if (filterStartDate && filterEndDate) {
    pageTitle += ` from ${formatIndianDate(filterStartDate)} to ${formatIndianDate(filterEndDate)}`;
  } else if (filterStartDate) {
      pageTitle += ` from ${formatIndianDate(filterStartDate)}`;
  } else if (filterEndDate) {
      pageTitle += ` up to ${formatIndianDate(filterEndDate)}`;
  }

  // Final fallback if no filters applied
  if (!filterAccountId && !filterStartDate && !filterEndDate && !urlAccountId) {
      pageTitle = 'All Transactions';
  }


  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">{pageTitle}</h1>

      {/* Section to add/edit transactions */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-700">Manage Transactions</h2>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingTransaction(null);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            {showAddForm ? 'Hide Form' : 'Add New Transaction'}
          </button>
        </div>
        {showAddForm && (
          <TransactionForm
            onSaveSuccess={handleTransactionSaved}
            onCancel={() => setShowAddForm(false)}
          />
        )}
        {editingTransaction && (
          <TransactionEditForm
            transaction={editingTransaction}
            onTransactionUpdated={handleTransactionSaved}
            onCancel={() => setEditingTransaction(null)}
          />
        )}
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Filter Transactions</h2>
        <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="filterAccount" className="block text-gray-700 text-sm font-bold mb-2">Select Account</label>
            <select
              id="filterAccount"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={filterAccountId}
              onChange={(e) => setFilterAccountId(e.target.value)}
              disabled={loadingAccounts || loading}
            >
              <option value="">-- All Accounts --</option>
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
          </div>
          <div>
            <label htmlFor="filterStartDate" className="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
            <input
              type="date"
              id="filterStartDate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="filterEndDate" className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
            <input
              type="date"
              id="filterEndDate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              disabled={loading}
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={clearFilters} // Use the new clearFilters function
              className="ml-3 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              disabled={loading}
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>


      {/* Display of transactions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Transaction Details</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-600">
            {filterAccountId || filterStartDate || filterEndDate || urlAccountId // Check if any filter is active
              ? 'No transactions found matching the selected filters.'
              : 'No transactions found.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="max-h-96 overflow-y-auto"> {/* Vertical scroll for table */}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cheque No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P/P</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatIndianDate(tx.transaction_date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.account_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{tx.transaction_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.transaction_head}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.party_name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(tx.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.transaction_mode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.cheque_no || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.is_pp ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">{tx.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.created_by_username || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setEditingTransaction(tx)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        {/* Conditional rendering for Delete button */}
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteClick(tx.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this transaction? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;