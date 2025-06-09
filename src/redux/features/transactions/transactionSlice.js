// src/redux/features/transactions/transactionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../utils/axiosInstance'; // Adjust path as needed

// Async thunk for fetching ALL transactions
export const fetchAllTransactions = createAsyncThunk(
  'transactions/fetchAllTransactions',
  async (params = {}, { rejectWithValue }) => { // Accept params for general filtering
    try {
      const response = await axiosInstance.get('transactions/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching RECENT transactions (e.g., last 5)
export const fetchRecentTransactions = createAsyncThunk(
  'transactions/fetchRecentTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('transactions/', {
        params: {
          ordering: '-created_at', // Order by latest created
          limit: 5,                 // Limit to 5
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    allTransactions: [],     // Stores ALL transactions for summaries
    recentTransactions: [],  // Stores recent transactions for dashboard list
    loadingAll: false,
    loadingRecent: false,
    error: null,
  },
  reducers: {
    // You can add more reducers here for direct state updates if needed
    // For example, if you want to optimistically update transactions after CRUD
    // (though dispatching fetchAllTransactions after CRUD might be simpler for now)
  },
  extraReducers: (builder) => {
    builder
      // Reducers for fetchAllTransactions
      .addCase(fetchAllTransactions.pending, (state) => {
        state.loadingAll = true;
        state.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.loadingAll = false;
        state.allTransactions = action.payload;
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.loadingAll = false;
        state.error = action.payload;
      })
      // Reducers for fetchRecentTransactions
      .addCase(fetchRecentTransactions.pending, (state) => {
        state.loadingRecent = true;
        state.error = null; // Use a single error state for simplicity, or separate if needed
      })
      .addCase(fetchRecentTransactions.fulfilled, (state, action) => {
        state.loadingRecent = false;
        state.recentTransactions = action.payload;
      })
      .addCase(fetchRecentTransactions.rejected, (state, action) => {
        state.loadingRecent = false;
        state.error = action.payload;
      });
  },
});

// Export the reducer
export default transactionSlice.reducer;

// Export selectors for both types of transaction data
export const selectAllTransactions = (state) => state.transactions.allTransactions;
export const selectRecentTransactions = (state) => state.transactions.recentTransactions;
export const selectTransactionsLoadingAll = (state) => state.transactions.loadingAll;
export const selectTransactionsLoadingRecent = (state) => state.transactions.loadingRecent;
export const selectTransactionsError = (state) => state.transactions.error;