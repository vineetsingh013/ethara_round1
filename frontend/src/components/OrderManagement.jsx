import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useNotify } from './Notification';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form, setForm] = useState({ customer_id: '', items: [{ sku: '', quantity: '' }] });
  const notify = useNotify();

  const loadAll = () => {
    Promise.all([
      api.getOrders(),
      api.getProducts(),
      api.getCustomers(),
    ])
      .then(([ordersData, productsData, customersData]) => {
        setOrders(ordersData);
        setProducts(productsData);
        setCustomers(customersData);
      })
      .catch((err) => notify.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const openCreate = () => {
    setSelectedOrder(null);
    setForm({ customer_id: '', items: [{ sku: '', quantity: '' }] });
    setShowForm(true);
  };

  const handleAddItem = () => {
    setForm({ ...form, items: [...form.items, { sku: '', quantity: '' }] });
  };

  const handleRemoveItem = (index) => {
    const items = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...form.items];
    items[index][field] = value;
    setForm({ ...form, items });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      customer_id: parseInt(form.customer_id, 10),
      items: form.items.map((item) => ({
        sku: item.sku,
        quantity: parseInt(item.quantity, 10),
      })),
    };

    try {
      await api.createOrder(payload);
      notify.success('Order created successfully');
      setShowForm(false);
      loadAll();
    } catch (err) {
      notify.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.deleteOrder(id);
      notify.success('Order cancelled successfully');
      loadAll();
    } catch (err) {
      notify.error(err.message);
    }
  };

  const viewOrder = async (id) => {
    try {
      const order = await api.getOrder(id);
      setSelectedOrder(order);
    } catch (err) {
      notify.error(err.message);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  if (selectedOrder) {
    return (
      <div>
        <button className="back-link" onClick={() => setSelectedOrder(null)}>
          &larr; Back to Orders
        </button>
        <div className="page-header">
          <h1>Order Details</h1>
        </div>
        <div className="detail-section">
          <h3>Order Information</h3>
          <div className="detail-grid">
            <div><div className="detail-label">Order ID</div><div className="detail-value">#{selectedOrder.id}</div></div>
            <div><div className="detail-label">Customer</div><div className="detail-value">{selectedOrder.customer_name}</div></div>
            <div><div className="detail-label">Customer ID</div><div className="detail-value">#{selectedOrder.customer_id}</div></div>
            <div><div className="detail-label">Total Amount</div><div className="detail-value">${selectedOrder.total_amount?.toFixed(2)}</div></div>
            <div><div className="detail-label">Date</div><div className="detail-value">{new Date(selectedOrder.created_at).toLocaleString()}</div></div>
          </div>
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
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + Create Order
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>No orders found</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customer_name || `Customer #${o.customer_id}`}</td>
                <td>${o.total_amount?.toFixed(2)}</td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-secondary btn-sm" style={{ marginRight: 8 }} onClick={() => viewOrder(o.id)}>View</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="form-overlay" onClick={() => setShowForm(false)}>
          <div className="form-card" onClick={(e) => e.stopPropagation()}>
            <h2>Create Order</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer</label>
                <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} required>
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <h3 style={{ fontSize: '0.95rem', margin: '16px 0 8px' }}>Items</h3>
              {form.items.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Product</label>
                    <select value={item.sku} onChange={(e) => handleItemChange(index, 'sku', e.target.value)} required>
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.sku} value={p.sku}>{p.name} ({p.sku}, Stock: {p.quantity})</option>
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
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
