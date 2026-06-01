const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const res = await fetch(url, config);
  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Products
  getProducts: () => request('/products/'),
  getProduct: (sku) => request(`/products/${sku}`),
  createProduct: (data) => request('/products/', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (sku, data) => request(`/products/${sku}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (sku) => request(`/products/${sku}`, { method: 'DELETE' }),

  // Customers
  getCustomers: () => request('/customers/'),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request('/customers/', { method: 'POST', body: JSON.stringify(data) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => request('/orders/'),
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (data) => request('/orders/', { method: 'POST', body: JSON.stringify(data) }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboard: () => request('/orders/dashboard'),

  // Health
  healthCheck: () => request('/health'),
};
