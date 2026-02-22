import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

// ─────────────────────────────────────────────────────────────
// Tab detection — distinguishes new tab (clear session) from
// page reload (restore session from localStorage)
// ─────────────────────────────────────────────────────────────
function isNewTab() {
  const key = 'chatbot_tab_active';
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, '1');
    return true;   // brand-new tab → clear old session
  }
  return false;    // same tab reloading → restore session
}

// ─────────────────────────────────────────────────────────────
// useChat hook
// All state lives here. ChatWidget + MessageBubble are dumb.
// ─────────────────────────────────────────────────────────────
export function useChat() {
  const SESSION_KEY = 'chatbot_session_id';

  // ── State ──────────────────────────────────────────────────
  const [messages,     setMessages]     = useState([]);
  const [sessionId,    setSessionId]    = useState(null);
  const [sessionName,  setSessionName]  = useState('');
  const [isTyping,     setIsTyping]     = useState(false);   // bot thinking
  const [isSending,    setIsSending]    = useState(false);   // request in-flight
  const [isLoading,    setIsLoading]    = useState(false);   // loading history
  const [error,        setError]        = useState(null);
  const [animatedIds,  setAnimatedIds]  = useState(new Set());

  const messagesEndRef = useRef(null);

  // ── Init — restore or clear session ───────────────────────
  useEffect(() => {
    if (isNewTab()) {
      // New tab → start fresh, no history
      localStorage.removeItem(SESSION_KEY);
      return;
    }
    // Same tab reload → restore session and load history
    const storedId = localStorage.getItem(SESSION_KEY);
    if (storedId) {
      const id = parseInt(storedId, 10);
      setSessionId(id);
      loadHistory(id);
    }
  }, []); // eslint-disable-line

  // ── Auto-scroll ────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Load history on restore ────────────────────────────────
  const loadHistory = async (sid) => {
    setIsLoading(true);
    try {
      const res  = await api.getChats(sid);
      const data = Array.isArray(res) ? res : (res?.data || []);

      const mapped = data.map((chat, index) => ({
        id:          `hist-${chat.id}`,
        role:        index % 2 === 0 ? 'user' : 'bot',
        content:     chat.message,
        fromHistory: true,   // disables typewriter for old messages
        timestamp:   chat.created_at,
      }));
      setMessages(mapped);
    } catch (e) {
      console.error('[useChat] Failed to load history:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Send message ───────────────────────────────────────────
  // NOTE: leadData param is REMOVED.
  // The backend now extracts contact info from conversation naturally.
  const sendMessage = useCallback(async ({ query }) => {
    if (!query?.trim() || isSending) return;

    const userMsgId = `user-${Date.now()}`;

    // Optimistically append user message
    setMessages(prev => [...prev, {
      id:        userMsgId,
      role:      'user',
      content:   query.trim(),
      timestamp: new Date().toISOString(),
    }]);

    setIsSending(true);
    setIsTyping(true);
    setError(null);

    try {
      const body = { query: query.trim() };
      if (sessionId) body.session_id = sessionId;
      // ↑ No first_name / email / phone — removed entirely

      const raw = await api.sendQuery(body);
      // Backend wraps in { success, message, data: {...} } — unwrap it
      const res = raw?.data ?? raw;

      // Persist session ID (always returned now, not just on first message)
      if (res.session_id) {
        setSessionId(res.session_id);
        localStorage.setItem(SESSION_KEY, String(res.session_id));
      }
      if (res.session_name) {
        setSessionName(res.session_name);
      }

      const botMsgId = `bot-${Date.now()}`;

      setMessages(prev => [...prev, {
        id:        botMsgId,
        role:      'bot',
        content:   res.answer,
        timestamp: new Date().toISOString(),
      }]);

      // Mark for typewriter animation
      setAnimatedIds(prev => new Set([...prev, botMsgId]));

    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
      // Remove the optimistic user message on failure
      setMessages(prev => prev.filter(m => m.id !== userMsgId));
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  }, [sessionId, isSending]);

  // ── Start new conversation ─────────────────────────────────
  const startNewConversation = useCallback(async () => {
    if (sessionId) {
      try { await api.deleteSession(sessionId); } catch (_) {}
    }
    localStorage.removeItem(SESSION_KEY);
    setMessages([]);
    setSessionId(null);
    setSessionName('');
    setError(null);
    setAnimatedIds(new Set());
  }, [sessionId]);

  const clearError = useCallback(() => setError(null), []);

  return {
    // State
    messages,
    sessionId,
    sessionName,
    isTyping,
    isSending,
    isLoading,
    error,
    animatedIds,
    messagesEndRef,

    // Actions
    sendMessage,
    startNewConversation,
    clearError,
  };
}