import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

function getSessionKey() {
  const clientId = window.__OODLES_CONFIG__?.clientId || 'default';
  return `oodles_session_${clientId}`;
}

function isNewTab() {
  const key = `oodles_tab_${window.__OODLES_CONFIG__?.clientId || 'default'}`;
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, '1');
    return true;
  }
  return false;
}

export function useChat() {
  const [messages,    setMessages]    = useState([]);
  const [sessionId,   setSessionId]   = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [isTyping,    setIsTyping]    = useState(false);
  const [isSending,   setIsSending]   = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState(null);
  const [animatedIds, setAnimatedIds] = useState(new Set());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isNewTab()) {
      localStorage.removeItem(getSessionKey());
      return;
    }
    const storedId = localStorage.getItem(getSessionKey());
    if (storedId) {
      const id = parseInt(storedId, 10);
      setSessionId(id);
      loadHistory(id);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async (sid) => {
    setIsLoading(true);
    try {
      const raw  = await api.getChats(sid);
      const res  = raw?.data ?? raw;
      const list = Array.isArray(res) ? res : (res?.data || []);
      setMessages(list.map((chat, i) => ({
        id:          `hist-${chat.id}`,
        role:        i % 2 === 0 ? 'user' : 'bot',
        content:     chat.message,
        fromHistory: true,
        timestamp:   chat.created_at,
      })));
    } catch (e) {
      console.error('[useChat] history load failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(async ({ query }) => {
    if (!query?.trim() || isSending) return;

    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: userMsgId, role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString()
    }]);
    setIsSending(true);
    setIsTyping(true);
    setError(null);

    try {
      const body = { query: query.trim() };
      if (sessionId) body.session_id = sessionId;

      const raw = await api.sendQuery(body);
      const res = raw?.data ?? raw;

      if (res.session_id) {
        setSessionId(res.session_id);
        localStorage.setItem(getSessionKey(), String(res.session_id));
      }
      if (res.session_name) setSessionName(res.session_name);

      const botMsgId = `bot-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: botMsgId, role: 'bot',
        content: res.answer,
        timestamp: new Date().toISOString()
      }]);
      setAnimatedIds(prev => new Set([...prev, botMsgId]));

    } catch (e) {
      setError(e.message || 'Something went wrong.');
      setMessages(prev => prev.filter(m => m.id !== userMsgId));
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  }, [sessionId, isSending]);

  const startNewConversation = useCallback(async () => {
    if (sessionId) {
      try { await api.deleteSession(sessionId); } catch (_) {}
    }
    localStorage.removeItem(getSessionKey());
    setMessages([]);
    setSessionId(null);
    setSessionName('');
    setError(null);
    setAnimatedIds(new Set());
  }, [sessionId]);

  return {
    messages, sessionId, sessionName,
    isTyping, isSending, isLoading,
    error, animatedIds, messagesEndRef,
    sendMessage,
    startNewConversation,
    clearError: () => setError(null),
  };
}
