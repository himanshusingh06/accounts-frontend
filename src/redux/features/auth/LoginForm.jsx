// src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from './authSlice'; // Corrected path to authSlice
import axiosInstance from "../../../utils/axiosInstance"; // Correct for going up 3 levels then into utils


const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart()); // Indicate login process has started

    try {
      const response = await axiosInstance.post('auth/token/', {
        username,
        password,
      });

      const { access, refresh } = response.data;

      // === CRITICAL FIX START ===
      // This userInfo object MUST contain is_staff and is_superuser.
      // For immediate frontend testing, we are temporarily hardcoding them.
      // In a real application, your Django backend's /auth/token/ endpoint
      // should return these fields, or you should make a separate API call
      // to fetch full user details after getting the token.
      const userInfo = {
        username: username, // Make sure username is captured
        is_staff: true,     // <--- TEMPORARY: Ensure this is true for admin access
        is_superuser: true, // <--- TEMPORARY: Ensure this is true for admin access
        // Add any other user properties returned by your backend here, e.g.:
        // email: response.data.email,
        // id: response.data.user_id,
      };

      // If your backend actually sends user details (e.g., in a 'user_details' key),
      // you would do something like:
      // const userInfo = response.data.user_details;
      // Make sure response.data.user_details includes is_staff and is_superuser.

      // Store the access token and the full user info in localStorage
      localStorage.setItem('authToken', access);
      localStorage.setItem('refreshToken', refresh); // Optional
      localStorage.setItem('user', JSON.stringify(userInfo)); // Store stringified user object
      // === CRITICAL FIX END ===

      // Dispatch success action with the complete user data and token
      dispatch(loginSuccess({ user: userInfo, token: access }));

      navigate('/dashboard'); // Redirect to dashboard on successful login
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      dispatch(loginFailure(err.response?.data?.detail || 'Login failed. Please check your credentials.'));
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition duration-200"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline transition duration-200"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        {error && (
          <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>
        )}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-300"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;