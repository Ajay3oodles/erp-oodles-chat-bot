// src/services/api.js

// Vite replaces this at BUILD TIME
// npm run dev   → reads from .env.development
// npm run build → reads from .env.production
const API_BASE = import.meta.env.VITE_API_BASE;

function getClientId() {
  if (window.__OODLES_CONFIG__?.clientId) {
    return window.__OODLES_CONFIG__.clientId;
  }
  if (window.OodlesWidgetConfig?.clientId) {
    return window.OodlesWidgetConfig.clientId;
  }
  return 'default';
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      'X-Client-ID': getClientId(),
      ...(options.headers || {}),
    },
  });

  if (res.status === 204) return null;

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  sendQuery:     (body) => request('/api/chat-bot/v1/query/', { method: 'POST', body: JSON.stringify(body) }),
  getChats:      (sid)  => request(`/api/chat-bot/v1/sessions/${sid}/chats/`),
  deleteSession: (sid)  => request(`/api/chat-bot/v1/sessions/${sid}/`, { method: 'DELETE' }),
};