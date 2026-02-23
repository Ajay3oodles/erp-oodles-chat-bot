import React, { useState, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import WelcomeScreen from './WelcomeScreen';

// Simple Spinner Component
const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0' }}>
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
    <div style={{
      width: '24px', height: '24px',
      borderRadius: '50%',
      border: '3px solid rgba(255,255,255,0.3)',
      borderTopColor: '#ffffff',
      animation: 'spin 0.8s linear infinite'
    }} />
  </div>
);

// Typing Dots Component
const TypingIndicator = () => (
  <div style={{
    alignSelf: 'flex-start',
    background: '#ffffff',
    padding: '12px 16px',
    borderRadius: '16px 16px 16px 4px',
    boxShadow: '0 2px 8px rgba(30,58,138,0.1)',
    border: '1px solid rgba(30,58,138,0.08)',
    marginBottom: '16px',
    width: 'fit-content',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }}>
    <style>{`
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
    `}</style>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: '8px', height: '8px',
        background: '#1a56db',
        borderRadius: '50%',
        animation: `bounce 1.4s infinite ease-in-out both`,
        animationDelay: `${i * 0.16}s`,
      }} />
    ))}
  </div>
);

export default function ChatWidget({ config }) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showTooltip, setShowTooltip] = useState(true);
  // Tracks whether the user has started a conversation
  const [conversationStarted, setConversationStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const {
    messages, sessionId, isTyping, isSending,
    isLoading, error, animatedIds, messagesEndRef,
    sendMessage, startNewConversation, clearError,
  } = useChat();

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleToggle = () => setOpen(prev => !prev);
    window.addEventListener('oodles:open', handleOpen);
    window.addEventListener('oodles:close', handleClose);
    window.addEventListener('oodles:toggle', handleToggle);
    return () => {
      window.removeEventListener('oodles:open', handleOpen);
      window.removeEventListener('oodles:close', handleClose);
      window.removeEventListener('oodles:toggle', handleToggle);
    };
  }, []);

  useEffect(() => {
    if (!open && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'bot' && !lastMsg.fromHistory) setUnreadCount(c => c + 1);
    }
  }, [messages, open]);

  const handleOpen = () => { setOpen(true); setUnreadCount(0); };

  // Hide WelcomeScreen immediately when user sends any message
  const handleSend = (query) => {
    if (!query?.trim()) return;
    setConversationStarted(true);
    sendMessage({ query });
  };

  const handleNewConversation = () => {
    setConversationStarted(false);
    startNewConversation();
  };

  // Show WelcomeScreen only when no conversation has started and no messages exist
  const showWelcome = !conversationStarted && !isLoading && messages.length === 0;

  return (
    <>
      {!open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          display: 'flex', alignItems: 'center', gap: 12,
          zIndex: 2147483647, fontFamily: '"Outfit", sans-serif'
        }}>
          {showTooltip && (
            <div style={{
              background: '#ffffff', borderRadius: 14,
              boxShadow: '0 4px 16px rgba(26, 86, 219, 0.18), 0 0 0 1px rgba(0,0,0,0.03)',
              padding: '10px 16px', fontSize: 13, color: '#1e293b',
              border: '1px solid #dbeafe',
              maxWidth: 240, display: 'flex', alignItems: 'center', gap: 8,
              whiteSpace: 'nowrap',
            }}>
              <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
              <span style={{ fontWeight: 500 }}>Hello! How can we help?</span>
            </div>
          )}
          <button onClick={handleOpen} aria-label="Open chat" style={{
            width: 64, height: 64, borderRadius: '50%', border: 'none',
            background: '#ffffff',
            boxShadow: '0 4px 20px rgba(26,86,219,0.3)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 10,
            position: 'relative', transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <img
              src="https://artificialintelligence.oodles.io/public/css/svg/icon.png"
              alt="Oodles AI"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 0, right: 0,
                width: 20, height: 20, borderRadius: '50%',
                background: '#ef4444', color: '#ffffff',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #fff'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          width: Math.min(380, window.innerWidth - 32),
          height: Math.min(600, window.innerHeight - 48),
          borderRadius: 16, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          background: '#dbeafe',
          boxShadow: '0 20px 50px rgba(26,86,219,0.2), 0 0 0 1px rgba(26,86,219,0.1)',
          fontFamily: '"Outfit", sans-serif',
          zIndex: 2147483647,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1a56db 100%)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                border: '2px solid rgba(255,255,255,0.7)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
                padding: 6,
              }}>
                <img
                  src="https://artificialintelligence.oodles.io/public/css/svg/icon.png"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  onError={e => { e.target.style.display = 'none'; }}
                  alt="Oodles AI"
                />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#ffffff' }}>ERP Solution</h3>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.3 }}>
                  Oodles Technologies
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={handleNewConversation} title="New conversation" style={{
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer', padding: 7, borderRadius: 8, color: 'rgba(255,255,255,0.85)',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
              </button>
              <button onClick={() => setOpen(false)} style={{
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer', padding: 7, borderRadius: 8, color: 'rgba(255,255,255,0.85)',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '20px',
            display: 'flex', flexDirection: 'column',
            background: '#dbeafe', scrollBehavior: 'smooth'
          }}>
            {isLoading && <Spinner />}

            {/* Welcome screen — shown only when no conversation has started */}
            {showWelcome && <WelcomeScreen onSend={handleSend} />}

            {/* Messages — only rendered after conversation starts */}
            {!isLoading && messages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                animate={animatedIds.has(msg.id)}
              />
            ))}

            {isTyping && <TypingIndicator />}

            {error && (
              <div style={{
                margin: '10px 0', padding: '12px', borderRadius: 8,
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#ef4444', fontSize: 13,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span>{error}</span>
                <button onClick={clearError} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>✕</button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput onSend={handleSend} disabled={isSending || isTyping || isLoading} />
        </div>
      )}
    </>
  );
}