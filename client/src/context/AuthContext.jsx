// =============================================
// AUTH CONTEXT (Global Authentication State)
// =============================================
// React Context lets us share data across ALL components
// without passing it through props at every level.
//
// Think of it like a "global variable" for React:
//   - Any component can read the current user
//   - Any component can call login(), signup(), logout()
//
// HOW IT WORKS:
// 1. AuthProvider wraps the entire app (in main.jsx)
// 2. Any component uses useAuth() to access auth state
// 3. When auth state changes, all components using it re-render

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

// Step 1: Create the context (like creating an empty box)
const AuthContext = createContext(null);

// Step 2: Create a custom hook for easy access
// Instead of writing useContext(AuthContext) everywhere,
// components just call useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Step 3: Create the Provider component
// This component holds all auth state and functions
export const AuthProvider = ({ children }) => {
  // ---- STATE ----
  // useState creates a piece of state that, when changed,
  // causes the component (and its children) to re-render
  const [user, setUser] = useState(null);           // Current logged-in user
  const [loading, setLoading] = useState(true);     // Loading state (checking token)
  const [cartCount, setCartCount] = useState(0);    // Cart item count for navbar badge

  // ---- LOAD USER ON APP START ----
  // useEffect runs code when the component first mounts (loads).
  // We check if there's a saved token and load the user profile.
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Verify token is still valid by fetching profile
          const res = await api.get('/auth/profile');
          setUser(res.data.user);
          // Load cart count
          fetchCartCount();
        } catch (error) {
          // Token is invalid, clear everything
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []); // Empty array = run only once when component mounts

  // ---- FETCH CART COUNT ----
  const fetchCartCount = async () => {
    try {
      const res = await api.get('/cart');
      const count = res.data.items ? res.data.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  // ---- SIGNUP ----
  const signup = async (name, email, password, role = 'customer', adminCode = '') => {
    const res = await api.post('/auth/signup', {
      name,
      email,
      password,
      role,
      adminCode,
    });

    // Note: We no longer auto-login because the user needs to verify their email first.
    return res.data;
  };

  // ---- LOGIN ----
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });

    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    fetchCartCount();

    return res.data;
  };

  // ---- LOGOUT ----
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCartCount(0);
  };

  // ---- UPDATE CART COUNT ----
  const updateCartCount = (count) => {
    setCartCount(count);
  };

  // The "value" prop is what gets shared with all children
  // Any component using useAuth() gets access to these
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        cartCount,
        login,
        signup,
        logout,
        fetchCartCount,
        updateCartCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
