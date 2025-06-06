// src/redux/features/accounts/accountSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../utils/axiosInstance'; // Adjust path as needed

// Define the async thunk for fetching bank accounts
export const fetchBankAccounts = createAsyncThunk(
  'accounts/fetchBankAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('bank-accounts/');
      return response.data;
    } catch (error) {
      // Use `error.response.data` for backend error messages
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const accountSlice = createSlice({
  name: 'accounts',
  initialState: {
    accounts: [],
    loading: false,
    error: null,
  },
  reducers: {
    // You can add other synchronous reducers here if needed (e.g., addAccount, updateAccount locally)
    // For now, we'll rely on the async thunk for fetching.
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBankAccounts.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear previous errors
      })
      .addCase(fetchBankAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
        state.error = null;
      })
      .addCase(fetchBankAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch bank accounts'; // Use payload for specific error
        state.accounts = []; // Clear accounts on error
      });
  },
});

// Export selectors
export const selectAllBankAccounts = (state) => state.accounts.accounts;
export const selectAccountsLoading = (state) => state.accounts.loading;
export const selectAccountsError = (state) => state.accounts.error;

export default accountSlice.reducer;