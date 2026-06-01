import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import CustomerManagement from './components/CustomerManagement';
import OrderManagement from './components/OrderManagement';

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link${isActive ? ' active' : ''}`}>
      {children}
    </Link>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="sidebar">
          <div className="sidebar-header">
            <h2>IMS</h2>
            <p className="sidebar-subtitle">Inventory Management</p>
          </div>
          <div className="nav-links">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/customers">Customers</NavLink>
            <NavLink to="/orders">Orders</NavLink>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/products" element={<Layout><ProductManagement /></Layout>} />
            <Route path="/customers" element={<Layout><CustomerManagement /></Layout>} />
            <Route path="/orders" element={<Layout><OrderManagement /></Layout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
