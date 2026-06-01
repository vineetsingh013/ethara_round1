import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe()
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('customer_id');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('token', res.access_token);
    localStorage.setItem('role', res.role);
    if (res.customer_id) {
      localStorage.setItem('customer_id', String(res.customer_id));
    }
    const me = await api.getMe();
    setUser(me);
    return res;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.register(data);
    localStorage.setItem('token', res.access_token);
    localStorage.setItem('role', res.role);
    if (res.customer_id) {
      localStorage.setItem('customer_id', String(res.customer_id));
    }
    const me = await api.getMe();
    setUser(me);
    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('customer_id');
    setUser(null);
  }, []);

  const role = user?.role || localStorage.getItem('role');

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, role }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
