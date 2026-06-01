import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNotify } from './Notification';
import { useTheme } from './ThemeContext';

export default function Register({ onToggleLogin }) {
  const { register } = useAuth();
  const notify = useNotify();
  const { toggleTheme, theme } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      notify.success('Account created successfully');
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
        <h1>Create Account</h1>
        <p>Register as a new customer</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <button
            type="submit" className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-light)' }}>
          Already have an account?{' '}
          <button
            onClick={onToggleLogin}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
