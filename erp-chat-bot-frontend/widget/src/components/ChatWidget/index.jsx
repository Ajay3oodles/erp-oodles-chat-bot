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
      border: '3px solid #e2e8f0',
      borderTopColor: '#3b82f6',
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
    borderRadius: '16px 16px 16px 4px', // Bot shape
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
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
        background: '#94a3b8',
        borderRadius: '50%',
        animation: `bounce 1.4s infinite ease-in-out both ${i * 0.16}s`
      }} />
    ))}
  </div>
);

export default function ChatWidget({ config }) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
  const handleSend = (query) => sendMessage({ query });
  const isEmpty = !isLoading && messages.length === 0;

  return (
    <>
      {!open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          display: 'flex', alignItems: 'center', gap: 12,
          zIndex: 2147483647, fontFamily: '"Outfit", sans-serif'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: 14,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.02)',
            padding: '10px 16px', fontSize: 13, color: '#1e293b',
            border: '1px solid #f1f5f9',
            maxWidth: 240, display: 'flex', alignItems: 'center', gap: 8,
            animation: 'ow-scale-in 0.3s ease-out'
          }}>
            <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontWeight: 500 }}>Hello! How can we help?</span>
          </div>
          <button onClick={handleOpen} aria-label="Open chat" style={{
            width: 56, height: 56, borderRadius: '50%', border: 'none',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
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
          background: '#f8fafc',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
          animation: 'ow-scale-in 0.2s ease-out',
          fontFamily: '"Outfit", sans-serif',
          zIndex: 2147483647,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', background: '#ffffff',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 18, fontWeight: 700,
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
              }}>
                 <img
                  src="https://erpsolutions.oodles.io/wp-content/themes/ERP/custom_inc/image/home/erp_new_logo.png"
                  style={{ width: 24, height: 24, objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                  onError={e => { e.target.style.display='none'; }}
                  alt="AI"
                />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>OodlesERP Assistant</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: 12, color: '#64748b' }}>{isTyping ? 'Typing...' : 'Online'}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={startNewConversation} title="New conversation" style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: 8, borderRadius: 8, color: '#94a3b8',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
              </button>
              <button onClick={() => setOpen(false)} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: 8, borderRadius: 8, color: '#94a3b8',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '20px',
            display: 'flex', flexDirection: 'column',
            background: '#f8fafc', scrollBehavior: 'smooth'
          }}>
            {isLoading && <Spinner />}

            {isEmpty && !isLoading && <WelcomeScreen onSend={handleSend} />}

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