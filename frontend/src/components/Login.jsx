import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNotify } from './Notification';

export default function Login({ onToggleRegister }) {
  const { login } = useAuth();
  const notify = useNotify();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      notify.success('Logged in successfully');
    } catch (err) {
      notify.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: '#f1f5f9',
    }}>
      <div style={{
        background: '#fff', borderRadius: 8, padding: 40,
        width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ marginBottom: 8, fontSize: '1.5rem' }}>Welcome</h1>
        <p style={{ color: '#64748b', marginBottom: 24, fontSize: '0.9rem' }}>
          Sign in to the Inventory Management System
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button
            type="submit" className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          New customer?{' '}
          <button
            onClick={onToggleRegister}
            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
