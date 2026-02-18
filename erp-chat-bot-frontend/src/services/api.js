const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  sendQuery: (body) =>
    request('/api/chat-bot/v1/query/', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getChats: (sessionId) =>
    request(`/api/chat-bot/v1/sessions/${sessionId}/chats/`),
  getSessions: () => request('/api/chat-bot/v1/sessions/'),
  deleteSession: (sessionId) =>
    request(`/api/chat-bot/v1/sessions/${sessionId}/`, { method: 'DELETE' }),
};