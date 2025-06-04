// src/components/forms/TransactionForm.jsx
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

const TransactionForm = ({ transactionToEdit, onSaveSuccess, onCancel }) => {
  const dispatch = useDispatch();

  const transactionHeads = useSelector(selectSortedTransactionHeads);
  const bankAccounts = useSelector(selectAllBankAccounts);
  const loadingAccounts = useSelector(selectAccountsLoading);
  const accountsError = useSelector(selectAccountsError);

  const [formData, setFormData] = useState({
    account: '',
    transaction_type: 'DEBIT',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    transaction_head: '',
    party_name: '',
    transaction_mode: 'CASH',
    cheque_no: '',
    description: '',
    is_pp: false, // NEW STATE FOR is_pp
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (bankAccounts.length === 0 && !loadingAccounts && !accountsError) {
      dispatch(fetchBankAccounts());
    }
  }, [dispatch, bankAccounts.length, loadingAccounts, accountsError]);

  useEffect(() => {
    if (transactionToEdit) {
      setFormData({
        account: transactionToEdit.account || '',
        transaction_type: transactionToEdit.transaction_type || 'DEBIT',
        amount: transactionToEdit.amount.toString() || '',
        transaction_date: transactionToEdit.transaction_date || new Date().toISOString().split('T')[0],
        transaction_head: transactionToEdit.transaction_head || (transactionHeads.length > 0 ? transactionHeads[0].value : ''),
        party_name: transactionToEdit.party_name || '',
        transaction_mode: transactionToEdit.transaction_mode || 'CASH',
        cheque_no: transactionToEdit.cheque_no || '',
        description: transactionToEdit.description || '',
        is_pp: transactionToEdit.is_pp || false, // NEW: Populate is_pp
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        transaction_head: transactionHeads.length > 0 ? transactionHeads[0].value : '',
        account: bankAccounts.length > 0 ? bankAccounts[0].id : '',
      }));
    }
  }, [transactionToEdit, transactionHeads, bankAccounts]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value, // Handle checkbox checked state
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);
    setLoading(true);

    if (!formData.account) {
      setFormError('Please select a bank account.');
      setLoading(false);
      return;
    }

    let finalAmount = parseFloat(formData.amount);
    if (isNaN(finalAmount)) {
      setFormError('Please enter a valid amount.');
      setLoading(false);
      return;
    }
    finalAmount = parseFloat(finalAmount.toFixed(2));

    try {
      const payload = {
        ...formData,
        amount: finalAmount,
        account: parseInt(formData.account),
        cheque_no: formData.cheque_no || null,
        party_name: formData.party_name || null,
        is_pp: formData.is_pp, // NEW: Include is_pp
      };

      let response;
      if (transactionToEdit) {
        response = await axiosInstance.put(`transactions/${transactionToEdit.id}/`, payload);
        setSuccess('Transaction updated successfully!');
      } else {
        response = await axiosInstance.post('transactions/', payload);
        setSuccess('Transaction created successfully!');
        setFormData((prev) => ({
          ...prev,
          amount: '',
          cheque_no: '',
          description: '',
          party_name: '',
          transaction_date: new Date().toISOString().split('T')[0],
          is_pp: false, // NEW: Reset is_pp
        }));
      }

      if (onSaveSuccess) {
        onSaveSuccess(response.data);
      }
      if (onCancel && !transactionToEdit) {
        setTimeout(() => onCancel(), 1500);
      }

    } catch (err) {
      console.error('Error saving transaction:', err.response?.data || err.message);
      if (err.response?.data) {
        const errors = err.response.data;
        let errorMessage = 'Failed to save transaction: ';
        for (const key in errors) {
          if (Array.isArray(errors[key])) {
            errorMessage += `${key}: ${errors[key].join(', ')} `;
          } else {
            errorMessage += `${key}: ${errors[key]} `;
          }
        }
        setFormError(errorMessage.trim());
      } else {
        setFormError('Failed to save transaction. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">
        {transactionToEdit ? 'Edit Transaction' : 'Add New Transaction'}
      </h2>

      {formError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{formError}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account Selection */}
        <div>
          <label htmlFor="account" className="block text-gray-700 text-sm font-bold mb-2">
            Bank Account <span className="text-red-500">*</span>
          </label>
          <select
            id="account"
            name="account"
            value={formData.account}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={loading || loadingAccounts}
          >
            <option value="">Select an Account</option>
            {loadingAccounts ? (
              <option disabled>Loading accounts...</option>
            ) : accountsError ? (
              <option disabled>Error loading accounts: {accountsError}</option>
            ) : bankAccounts.length === 0 ? (
              <option disabled>No accounts available. Please create one.</option>
            ) : (
              bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.account_number})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Transaction Type */}
        <div>
          <label htmlFor="transaction_type" className="block text-gray-700 text-sm font-bold mb-2">
            Transaction Type <span className="text-red-500">*</span>
          </label>
          <select
            id="transaction_type"
            name="transaction_type"
            value={formData.transaction_type}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={loading}
          >
            {TRANSACTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            step="0.01"
            min="0"
            placeholder="e.g., 5000.00"
            required
            disabled={loading}
          />
        </div>

        {/* Transaction Date */}
        <div>
          <label htmlFor="transaction_date" className="block text-gray-700 text-sm font-bold mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="transaction_date"
            name="transaction_date"
            value={formData.transaction_date}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={loading}
          />
        </div>

        {/* Transaction Head */}
        <div>
          <label htmlFor="transaction_head" className="block text-gray-700 text-sm font-bold mb-2">
            Transaction Head <span className="text-red-500">*</span>
          </label>
          <select
            id="transaction_head"
            name="transaction_head"
            value={formData.transaction_head}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={loading}
          >
            <option value="">Select a Head</option>
            {transactionHeads.map((head) => (
              <option key={head.value} value={head.value}>{head.label}</option>
            ))}
          </select>
        </div>

        {/* Party Name */}
        <div>
          <label htmlFor="party_name" className="block text-gray-700 text-sm font-bold mb-2">
            Party Name (Optional)
          </label>
          <input
            type="text"
            id="party_name"
            name="party_name"
            value={formData.party_name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., Supplier A / Student B"
            disabled={loading}
          />
        </div>

        {/* Transaction Mode */}
        <div>
          <label htmlFor="transaction_mode" className="block text-gray-700 text-sm font-bold mb-2">
            Transaction Mode <span className="text-red-500">*</span>
          </label>
          <select
            id="transaction_mode"
            name="transaction_mode"
            value={formData.transaction_mode}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            disabled={loading}
          >
            {TRANSACTION_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>
        </div>

        {/* Cheque No. (conditionally rendered) */}
        {formData.transaction_mode === 'CHEQUE' && (
          <div>
            <label htmlFor="cheque_no" className="block text-gray-700 text-sm font-bold mb-2">
              Cheque Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="cheque_no"
              name="cheque_no"
              value={formData.cheque_no}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., 123456"
              required={formData.transaction_mode === 'CHEQUE'}
              disabled={loading}
            />
          </div>
        )}

        {/* is_pp Checkbox (conditionally rendered for CHEQUE mode) */}
        {formData.transaction_mode === 'CHEQUE' && (
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="is_pp"
              name="is_pp"
              checked={formData.is_pp}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={loading}
            />
            <label htmlFor="is_pp" className="block text-gray-700 text-sm font-bold">
              Is_pp (Presented in next month?)
            </label>
          </div>
        )}

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Add any relevant details here..."
            disabled={loading}
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 mr-2"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            disabled={loading}
          >
            {loading ? 'Saving...' : (transactionToEdit ? 'Update Transaction' : 'Add Transaction')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;