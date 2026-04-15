const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) =>
    request('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: (token) =>
    request('/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
};

// ── Guest ────────────────────────────────────────────────────────────────────
export const guestApi = {
  getRoom: (token) => request(`/api/v1/room/${token}`),
  getMenu: (token) => request(`/api/v1/room/${token}/menu`),
  getLocalInfo: () => request('/api/v1/local-info'),
  getRoomTickets: (token) => request(`/api/v1/room/${token}/tickets`),
  getTicket: (id) => request(`/api/v1/tickets/${id}`),

  createTicket: (roomToken, data) =>
    request('/api/v1/tickets', {
      method: 'POST',
      headers: { 'X-Room-Token': roomToken },
      body: JSON.stringify(data),
    }),

  rateTicket: (id, rating, feedback) =>
    request(`/api/v1/tickets/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback }),
    }),

  escalateTicket: (id) =>
    request(`/api/v1/tickets/${id}/escalate`, { method: 'POST' }),

  toggleDnd: (token, enabled, lift_at) =>
    request(`/api/v1/room/${token}/dnd`, {
      method: 'POST',
      headers: { 'X-Room-Token': token },
      body: JSON.stringify({ enabled, lift_at }),
    }),

  chat: (roomToken, message) =>
    request('/api/v1/concierge/chat', {
      method: 'POST',
      headers: { 'X-Room-Token': roomToken },
      body: JSON.stringify({ message }),
    }),
};

// ── Staff ────────────────────────────────────────────────────────────────────
function staffHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export const staffApi = {
  getMe: (token) => request('/api/v1/staff/me', { headers: staffHeaders(token) }),

  getTickets: (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/v1/staff/tickets${qs ? '?' + qs : ''}`, { headers: staffHeaders(token) });
  },

  getMyTickets: (token) =>
    request('/api/v1/staff/tickets/mine', { headers: staffHeaders(token) }),

  updateTicket: (token, id, data) =>
    request(`/api/v1/staff/tickets/${id}`, {
      method: 'PATCH',
      headers: staffHeaders(token),
      body: JSON.stringify(data),
    }),

  getRooms: (token) =>
    request('/api/v1/staff/rooms', { headers: staffHeaders(token) }),

  getLeaderboard: (token) =>
    request('/api/v1/staff/leaderboard', { headers: staffHeaders(token) }),
};

// ── Admin ────────────────────────────────────────────────────────────────────
function adminHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export const adminApi = {
  getMetrics: (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/v1/admin/metrics${qs ? '?' + qs : ''}`, { headers: adminHeaders(token) });
  },

  getRooms: (token) => request('/api/v1/admin/rooms', { headers: adminHeaders(token) }),
  createRoom: (token, data) =>
    request('/api/v1/admin/rooms', { method: 'POST', headers: adminHeaders(token), body: JSON.stringify(data) }),
  updateRoom: (token, id, data) =>
    request(`/api/v1/admin/rooms/${id}`, { method: 'PATCH', headers: adminHeaders(token), body: JSON.stringify(data) }),
  regenQr: (token, id) =>
    request(`/api/v1/admin/rooms/${id}/regen-qr`, { method: 'POST', headers: adminHeaders(token) }),
  downloadQrUrl: (id) => `${BASE_URL}/api/v1/admin/rooms/${id}/qr/download`,

  getStaff: (token) => request('/api/v1/admin/staff', { headers: adminHeaders(token) }),
  createStaff: (token, data) =>
    request('/api/v1/admin/staff', { method: 'POST', headers: adminHeaders(token), body: JSON.stringify(data) }),
  updateStaff: (token, id, data) =>
    request(`/api/v1/admin/staff/${id}`, { method: 'PATCH', headers: adminHeaders(token), body: JSON.stringify(data) }),

  getEscalations: (token, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/v1/admin/escalations${qs ? '?' + qs : ''}`, { headers: adminHeaders(token) });
  },

  getSlaSettings: (token) => request('/api/v1/admin/settings/sla', { headers: adminHeaders(token) }),
  updateSlaSettings: (token, data) =>
    request('/api/v1/admin/settings/sla', { method: 'PATCH', headers: adminHeaders(token), body: JSON.stringify(data) }),

  getLocalInfo: (token) => request('/api/v1/admin/local-info', { headers: adminHeaders(token) }),
  createLocalInfo: (token, data) =>
    request('/api/v1/admin/local-info', { method: 'POST', headers: adminHeaders(token), body: JSON.stringify(data) }),
  updateLocalInfo: (token, id, data) =>
    request(`/api/v1/admin/local-info/${id}`, { method: 'PATCH', headers: adminHeaders(token), body: JSON.stringify(data) }),
  deleteLocalInfo: (token, id) =>
    request(`/api/v1/admin/local-info/${id}`, { method: 'DELETE', headers: adminHeaders(token) }),
};
