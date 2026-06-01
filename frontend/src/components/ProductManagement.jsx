import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useNotify } from './Notification';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', price: '', quantity: '' });
  const notify = useNotify();

  const loadProducts = () => {
    api.getProducts()
      .then(setProducts)
      .catch((err) => notify.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadProducts, []);

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', sku: '', price: '', quantity: '' });
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity: String(product.quantity),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      sku: form.sku,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
    };

    try {
      if (editProduct) {
        await api.updateProduct(editProduct.sku, payload);
        notify.success('Product updated successfully');
      } else {
        await api.createProduct(payload);
        notify.success('Product created successfully');
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      notify.error(err.message);
    }
  };

  const handleDelete = async (sku) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(sku);
      notify.success('Product deleted successfully');
      loadProducts();
    } catch (err) {
      notify.error(err.message);
    }
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Product
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>No products found</td></tr>
            )}
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td><code>{p.sku}</code></td>
                <td>${p.price.toFixed(2)}</td>
                <td>
                  {p.quantity}
                  {p.quantity < 10 && <span className="badge badge-warning" style={{ marginLeft: 8 }}>Low</span>}
                </td>
                <td>
                  <button className="btn btn-secondary btn-sm" style={{ marginRight: 8 }} onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.sku)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="form-overlay" onClick={() => setShowForm(false)}>
          <div className="form-card" onClick={(e) => e.stopPropagation()}>
            <h2>{editProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Quantity in Stock</label>
                <input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editProduct ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
