// src/components/forms/TransactionEditForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../utils/axiosInstance';

import { selectSortedTransactionHeads } from '../../redux/features/staticData/staticDataSlice';
import {
  fetchBankAccounts,
  selectAllBankAccounts,
  selectAccountsLoading,
  selectAccountsError,
} from '../../redux/features/accounts/accountSlice';

const TRANSACTION_TYPES = [
  { value: 'DEBIT', label: 'Debit' },
  { value: 'CREDIT', label: 'Credit' },
];

const TRANSACTION_MODES = [
  { value: 'NEFT', label: 'NEFT' },
  { value: 'RTGS', label: 'RTGS' },
  { value: 'CHEQUE', label: 'CHEQUE' },
  { value: 'CASH', label: 'CASH' },
  { value: 'OTHER', label: 'OTHER' },
];

const TransactionEditForm = ({ transaction, onTransactionUpdated, onCancel }) => {
  const dispatch = useDispatch();

  const transactionHeads = useSelector(selectSortedTransactionHeads);
  const bankAccounts = useSelector(selectAllBankAccounts);
  const loadingAccounts = useSelector(selectAccountsLoading);
  const accountsError = useSelector(selectAccountsError);

  const [selectedAccount, setSelectedAccount] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [transactionHead, setTransactionHead] = useState('');
  const [transactionMode, setTransactionMode] = useState('');
  const [amount, setAmount] = useState('');
  const [chequeNo, setChequeNo] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [partyName, setPartyName] = useState('');
  const [isPp, setIsPp] = useState(false); // NEW STATE FOR is_pp

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (bankAccounts.length === 0 && !loadingAccounts && !accountsError) {
      dispatch(fetchBankAccounts());
    }
  }, [dispatch, bankAccounts.length, loadingAccounts, accountsError]);

  useEffect(() => {
    if (transaction) {
      setSelectedAccount(transaction.account || '');
      setTransactionType(transaction.transaction_type || 'DEBIT');
      setTransactionHead(transaction.transaction_head || (transactionHeads.length > 0 ? transactionHeads[0].value : ''));
      setTransactionMode(transaction.transaction_mode || 'CASH');
      setAmount(transaction.amount.toString() || '');
      setChequeNo(transaction.cheque_no || '');
      setTransactionDate(transaction.transaction_date || '');
      setDescription(transaction.description || '');
      setPartyName(transaction.party_name || '');
      setIsPp(transaction.is_pp || false); // NEW: Populate is_pp
    }
  }, [transaction, transactionHeads]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    setLoading(true);

    const accountId = parseInt(selectedAccount);
    if (isNaN(accountId) || !selectedAccount) {
      setFormError('Please select a valid bank account.');
      setLoading(false);
      return;
    }

    let finalAmount = parseFloat(amount);
    if (isNaN(finalAmount)) {
      setFormError('Please enter a valid amount.');
      setLoading(false);
      return;
    }
    finalAmount = parseFloat(finalAmount.toFixed(2));

    try {
      const payload = {
        account: accountId,
        transaction_type: transactionType,
        transaction_head: transactionHead,
        transaction_mode: transactionMode,
        amount: finalAmount,
        cheque_no: chequeNo || null,
        description: description,
        transaction_date: transactionDate,
        party_name: partyName || null,
        is_pp: isPp, // NEW: Include is_pp
      };

      const response = await axiosInstance.put(`transactions/${transaction.id}/`, payload);
      setSuccess('Transaction updated successfully!');
      setLoading(false);
      if (onTransactionUpdated) {
        setTimeout(() => onTransactionUpdated(response.data), 1000);
      }
      if (onCancel) {
        setTimeout(() => onCancel(), 1000);
      }

    } catch (err) {
      console.error('Error updating transaction:', err.response?.data || err.message);
      if (err.response?.data) {
        const errors = err.response.data;
        let errorMessage = 'Failed to update transaction: ';
        for (const key in errors) {
          if (Array.isArray(errors[key])) {
            errorMessage += `${key}: ${errors[key].join(', ')} `;
          } else {
            errorMessage += `${key}: ${errors[key]} `;
          }
        }
        setFormError(errorMessage.trim());
      } else {
        setFormError('Failed to update transaction. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Edit Transaction</h2>
      <form onSubmit={handleSubmit}>
        {/* Account Selection */}
        <div className="mb-4">
          <label htmlFor="bankAccount" className="block text-gray-700 text-sm font-bold mb-2">Bank Account</label>
          <select
            id="bankAccount"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(parseInt(e.target.value))}
            required
            disabled={loading || loadingAccounts}
          >
            <option value="">Select an Account</option>
            {loadingAccounts ? (
              <option disabled>Loading accounts...</option>
            ) : accountsError ? (
              <option disabled>Error loading accounts: {accountsError}</option>
            ) : bankAccounts.length === 0 ? (
              <option disabled>No accounts available.</option>
            ) : (
              bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.account_number})
                </option>
              ))
            )}
          </select>
          {bankAccounts.length === 0 && !loadingAccounts && (
            <p className="text-red-500 text-xs italic mt-2">No bank accounts available. Please create one.</p>
          )}
        </div>

        {/* Transaction Type */}
        <div className="mb-4">
          <label htmlFor="transactionType" className="block text-gray-700 text-sm font-bold mb-2">Transaction Type</label>
          <select
            id="transactionType"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            required
            disabled={loading}
          >
            {TRANSACTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Transaction Head */}
        <div className="mb-4">
          <label htmlFor="transactionHead" className="block text-gray-700 text-sm font-bold mb-2">Transaction Head</label>
          <select
            id="transactionHead"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={transactionHead}
            onChange={(e) => setTransactionHead(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">Select a Head</option>
            {transactionHeads.map((head) => (
              <option key={head.value} value={head.value}>{head.label}</option>
            ))}
          </select>
        </div>

        {/* Transaction Mode */}
        <div className="mb-4">
          <label htmlFor="transactionMode" className="block text-gray-700 text-sm font-bold mb-2">Transaction Mode</label>
          <select
            id="transactionMode"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={transactionMode}
            onChange={(e) => setTransactionMode(e.target.value)}
            required
            disabled={loading}
          >
            {TRANSACTION_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div className="mb-4">
          <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">Amount</label>
          <input
            type="number"
            id="amount"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., 500.00"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Cheque No. */}
        <div className="mb-4">
          <label htmlFor="chequeNo" className="block text-gray-700 text-sm font-bold mb-2">Cheque No. (Optional)</label>
          <input
            type="text"
            id="chequeNo"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., 000123"
            value={chequeNo}
            onChange={(e) => setChequeNo(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Party Name */}
        <div className="mb-4">
          <label htmlFor="partyName" className="block text-gray-700 text-sm font-bold mb-2">Party Name (Optional)</label>
          <input
            type="text"
            id="partyName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., Vendor XYZ, John Doe"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* is_pp Checkbox (conditionally rendered for CHEQUE mode) */}
        {transactionMode === 'CHEQUE' && (
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="isPp"
              name="isPp"
              checked={isPp}
              onChange={(e) => setIsPp(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={loading}
            />
            <label htmlFor="isPp" className="block text-gray-700 text-sm font-bold">
              Is Post-Dated/Present-Dated Cheque?
            </label>
          </div>
        )}

        {/* Transaction Date */}
        <div className="mb-4">
          <label htmlFor="transactionDate" className="block text-gray-700 text-sm font-bold mb-2">Transaction Date</label>
          <input
            type="date"
            id="transactionDate"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description (Optional)</label>
          <textarea
            id="description"
            rows="3"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Details about this transaction"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          ></textarea>
        </div>

        {formError && (
          <p className="text-red-500 text-xs italic mb-4 text-center">{formError}</p>
        )}
        {success && (
          <p className="text-green-500 text-xs italic mb-4 text-center">{success}</p>
        )}

        <div className="flex items-center justify-end gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionEditForm;