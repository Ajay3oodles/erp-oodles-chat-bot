import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

const SESSION_KEY = 'chatbot_session_id';

// ✅ On hard reload (Ctrl+Shift+R or Shift+F5), clear session so welcome screen shows
// window.performance.navigation.type === 1 means normal reload
// type === 0 means navigation (first visit or hard reload acts same in modern browsers)
// We use sessionStorage to detect hard reload vs soft reload
function isHardReload() {
  const visited = sessionStorage.getItem('app_visited');
  if (!visited) {
    // First visit or hard reload — sessionStorage is cleared on hard reload
    sessionStorage.setItem('app_visited', '1');
    return true;
  }
  return false;
}

export function useChat() {
  const [messages, setMessages]         = useState([]);
  const [sessionId, setSessionId]       = useState(null);
  const [sessionName, setSessionName]   = useState('');
  const [isTyping, setIsTyping]         = useState(false);
  const [error, setError]               = useState(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [animatedIds, setAnimatedIds]   = useState(new Set());
  const [isSending, setIsSending]       = useState(false);

  // ✅ On hard reload → clear localStorage so welcome screen shows
  // On soft reload (F5) → keep session and load history
  const [hasSession, setHasSession] = useState(() => {
    if (isHardReload()) {
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

  // Load history on mount if session exists (soft reload)
  useEffect(() => {
    const storedId = localStorage.getItem(SESSION_KEY);
    if (storedId) {
      setSessionId(parseInt(storedId, 10));
      loadHistory(parseInt(storedId, 10));
    }
  }, []);

  const loadHistory = async (sid) => {
    setIsLoading(true);
    try {
      const res   = await api.getChats(sid);
      const chats = Array.isArray(res) ? res : (res?.data || []);

      // Alternating rows: even index = user, odd index = bot
      const mapped = chats.map((chat, index) => ({
        id:          `msg-${chat.id}`,
        role:        index % 2 === 0 ? 'user' : 'bot',
        content:     chat.message,
        timestamp:   chat.created_at,
        fromHistory: true, // never animate history
      }));

      setMessages(mapped);
    } catch (e) {
      setError('Could not load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async ({ query, leadData }) => {
    if (!query.trim()) return;

    const userMsgId = `u-${Date.now()}`;
    setMessages(prev => [...prev, {
      id:          userMsgId,
      role:        'user',
      content:     query,
      timestamp:   new Date().toISOString(),
      fromHistory: false,
    }]);

    setIsSending(true);  // immediate spinner before API responds
    setIsTyping(true);
    setError(null);

    try {
      const currentSessionId = localStorage.getItem(SESSION_KEY)
        ? parseInt(localStorage.getItem(SESSION_KEY), 10)
        : null;

      const body = { query };
      if (currentSessionId)  body.session_id = currentSessionId;
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
      setIsSending(false);  // hide spinner, start typewriter
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
    sessionStorage.removeItem('app_visited'); // ✅ reset so next load detects fresh start
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