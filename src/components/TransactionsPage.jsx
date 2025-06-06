// src/pages/TransactionsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../utils/axiosInstance';
import TransactionForm from '../components/forms/TransactionForm';
import TransactionEditForm from '../components/forms/TransactionEditForm';
import { fetchBankAccounts } from '../redux/features/accounts/accountSlice';

import { selectCurrentUser } from '../redux/features/auth/authSlice'; // Import selectCurrentUser

const TransactionsPage = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser); // Get the current user from Redux state

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

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

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('transactions/');
      setTransactions(response.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    dispatch(fetchBankAccounts());
  }, [fetchTransactions, dispatch]);

  const handleTransactionSaved = (newOrUpdatedTransaction) => {
    fetchTransactions();
    setShowAddForm(false);
    setEditingTransaction(null);
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
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  // Determine if the current user is an admin
  const isAdmin = currentUser && (currentUser.is_staff || currentUser.is_superuser);

  // --- DEBUGGING LOGS ---
  useEffect(() => {
    console.log("TransactionsPage: currentUser:", currentUser);
    console.log("TransactionsPage: currentUser.is_staff:", currentUser?.is_staff);
    console.log("TransactionsPage: currentUser.is_superuser:", currentUser?.is_superuser);
    console.log("TransactionsPage: isAdmin calculated as:", isAdmin);
  }, [currentUser, isAdmin]);
  // --- END DEBUGGING LOGS ---


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-100 rounded-md">
        {error}
      </div>
    );
  }


  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">Transactions</h1>

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

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">All Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-600">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="max-h-96 overflow-y-auto">
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