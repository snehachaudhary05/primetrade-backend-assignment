const BASE_URL = '/api/v1';

const getToken = () => localStorage.getItem('token');

const clearAuthAndRedirect = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    // Token expired or invalid — clear session and redirect to login
    if (res.status === 401) {
      clearAuthAndRedirect();
      return;
    }
    const msg = data.message || 'An error occurred.';
    const err = new Error(msg);
    err.errors = data.errors;
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  get: (url) => request(url),
  post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  patch: (url, body) => request(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: 'DELETE' }),
};
