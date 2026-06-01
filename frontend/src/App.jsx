import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { NotificationProvider } from './components/Notification';
import Notification from './components/Notification';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import CustomerManagement from './components/CustomerManagement';
import OrderManagement from './components/OrderManagement';
import Login from './components/Login';
import Register from './components/Register';
import CustomerPortal from './components/CustomerPortal';

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link${isActive ? ' active' : ''}`}>
      {children}
    </Link>
  );
}

function AdminLayout() {
  const { logout, user } = useAuth();
  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>IMS</h2>
          <p className="sidebar-subtitle">Admin Portal</p>
        </div>
        <div className="nav-links">
          <NavLink to="/admin">Dashboard</NavLink>
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/customers">Customers</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
        </div>
        <div style={{ marginTop: 'auto', padding: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: 4 }}>{user?.email}</div>
          <button className="btn btn-danger btn-sm" style={{ width: '100%' }} onClick={logout}>Sign Out</button>
        </div>
      </nav>
      <main className="main-content">
        <Notification />
        <Routes>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/products" element={<ProductManagement />} />
          <Route path="/admin/customers" element={<CustomerManagement />} />
          <Route path="/admin/orders" element={<OrderManagement />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function LoginPage() {
  const [showRegister, setShowRegister] = useState(false);
  if (showRegister) {
    return <Register onToggleLogin={() => setShowRegister(false)} />;
  }
  return <Login onToggleRegister={() => setShowRegister(true)} />;
}

function AppRoutes() {
  const { user, loading, role } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <NotificationProvider>
        <Notification />
        <LoginPage />
      </NotificationProvider>
    );
  }

  if (role === 'admin') {
    return (
      <NotificationProvider>
        <AdminLayout />
      </NotificationProvider>
    );
  }

  return (
    <NotificationProvider>
      <CustomerPortal />
    </NotificationProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
