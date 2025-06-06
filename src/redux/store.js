import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
// import transactionsReducer from './features/transactions/transactionsSlice'; // Will add later
import staticDataReducer from './features/staticData/staticDataSlice'; // Import your new slice
import accountReducer from './features/accounts/accountSlice'; // Import your new account slice


export const store = configureStore({
  reducer: {
    auth: authReducer,
    // transactions: transactionsReducer, // Will add later
    // Add other reducers here
   staticData: staticDataReducer, // Add the static data reducer here
   accounts: accountReducer,

  },
});