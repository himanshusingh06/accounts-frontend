// src/components/transactions/TransactionSearchAndExport.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance'; // Corrected path to axiosInstance
import { useSelector } from 'react-redux';
import { selectSortedTransactionHeads } from '../redux/features/staticData/staticDataSlice';

const TransactionSearchAndExport = ({ selectedAccountId }) => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [transactionHeadFilter, setTransactionHeadFilter] = useState('');
  const [partyNameFilter, setPartyNameFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportMessage, setExportMessage] = useState(null);

  const transactionHeads = useSelector(selectSortedTransactionHeads);

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
    const fetchTransactionsForAccount = async () => {
      if (!selectedAccountId) {
        setAllTransactions([]);
        setFilteredTransactions([]); // Clear filtered transactions when no account is selected
        setLoading(false);
        setError(null);
        setTransactionHeadFilter('');
        setPartyNameFilter('');
        setExportMessage(null);
        return;
      }

      setLoading(true);
      setError(null);
      setExportMessage(null);
      try {
        // Fetch transactions for the SPECIFIC selected account only
        const response = await axiosInstance.get('transactions/', {
          params: {
            account: selectedAccountId // This parameter is now handled correctly by backend views.py
          }
        });
        setAllTransactions(response.data);
        // After fetching all transactions for the selected account, apply initial filters
        // This will be handled by the useEffect watching `allTransactions`
      } catch (err) {
        console.error('Error fetching transactions for search by account:', err.response?.data || err.message);
        setError('Failed to load transactions for the selected account. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactionsForAccount();
  }, [selectedAccountId]); // Re-fetch when selectedAccountId changes

  // This useCallback handles client-side filtering based on allTransactions
  const handleSearch = useCallback(() => {
    let currentFiltered = allTransactions;

    if (transactionHeadFilter) {
      currentFiltered = currentFiltered.filter(
        (tx) => tx.transaction_head === transactionHeadFilter
      );
    }

    if (partyNameFilter) {
      const lowerCasePartyNameFilter = partyNameFilter.toLowerCase();
      currentFiltered = currentFiltered.filter(
        (tx) => tx.party_name && tx.party_name.toLowerCase().includes(lowerCasePartyNameFilter)
      );
    }
    setFilteredTransactions(currentFiltered);
  }, [transactionHeadFilter, partyNameFilter, allTransactions]); // Re-run when filters or allTransactions change

  useEffect(() => {
    handleSearch();
  }, [handleSearch]); // Call handleSearch when its dependencies change

  const handleExportCsv = () => {
    setExportMessage(null);

    if (!filteredTransactions.length) {
      setExportMessage({ type: 'error', text: 'No filtered data to export. Please adjust filters.' });
      return;
    }

    const headers = [
      "Sr. No.", "Date", "Transaction Type", "Amount", "Description",
      "Account Name", "Party Name", "Transaction Head", "Transaction Mode", "Cheque No.", "Is P/P Cheque", "Is Reconciled", "Created By"
    ];
    const rows = filteredTransactions.map((tx, index) => [
      index + 1,
      formatIndianDate(tx.transaction_date),
      tx.transaction_type,
      tx.amount,
      tx.description || '-',
      tx.account_name,
      tx.party_name || '-',
      tx.transaction_head,
      tx.transaction_mode,
      tx.cheque_no || '-',
      tx.is_pp ? 'Yes' : 'No',
      tx.is_reconciled ? 'Yes' : 'No',
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
      link.setAttribute('download', `filtered_transactions_account_${selectedAccountId || 'unknown'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportMessage({ type: 'success', text: 'CSV exported successfully!' });
    } else {
      setExportMessage({ type: 'error', text: 'Your browser does not support automatic CSV download. Please try a different browser.' });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Search Transactions by Head or Party</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 items-end">
        {/* Transaction Head Filter */}
        <div>
          <label htmlFor="transactionHeadFilter" className="block text-gray-700 text-sm font-bold mb-2">Select Transaction Head</label>
          <select
            id="transactionHeadFilter"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={transactionHeadFilter}
            onChange={(e) => setTransactionHeadFilter(e.target.value)}
            disabled={loading || !selectedAccountId} // Disable if no account selected
          >
            <option value="">-- All Heads --</option>
            {transactionHeads.map((head) => (
              <option key={head.value} value={head.value}>{head.label}</option>
            ))}
          </select>
        </div>

        {/* Party Name Filter */}
        <div>
          <label htmlFor="partyNameFilter" className="block text-gray-700 text-sm font-bold mb-2">Search by Party Name</label>
          <input
            type="text"
            id="partyNameFilter"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., John Doe"
            value={partyNameFilter}
            onChange={(e) => setPartyNameFilter(e.target.value)}
            disabled={loading || !selectedAccountId} // Disable if no account selected
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            onClick={handleExportCsv}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            disabled={loading || filteredTransactions.length === 0 || !selectedAccountId} // Disabled if no account selected
          >
            Export Filtered CSV
          </button>
        </div>
      </div>

      {exportMessage && (
        <div className={`p-3 mb-4 rounded-md ${exportMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {exportMessage.text}
        </div>
      )}

      <h3 className="text-xl font-bold text-gray-800 mb-4">Results ({filteredTransactions.length} transactions)</h3>

      {filteredTransactions.length === 0 && !loading && selectedAccountId ? (
        <p className="text-gray-600">No transactions found matching the selected criteria in this account.</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          {/* Apply vertical scrolling here */}
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cheque No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P/P</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reconciled</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((tx, index) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatIndianDate(tx.transaction_date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.account_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{tx.transaction_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.transaction_head}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.party_name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.transaction_mode}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(tx.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.cheque_no || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.is_pp ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tx.is_reconciled ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">{tx.created_by_username || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionSearchAndExport;