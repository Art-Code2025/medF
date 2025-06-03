import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import AllProducts from './components/AllProducts';
import ProductDetail from './components/ProductDetail';
import CustomerSignIn from './components/CustomerSignIn';
import Login from './Login';
import Dashboard from './components/Dashboard';
import ProductForm from './components/ProductForm';
import CategoryAdd from './CategoryAdd';
import CategoryEdit from './CategoryEdit';
import ShoppingCart from './components/ShoppingCart';
import CartDiagnostics from './components/CartDiagnostics';
import Wishlist from './components/Wishlist';
import Checkout from './components/Checkout';
import ThankYou from './components/ThankYou';

// ProtectedRoute Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole = "admin" }) => {
  const adminData = localStorage.getItem('adminUser');
  
  if (!adminData) {
    window.location.href = '/login';
    return null;
  }
  
  try {
    const admin = JSON.parse(adminData);
    if (admin?.isAdmin && admin?.role === 'admin') {
      return <>{children}</>;
    } else {
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
      return null;
    }
  } catch (error) {
    localStorage.removeItem('adminUser');
    window.location.href = '/login';
    return null;
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/sign-in" element={<CustomerSignIn />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/cart/diagnostics" element={<CartDiagnostics />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thank-you" element={<ThankYou />} />
          
          {/* Admin Routes */}
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/product/new" 
            element={
              <ProtectedRoute requiredRole="admin">
                <ProductForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/product/:id" 
            element={
              <ProtectedRoute requiredRole="admin">
                <ProductForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/category/new" 
            element={
              <ProtectedRoute requiredRole="admin">
                <CategoryAdd />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/category/:id" 
            element={
              <ProtectedRoute requiredRole="admin">
                <CategoryEdit />
              </ProtectedRoute>
            } 
          />
        </Routes>
        
        <ToastContainer 
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  </React.StrictMode>,
);