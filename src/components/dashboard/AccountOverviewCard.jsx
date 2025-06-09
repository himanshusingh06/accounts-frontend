// src/components/dashboard/AccountOverviewCard.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link component

const AccountOverviewCard = ({ account }) => {
  // Helper function to format currency (defined locally for this component)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    // Wrap the entire card content in a Link component
    // Clicking this card will now navigate to the /transactions page
    // and pass the account.id as a query parameter (e.g., /transactions?account_id=123)
    <Link
      to={`/transactions?account_id=${account.id}`}
      className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center justify-between"
    >
      <div>
        <h3 className="text-xl font-semibold text-gray-700">{account.name}</h3>
        <p className="text-gray-500 text-sm">{account.account_number}</p>
        <p className="text-2xl font-bold mt-2 text-blue-600">
          {/* Displaying current_balance formatted */}
          {formatCurrency(account.current_balance)}
        </p>
      </div>
      {/* Icon for the card */}
      <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
      </svg>
    </Link>
  );
};

export default AccountOverviewCard;