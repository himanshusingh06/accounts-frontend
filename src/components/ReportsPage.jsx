// src/pages/ReportsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Import useDispatch and useSelector
import axiosInstance from '../utils/axiosInstance';
import BankAccountForm from '../components/forms/BankAccountForm';
import TransactionSearchAndExport from '../components/TransactionSearchAndExport';

// Import selectors and the fetch action from your new account slice
import {
  fetchBankAccounts,
  selectAllBankAccounts,
  selectAccountsLoading,
  selectAccountsError,
} from '../redux/features/accounts/accountSlice'; // NEW IMPORTS

const ReportsPage = () => {
  const dispatch = useDispatch();

  // Get data from Redux store
  const bankAccounts = useSelector(selectAllBankAccounts);
  const loadingAccounts = useSelector(selectAccountsLoading);
  const accountsError = useSelector(selectAccountsError);

  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statementData, setStatementData] = useState([]);
  const [accountDetails, setAccountDetails] = useState(null);

  const [loading, setLoading] = useState(false); // For statement generation
  const [error, setError] = useState(null); // For statement generation

  const [showBankAccountForm, setShowBankAccountForm] = useState(false);

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

  // Fetch bank accounts when component mounts if not already loaded
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

  const handleGenerateStatement = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatementData([]);
    setAccountDetails(null);

    if (!selectedAccountId || !startDate || !endDate) {
      setError('Please select an account and a date range.');
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get('transactions/bank_statement/', {
        params: {
          account_id: selectedAccountId,
          start_date: startDate,
          end_date: endDate,
        },
      });
      setStatementData(response.data.transactions);
      setAccountDetails(response.data.account);
    } catch (err) {
      console.error('Error generating statement:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to generate statement. Please check inputs.');
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId, startDate, endDate]);

  const handleBankAccountCreated = (newAccount) => {
    // When a new account is created, dispatch fetchBankAccounts to update Redux store
    dispatch(fetchBankAccounts());
    setSelectedAccountId(newAccount.id); // Select the newly created account
    setShowBankAccountForm(false); // Hide the form
  };

  const handleExportCsv = () => {
    if (!statementData.length) {
      alert('No data to export.');
      return;
    }

    const headers = [
      "Sr. No.", "Date", "Transaction Type", "Amount", "Description",
      "Transaction Head", "Transaction Mode", "Cheque No.", "Created By"
    ];
    const rows = statementData.map((tx, index) => [
      index + 1,
      formatIndianDate(tx.transaction_date),
      tx.transaction_type,
      tx.amount,
      tx.description || '-',
      tx.transaction_head,
      tx.transaction_mode,
      tx.cheque_no || '-',
      tx.created_by_username || '-'
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `statement_${accountDetails?.account_number}_${startDate}_to_${endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-4xl font-bold text-blue-800 mb-6">Reports & Statements</h1>

      {/* Section to Create Bank Account */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-700">Bank Account Management</h2>
          <button
            onClick={() => setShowBankAccountForm(!showBankAccountForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            {showBankAccountForm ? 'Hide Form' : 'Add New Bank Account'}
          </button>
        </div>
        {showBankAccountForm && (
          <BankAccountForm
            onAccountCreated={handleBankAccountCreated}
            onCancel={() => setShowBankAccountForm(false)}
          />
        )}
      </div>

      {/* Section to Generate Transaction Statement */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Generate Transaction Statement</h2>
        <form onSubmit={handleGenerateStatement} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="selectAccount" className="block text-gray-700 text-sm font-bold mb-2">Select Account</label>
            <select
              id="selectAccount"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(parseInt(e.target.value))}
              required
              disabled={loading || loadingAccounts}
            >
              {loadingAccounts ? (
                <option value="">Loading accounts...</option>
              ) : accountsError ? (
                <option value="">Error: {accountsError}</option>
              ) : bankAccounts.length === 0 ? (
                <option value="">No accounts available</option>
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              disabled={loading || bankAccounts.length === 0}
            >
              {loading ? 'Generating...' : 'Generate Statement'}
            </button>
          </div>
        </form>

        {error && (
          <p className="text-red-500 text-xs italic mt-4 text-center">{error}</p>
        )}

        {statementData.length > 0 && accountDetails && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Statement for {accountDetails.name} ({accountDetails.account_number})</h3>
            <p className="text-gray-600 mb-4">Current Balance: <span className="font-bold text-blue-600">{formatCurrency(accountDetails.current_balance)}</span></p>

            <div className="flex justify-end gap-4 mb-4">
              <button
                onClick={handleExportCsv}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                Export CSV
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
              <div className="max-h-96 overflow-y-auto overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cheque No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {statementData.map((tx, index) => (
                      <tr key={tx.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatIndianDate(tx.transaction_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize">{tx.transaction_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(tx.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{tx.description || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{tx.transaction_head}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{tx.transaction_mode}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{tx.cheque_no || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{tx.created_by_username || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- NEW SECTION: Transaction Search and Export --- */}
      <div className="mt-8">
        <TransactionSearchAndExport selectedAccountId={selectedAccountId} />
      </div>
      {/* --- END NEW SECTION --- */}

    </div>
  );
};

export default ReportsPage;