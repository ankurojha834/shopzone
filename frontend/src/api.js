const BASE = '/api';

async function apiFetch(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Products
  getProducts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch(`/products${q ? '?' + q : ''}`);
  },
  getProduct: (id) => apiFetch(`/products/${id}`),
  getCategories: () => apiFetch('/categories'),

  // AI Search
  smartSearch: (q) => apiFetch(`/smart-search?q=${encodeURIComponent(q)}`),

  // Cart
  getCart: () => apiFetch('/cart'),
  addToCart: (productId, quantity = 1) =>
    apiFetch('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (productId, quantity) =>
    apiFetch(`/cart/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeFromCart: (productId) =>
    apiFetch(`/cart/${productId}`, { method: 'DELETE' }),

  // Orders
  placeOrder: () => apiFetch('/orders', { method: 'POST' }),
  getOrders: () => apiFetch('/orders'),

  // Auth
  auth: (endpoint, body) =>
    apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }),
};
