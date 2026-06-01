import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNotify } from './Notification';
import { useTheme } from './ThemeContext';

export default function Login({ onToggleRegister }) {
  const { login } = useAuth();
  const notify = useNotify();
  const { toggleTheme, theme } = useTheme();
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
    <div className="login-wrapper">
      <button className="theme-toggle-corner" onClick={toggleTheme} title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}>
        {theme === 'light' ? '\u263E' : '\u2600'}
      </button>
      <div className="login-card">
        <h1>Welcome</h1>
        <p>Sign in to the Inventory Management System</p>
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
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)' }}>
          New customer?{' '}
          <button
            onClick={onToggleRegister}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
