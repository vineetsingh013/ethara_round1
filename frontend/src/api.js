const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { headers, ...options };

  const res = await fetch(url, config);
  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // Products
  getProducts: () => request('/products/'),
  getProduct: (sku) => request(`/products/${sku}`),
  createProduct: (data) => request('/products/', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (sku, data) => request(`/products/${sku}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (sku) => request(`/products/${sku}`, { method: 'DELETE' }),

  // Customers (admin)
  getCustomers: () => request('/customers/'),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request('/customers/', { method: 'POST', body: JSON.stringify(data) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),

  // My profile (customer)
  getMyProfile: () => request('/customers/me'),

  // Orders (admin)
  getOrders: () => request('/orders/'),
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (data) => request('/orders/', { method: 'POST', body: JSON.stringify(data) }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),

  // My orders (customer)
  getMyOrders: () => request('/orders/my/'),
  getMyOrder: (id) => request(`/orders/my/${id}`),
  createMyOrder: (data) => request('/orders/my/', { method: 'POST', body: JSON.stringify(data) }),
  requestCancelOrder: (id) => request(`/orders/my/${id}/cancel-request`, { method: 'POST' }),

  // Cancellation management (admin)
  approveCancellation: (id) => request(`/orders/${id}/approve-cancellation`, { method: 'POST' }),
  rejectCancellation: (id) => request(`/orders/${id}/reject-cancellation`, { method: 'POST' }),

  // Dashboard (admin)
  getDashboard: () => request('/orders/dashboard'),

  // Health
  healthCheck: () => request('/health'),
};
