const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Chat
  sendQuery:     (body)      => request('/api/chat-bot/v1/query/', { method: 'POST', body: JSON.stringify(body) }),
  getChats:      (sessionId) => request(`/api/chat-bot/v1/sessions/${sessionId}/chats/`),
  getSessions:   ()          => request('/api/chat-bot/v1/sessions/'),
  deleteSession: (sessionId) => request(`/api/chat-bot/v1/sessions/${sessionId}/`, { method: 'DELETE' }),

  // Documents
  getDocuments:   ()         => request('/api/chat-bot/v1/documents/'),
  uploadDocument: (formData) => request('/api/chat-bot/v1/upload/', { method: 'POST', body: formData }),
  deleteDocument: (id)       => request(`/api/chat-bot/v1/documents/${id}/`, { method: 'DELETE' }),
  downloadDocument: (id)     => `${BASE_URL}/api/chat-bot/v1/documents/${id}/download/`,

  // Leads
  getLeads: () => request('/api/chat-bot/v1/leads/'),
};