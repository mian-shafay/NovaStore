// =============================================
// PROTECTED ROUTE COMPONENT
// =============================================
// This component wraps routes that require authentication.
// If the user is NOT logged in, they get redirected to /login.
//
// Usage in App.jsx:
//   <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // While checking auth status, show loading spinner
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the child component
  return children;
};

export default ProtectedRoute;
