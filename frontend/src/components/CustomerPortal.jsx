import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';
import { useNotify } from './Notification';
import { useTheme } from './ThemeContext';
import Loader from './Loader';

export default function CustomerPortal() {
  const { user, logout } = useAuth();
  const { toggleTheme, theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);
  const notify = useNotify();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form, setForm] = useState({ items: [{ sku: '', quantity: '' }] });

  const loadAll = () => {
    Promise.all([
      api.getMyProfile(),
      api.getProducts(),
      api.getMyOrders(),
    ])
      .then(([p, prods, ords]) => {
        setProfile(p);
        setProducts(prods);
        setOrders(ords);
      })
      .catch((err) => notify.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const computeFormTotal = () => {
    let total = 0;
    for (const item of form.items) {
      if (item.sku && item.quantity) {
        const product = products.find(p => p.sku === item.sku);
        if (product) {
          total += product.price * parseInt(item.quantity, 10);
        }
      }
    }
    return total;
  };

  const handleAddItem = () => {
    setForm({ ...form, items: [...form.items, { sku: '', quantity: '' }] });
  };

  const handleRemoveItem = (index) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...form.items];
    items[index][field] = value;
    setForm({ ...form, items });
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await api.createMyOrder({
        customer_id: parseInt(localStorage.getItem('customer_id'), 10),
        items: form.items.map((item) => ({
          sku: item.sku,
          quantity: parseInt(item.quantity, 10),
        })),
      });
      notify.success('Order placed successfully');
      setForm({ items: [{ sku: '', quantity: '' }] });
      setView('orders');
      loadAll();
    } catch (err) {
      notify.error(err.message);
    }
  };

  const viewOrder = async (id) => {
    try {
      const order = await api.getMyOrder(id);
      setSelectedOrder(order);
      setView('detail');
    } catch (err) {
      notify.error(err.message);
    }
  };

  const handleRequestCancel = async (id) => {
    if (!window.confirm('Request cancellation for this order?')) return;
    try {
      await api.requestCancelOrder(id);
      notify.success('Cancellation requested. Awaiting admin approval.');
      loadAll();
    } catch (err) {
      notify.error(err.message);
    }
  };

  const statusLabel = (s) => {
    const labels = {
      confirmed: 'Confirmed',
      cancellation_requested: 'Cancel Requested',
      cancelled: 'Cancelled',
      rejection_requested: 'Rejected',
    };
    return labels[s] || s;
  };

  if (loading) return <Loader text="Loading customer data..." />;

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
          <button className={`nav-link${view === 'dashboard' ? ' active' : ''}`} onClick={() => { setView('dashboard'); setSelectedOrder(null); closeMobile(); }}><span className="nav-icon">📊</span><span>Dashboard</span></button>
          <button className={`nav-link${view === 'orders' ? ' active' : ''}`} onClick={() => { setView('orders'); setSelectedOrder(null); loadAll(); closeMobile(); }}><span className="nav-icon">📋</span><span>My Orders</span></button>
          <button className={`nav-link${view === 'create' ? ' active' : ''}`} onClick={() => { setView('create'); setSelectedOrder(null); closeMobile(); }}><span className="nav-icon">➕</span><span>Place Order</span></button>
        </div>
        <div className="sidebar-footer">
          <div style={{ fontSize: '0.8rem', color: 'var(--muted-teal)', marginBottom: 4 }}>{user?.email}</div>
          <button className="btn btn-danger btn-sm" style={{ width: '100%' }} onClick={logout}>Sign Out</button>
        </div>
      </nav>
      <main className="main-content">
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} title="Open menu">&#9776;</button>
        <button className="theme-toggle-corner" onClick={toggleTheme} title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}>
          {theme === 'light' ? '\u263E' : '\u2600'}
        </button>
        {view === 'dashboard' && (
          <>
            <div className="page-header"><h1>My Dashboard</h1></div>
            <div className="dashboard-cards">
              <div className="card">
                <h3>My Orders</h3>
                <div className="value">{orders.length}</div>
              </div>
              <div className="card">
                <h3>Profile</h3>
                <div style={{ fontSize: '0.9rem', marginTop: 8 }}>
                  <div><strong>{profile?.name}</strong></div>
                  <div style={{ color: 'var(--text-light)' }}>{profile?.email}</div>
                  <div style={{ color: 'var(--text-light)' }}>{profile?.phone}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {view === 'orders' && (
          <>
            <div className="page-header"><h1>My Orders</h1></div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>No orders yet</td></tr>
                  )}
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>${o.total_amount?.toFixed(2)}</td>
                      <td>{statusLabel(o.status)}</td>
                      <td>{new Date(o.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" style={{ marginRight: 4 }} onClick={() => viewOrder(o.id)}>View</button>
                        {o.status === 'confirmed' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleRequestCancel(o.id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === 'detail' && selectedOrder && (
          <>
            <button className="back-link" onClick={() => { setSelectedOrder(null); setView('orders'); }}>
              &larr; Back to Orders
            </button>
            <div className="detail-section">
              <h3>Order #{selectedOrder.id}</h3>
              <div className="detail-grid">
                <div><div className="detail-label">Total Amount</div><div className="detail-value">${selectedOrder.total_amount?.toFixed(2)}</div></div>
                <div><div className="detail-label">Status</div><div className="detail-value">{statusLabel(selectedOrder.status)}</div></div>
                <div><div className="detail-label">Date</div><div className="detail-value">{new Date(selectedOrder.created_at).toLocaleString()}</div></div>
              </div>
              {selectedOrder.status === 'confirmed' && (
                <button className="btn btn-danger btn-sm" style={{ marginTop: 12 }} onClick={() => { handleRequestCancel(selectedOrder.id); setSelectedOrder(null); setView('orders'); }}>
                  Request Cancellation
                </button>
              )}
            </div>
            <div className="detail-section">
              <h3>Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name || `SKU: ${item.sku}`}</td>
                      <td>${item.unit_price?.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>${(item.unit_price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700, background: '#f8fafc' }}>
                    <td colSpan={3} style={{ textAlign: 'right', padding: '12px 16px' }}>Total:</td>
                    <td style={{ padding: '12px 16px' }}>${selectedOrder.total_amount?.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}

        {view === 'create' && (
          <>
            <div className="page-header"><h1>Place Order</h1></div>
            <div className="form-card" style={{ maxWidth: 600 }}>
              <form onSubmit={handleCreateOrder}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: 12 }}>Items</h3>
                {form.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label>Product</label>
                      <select value={item.sku} onChange={(e) => handleItemChange(index, 'sku', e.target.value)} required>
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.sku} value={p.sku}>{p.name} ({p.sku}, ${p.price}, Stock: {p.quantity})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ width: 100, marginBottom: 0 }}>
                      <label>Qty</label>
                      <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required />
                    </div>
                    {form.items.length > 1 && (
                      <button type="button" className="btn btn-danger btn-sm" style={{ marginBottom: 0 }} onClick={() => handleRemoveItem(index)}>X</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem}>+ Add Item</button>
                <div style={{ textAlign: 'right', marginTop: 16, fontSize: '1.1rem', fontWeight: 700 }}>
                  Order Total: ${computeFormTotal().toFixed(2)}
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Place Order</button>
                </div>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
