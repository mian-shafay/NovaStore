// =============================================
// APP.JSX — Main Application Component
// =============================================
// This is the root component of our React app.
// It sets up:
//   1. React Router (URL → Component mapping)
//   2. Protected routes (auth required)
//   3. Admin routes (admin role required)
//   4. Navbar & Footer on every page
//   5. Toast notifications

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProductDetail from './pages/ProductDetail';
import NotFound from './pages/NotFound';

// Protected Pages (Customer)
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CustomerDashboard from './pages/CustomerDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManageUsers from './pages/admin/ManageUsers';

// Styles
import './App.css';

function App() {
  return (
    <Router>
      {/* Toast notification container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a2e',
            color: '#f1f5f9',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '10px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f1f5f9',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f1f5f9',
            },
          },
        }}
      />

      {/* Navbar appears on every page */}
      <Navbar />

      {/* Routes */}
      <Routes>
        {/* ---- PUBLIC ROUTES ---- */}
        {/* Anyone can access these */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* ---- PROTECTED ROUTES (Customer) ---- */}
        {/* Must be logged in */}
        <Route path="/cart" element={
          <ProtectedRoute><Cart /></ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute><Checkout /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><CustomerDashboard /></ProtectedRoute>
        } />

        {/* ---- ADMIN ROUTES ---- */}
        {/* Must be logged in AND have admin role */}
        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />
        <Route path="/admin/products" element={
          <AdminRoute><ManageProducts /></AdminRoute>
        } />
        <Route path="/admin/orders" element={
          <AdminRoute><ManageOrders /></AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute><ManageUsers /></AdminRoute>
        } />

        {/* ---- 404 CATCH-ALL ---- */}
        {/* If no route matches, show 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Footer appears on every page */}
      <Footer />
    </Router>
  );
}

export default App;
