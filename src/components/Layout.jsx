// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/features/auth/authSlice';

const Layout = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsSidebarOpen(false);
  };

  const handleNavLinkClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          {/* Hamburger button for small screens */}
          {isAuthenticated && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white md:hidden focus:outline-none mr-4"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          )}

          <h1 className="text-2xl font-bold flex-grow">College Bank App</h1>
          <nav>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Overlay for small screens when sidebar is open */}
        {isAuthenticated && isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar / Navigation (for authenticated users) */}
        {isAuthenticated && (
          <aside
            className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-900 text-white p-4 shadow-lg h-screen overflow-y-auto
                       transform transition-transform duration-300 ease-in-out
                       ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                       md:translate-x-0 md:static md:block md:w-64 md:flex-shrink-0 md:shadow-lg`}
          >
            {/* Close button for small screens inside sidebar */}
            <div className="flex justify-end md:hidden mb-4">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-white focus:outline-none"
                aria-label="Close sidebar"
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <nav className="space-y-4">
              <Link to="/dashboard" className="block py-2 px-4 rounded hover:bg-blue-700 transition duration-200" onClick={handleNavLinkClick}>
                Dashboard
              </Link>
              <Link to="/accounts" className="block py-2 px-4 rounded hover:bg-blue-700 transition duration-200" onClick={handleNavLinkClick}>
                Bank Accounts
              </Link>
              <Link to="/transactions" className="block py-2 px-4 rounded hover:bg-blue-700 transition duration-200" onClick={handleNavLinkClick}>
                Transactions
              </Link>
              <Link to="/cashbook" className="block py-2 px-4 rounded hover:bg-blue-700 transition duration-200" onClick={handleNavLinkClick}>
                Cashbooks
              </Link>
              <Link to="/budget" className="block py-2 px-4 rounded hover:bg-blue-700 transition duration-200" onClick={handleNavLinkClick}>
                Budget
              </Link>
              <Link to="/reports" className="block py-2 px-4 rounded hover:bg-blue-700 transition duration-200" onClick={handleNavLinkClick}>
                Reports
              </Link>
              {/* <<< IMPORTANT: Ensure this 'to' path matches the Route path in App.jsx */}
              <Link to="/reconciliation" className="block py-2 px-4 rounded hover:bg-blue-700 transition duration-200" onClick={handleNavLinkClick}>
                Bank Reconciliation
              </Link>
            </nav>
          </aside>
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 p-6 overflow-x-hidden transition-all duration-300 ease-in-out
                     ${isAuthenticated ? 'md:ml-64' : 'ml-0'}
                     ${isSidebarOpen && isAuthenticated ? 'hidden md:block' : ''}`}
        >
          {children}
        </main>
      </div>

      {/* Footer (Optional) */}
      <footer className="bg-gray-800 text-white p-4 text-center text-sm">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} College Bank Management. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;