import React, { useState, useEffect } from 'react';
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
import { ThemeProvider, useTheme } from './components/ThemeContext';
import Loader from './components/Loader';

function NavLink({ to, children, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link${isActive ? ' active' : ''}`} onClick={onClick}>
      {children}
    </Link>
  );
}

function AdminLayout() {
  const { logout, user } = useAuth();
  const { toggleTheme, theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);
  return (
    <div className="app">
      <div className={`sidebar-backdrop${mobileOpen ? ' visible' : ''}`} onClick={closeMobile} />
      <nav className={`sidebar${sidebarOpen ? '' : ' collapsed'}${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-header">
          {sidebarOpen && <h2>IMS</h2>}
          <button className="sidebar-collapse-btn" onClick={() => setSidebarOpen(!sidebarOpen)} title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
            {sidebarOpen ? '\u2715' : '\u2630'}
          </button>
        </div>
        <div className="nav-links">
          <NavLink to="/admin" onClick={closeMobile}><span className="nav-icon">📊</span><span>Dashboard</span></NavLink>
          <NavLink to="/admin/products" onClick={closeMobile}><span className="nav-icon">📦</span><span>Products</span></NavLink>
          <NavLink to="/admin/customers" onClick={closeMobile}><span className="nav-icon">👥</span><span>Customers</span></NavLink>
          <NavLink to="/admin/orders" onClick={closeMobile}><span className="nav-icon">📋</span><span>Orders</span></NavLink>
        </div>
        <div className="sidebar-footer">
          <div style={{ fontSize: '0.8rem', color: 'var(--muted-teal)', marginBottom: 4 }}>{user?.email}</div>
          <button className="btn btn-danger btn-sm" style={{ width: '100%' }} onClick={logout}>Sign Out</button>
        </div>
      </nav>
      <main className="main-content">
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} title="Open menu">&#9776;</button>
        <Notification />
        <button className="theme-toggle-corner" onClick={toggleTheme} title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}>
          {theme === 'light' ? '\u263E' : '\u2600'}
        </button>
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
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !minTimeElapsed) {
    return <Loader text="Loading application..." />;
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
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
