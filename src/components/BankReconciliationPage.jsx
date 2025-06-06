// src/pages/BankReconciliationPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../utils/axiosInstance';
import {
  fetchBankAccounts,
  selectAllBankAccounts,
  selectAccountsLoading,
  selectAccountsError,
} from '../redux/features/accounts/accountSlice';

const BankReconciliationPage = () => {
  const dispatch = useDispatch();
  const bankAccounts = useSelector(selectAllBankAccounts);
  const loadingAccounts = useSelector(selectAccountsLoading);
  const accountsError = useSelector(selectAccountsError);

  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bankStatementBalance, setBankStatementBalance] = useState('');
  const [unreconciledTransactions, setUnreconciledTransactions] = useState([]);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState([]);

  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState(null);
  const [reconciliationMessage, setReconciliationMessage] = useState(null);

  const formatIndianDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('en-GB').format(date).replace(/\//g, '-');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  useEffect(() => {
    if (bankAccounts.length === 0 && !loadingAccounts && !accountsError) {
      dispatch(fetchBankAccounts());
    }
  }, [dispatch, bankAccounts.length, loadingAccounts, accountsError]);

  useEffect(() => {
    if (bankAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(bankAccounts[0].id);
    }
  }, [bankAccounts, selectedAccountId]);

  const fetchUnreconciledTransactions = useCallback(async () => {
    if (!selectedAccountId || !startDate || !endDate) {
      setUnreconciledTransactions([]);
      setSelectedTransactionIds([]);
      setLoadingTransactions(false);
      setTransactionsError(null);
      return;
    }

    setLoadingTransactions(true);
    setTransactionsError(null);
    setUnreconciledTransactions([]);
    setSelectedTransactionIds([]);

    try {
      const response = await axiosInstance.get('transactions/', {
        params: {
          account: selectedAccountId,
          transaction_date__gte: startDate,
          transaction_date__lte: endDate,
          is_reconciled: false,
        },
      });
      setUnreconciledTransactions(response.data);
    } catch (err) {
      console.error('Error fetching unreconciled transactions:', err.response?.data || err.message);
      setTransactionsError('Failed to load unreconciled transactions. Please try again.');
    } finally {
      setLoadingTransactions(false);
    }
  }, [selectedAccountId, startDate, endDate]);

  useEffect(() => {
    fetchUnreconciledTransactions();
  }, [fetchUnreconciledTransactions]);

  const handleCheckboxChange = (transactionId) => {
    setSelectedTransactionIds((prevSelected) =>
      prevSelected.includes(transactionId)
        ? prevSelected.filter((id) => id !== transactionId)
        : [...prevSelected, transactionId]
    );
  };

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      const allIds = unreconciledTransactions.map(tx => tx.id);
      setSelectedTransactionIds(allIds);
    } else {
      setSelectedTransactionIds([]);
    }
  };

  const handleReconcileSelected = async () => {
    if (selectedTransactionIds.length === 0) {
      // Replace with a custom modal for production
      alert('Please select at least one transaction to reconcile.');
      return;
    }

    setLoadingTransactions(true);
    setReconciliationMessage(null);

    try {
      const response = await axiosInstance.post('transactions/bulk-reconcile/', {
        transaction_ids: selectedTransactionIds,
      });
      setReconciliationMessage({ type: 'success', text: response.data.message });
      fetchUnreconciledTransactions();
    } catch (err) {
      console.error('Error during reconciliation:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to reconcile transactions.';
      setReconciliationMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoadingTransactions(false);
    }
  };

  const selectedAccount = bankAccounts.find(acc => acc.id === selectedAccountId);
  const bookBalance = selectedAccount ? parseFloat(selectedAccount.current_balance) : 0;
  const bankBalance = parseFloat(bankStatementBalance) || 0;

  const totalSelectedCredit = unreconciledTransactions
    .filter(tx => selectedTransactionIds.includes(tx.id) && tx.transaction_type === 'CREDIT')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const totalSelectedDebit = unreconciledTransactions
    .filter(tx => selectedTransactionIds.includes(tx.id) && tx.transaction_type === 'DEBIT')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const difference = bookBalance - bankBalance;


  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">Bank Reconciliation</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Select Account and Period</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="selectAccount" className="block text-gray-700 text-sm font-bold mb-2">Bank Account</label>
            <select
              id="selectAccount"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(parseInt(e.target.value))}
              disabled={loadingAccounts}
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
            />
          </div>
        </div>
        <div className="mt-4">
            <label htmlFor="bankStatementBalance" className="block text-gray-700 text-sm font-bold mb-2">Bank Statement Balance</label>
            <input
              type="number"
              id="bankStatementBalance"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={bankStatementBalance}
              onChange={(e) => setBankStatementBalance(e.target.value)}
              placeholder="Enter balance from bank statement"
              step="0.01"
            />
          </div>
      </div>

      {/* Reconciliation Summary */}
      {selectedAccountId && startDate && endDate && (
        <div className="bg-blue-100 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Reconciliation Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="text-blue-800 text-lg">Book Balance: <span className="font-semibold">{formatCurrency(bookBalance)}</span></p>
            <p className="text-blue-800 text-lg">Bank Statement Balance: <span className="font-semibold">{formatCurrency(bankBalance)}</span></p>
            <p className={`text-lg font-bold ${difference === 0 ? 'text-green-700' : 'text-red-700'}`}>
              Difference: {formatCurrency(difference)}
            </p>
            <p className="text-blue-800 text-lg">Selected Credits: <span className="font-semibold">{formatCurrency(totalSelectedCredit)}</span></p>
            <p className="text-blue-800 text-lg">Selected Debits: <span className="font-semibold">{formatCurrency(totalSelectedDebit)}</span></p>
          </div>
        </div>
      )}


      {/* Unreconciled Transactions List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Unreconciled Transactions</h2>

        {reconciliationMessage && (
          <div className={`p-3 mb-4 rounded-md ${reconciliationMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {reconciliationMessage.text}
          </div>
        )}

        {loadingTransactions ? (
          <p className="text-center py-4">Loading unreconciled transactions...</p>
        ) : transactionsError ? (
          <p className="text-red-500 text-center py-4">{transactionsError}</p>
        ) : unreconciledTransactions.length === 0 ? (
          <p className="text-gray-600">No unreconciled transactions found for the selected period and account.</p>
        ) : (
          <>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="selectAll"
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                onChange={handleSelectAllChange}
                checked={selectedTransactionIds.length === unreconciledTransactions.length && unreconciledTransactions.length > 0}
              />
              <label htmlFor="selectAll" className="text-gray-700 font-bold">Select All</label>
              <button
                onClick={handleReconcileSelected}
                className="ml-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                disabled={selectedTransactionIds.length === 0 || loadingTransactions}
              >
                {loadingTransactions ? 'Reconciling...' : `Reconcile Selected (${selectedTransactionIds.length})`}
              </button>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reconciled ?</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cheque No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P/P</th> {/* NEW COLUMN */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unreconciledTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedTransactionIds.includes(tx.id)}
                          onChange={() => handleCheckboxChange(tx.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatIndianDate(tx.transaction_date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{tx.transaction_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.transaction_head}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.party_name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(tx.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.cheque_no || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.is_pp ? 'Yes' : 'No'}</td> {/* NEW DATA CELL */}
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">{tx.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BankReconciliationPage;