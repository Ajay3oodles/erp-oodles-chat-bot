import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

const SESSION_KEY = 'chatbot_session_id';
const TAB_KEY     = 'tab_active';

// ✅ The only reliable way to distinguish new tab vs reload:
// - sessionStorage is CLEARED when a new tab is opened fresh (typed URL / Ctrl+T)
// - sessionStorage is PRESERVED on both soft and hard reload
// So: if sessionStorage has TAB_KEY → same tab reloading → keep chat
//     if sessionStorage is empty    → new tab → show welcome
function isNewTab() {
  const active = sessionStorage.getItem(TAB_KEY);
  if (!active) {
    sessionStorage.setItem(TAB_KEY, '1');
    return true;
  }
  return false;
}

export function useChat() {
  const [messages, setMessages]       = useState([]);
  const [sessionId, setSessionId]     = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const [isSending, setIsSending]     = useState(false);
  const [error, setError]             = useState(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [animatedIds, setAnimatedIds] = useState(new Set());

  // ✅ New tab → clear localStorage → show welcome screen
  // Hard reload / soft reload → sessionStorage preserved → load chat
  const [hasSession, setHasSession] = useState(() => {
    if (isNewTab()) {
      localStorage.removeItem(SESSION_KEY);
      return false;
    }
    return !!localStorage.getItem(SESSION_KEY);
  });

  const messagesEndRef = useRef(null);
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  useEffect(() => {
    const storedId = localStorage.getItem(SESSION_KEY);
    if (storedId && hasSession) {
      setSessionId(parseInt(storedId, 10));
      loadHistory(parseInt(storedId, 10));
    }
  }, []);

  const loadHistory = async (sid) => {
    setIsLoading(true);
    try {
      const res   = await api.getChats(sid);
      const chats = Array.isArray(res) ? res : (res?.data || []);
      const mapped = chats.map((chat, index) => ({
        id:          `msg-${chat.id}`,
        role:        index % 2 === 0 ? 'user' : 'bot',
        content:     chat.message,
        timestamp:   chat.created_at,
        fromHistory: true,
      }));
      setMessages(mapped);
    } catch {
      setError('Could not load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async ({ query, leadData }) => {
    if (!query.trim()) return;

    setMessages(prev => [...prev, {
      id:          `u-${Date.now()}`,
      role:        'user',
      content:     query,
      timestamp:   new Date().toISOString(),
      fromHistory: false,
    }]);

    setIsSending(true);
    setIsTyping(true);
    setError(null);

    try {
      const currentSessionId = localStorage.getItem(SESSION_KEY)
        ? parseInt(localStorage.getItem(SESSION_KEY), 10)
        : null;

      const body = { query };
      if (currentSessionId) body.session_id = currentSessionId;
      else if (leadData) {
        body.first_name = leadData.name;
        body.email      = leadData.email;
        body.phone      = leadData.phone;
      }

      const res      = await api.sendQuery(body);
      const response = res?.data || res;

      if (response.session_id && !currentSessionId) {
        localStorage.setItem(SESSION_KEY, response.session_id);
        setSessionId(response.session_id);
        setHasSession(true);
        if (response.session_name) setSessionName(response.session_name);
      }

      const botMsgId = `b-${Date.now()}`;
      setIsSending(false);
      setAnimatedIds(prev => new Set([...prev, botMsgId]));
      setMessages(prev => [...prev, {
        id:          botMsgId,
        role:        'bot',
        content:     response.answer,
        timestamp:   new Date().toISOString(),
        fromHistory: false,
      }]);

    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const startNewConversation = async () => {
    const currentId = localStorage.getItem(SESSION_KEY);
    if (currentId) {
      try { await api.deleteSession(parseInt(currentId, 10)); } catch (_) {}
    }
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TAB_KEY); // so next load acts like new tab
    setSessionId(null);
    setMessages([]);
    setSessionName('');
    setHasSession(false);
    setError(null);
    setAnimatedIds(new Set());
  };

  return {
    messages, sessionId, sessionName, isTyping, isSending, isLoading,
    error, hasSession, animatedIds, sendMessage, startNewConversation,
    messagesEndRef, clearError: () => setError(null),
  };
}
