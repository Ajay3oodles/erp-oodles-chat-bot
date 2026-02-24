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
      border: '3px solid rgba(0,122,219,0.2)',
      borderTopColor: '#007ADB',
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
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.06)',
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
        background: '#007ADB',
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

  // Mark conversation as started if messages were loaded from history
  useEffect(() => {
    if (messages.length > 0 && !isLoading && !conversationStarted) {
      setConversationStarted(true);
    }
  }, [messages, isLoading, conversationStarted]);

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
  const showWelcome = !conversationStarted && messages.length === 0;

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      {!open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          display: 'flex', alignItems: 'center', gap: 12,
          zIndex: 2147483647, fontFamily: '"Outfit", sans-serif'
        }}>
          {showTooltip && (
            <div style={{
              background: '#ffffff', borderRadius: 14,
              boxShadow: '0 4px 16px rgba(37,99,235,0.18), 0 0 0 1px rgba(0,0,0,0.03)',
              padding: '10px 16px', fontSize: 13, color: '#1e293b',
              border: '1px solid #dbeafe',
              maxWidth: 240, display: 'flex', alignItems: 'center', gap: 8,
              whiteSpace: 'nowrap',
            }}>
              <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
              <span style={{ fontWeight: 500 }}>Hello! How can we help?</span>
            </div>
          )}

          {/* Trigger: white circle with vivid blue glow ring — matches Image 1 */}
          <button onClick={handleOpen} aria-label="Open chat" style={{
            width: 64, height: 64, borderRadius: '50%', border: 'none',
            background: '#ffffff',
            boxShadow: '0 0 0 3px #007ADB, 0 0 20px 6px rgba(0,122,219,0.6), 0 4px 20px rgba(0,0,0,0.15)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 10, position: 'relative',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = '0 0 0 3px #007ADB, 0 0 30px 10px rgba(0,122,219,0.7), 0 4px 24px rgba(0,0,0,0.18)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 0 3px #007ADB, 0 0 20px 6px rgba(0,122,219,0.6), 0 4px 20px rgba(0,0,0,0.15)';
          }}
          >
            <img
              src="https://artificialintelligence.oodles.io/public/css/svg/icon.png"
              alt="Oodles AI"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -2, right: -2,
                width: 20, height: 20, borderRadius: '50%',
                background: '#ef4444', color: '#ffffff',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #fff',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ── Chat Panel ── */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          /* Exact dimensions: 386×558, responsive on small screens */
          width: 'min(386px, calc(100vw - 24px))',
          height: 'min(558px, calc(100vh - 48px))',
          borderRadius: 20, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          background: '#f0f4ff',
          boxShadow: '0 24px 64px rgba(0,122,219,0.22), 0 0 0 1px rgba(0,122,219,0.1)',
          fontFamily: '"Outfit", sans-serif',
          zIndex: 2147483647,
        }}>

          {/* ── Header ── */}
          <div style={{ position: 'relative', flexShrink: 0, zIndex: 2 }}>
            {/* Bright blue gradient — matches Image 1 exactly */}
            <div style={{
              background: 'linear-gradient(135deg, #0066c0 0%, #007ADB 50%, #2196f3 100%)',
              padding: '18px 18px 22px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderRadius: '20px 20px 0 0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

                {/* Logo — exact specified properties: padding:6px h:60px w:71px border-radius:50% bg:#fff */}
                <div style={{
                  padding: '6px',
                  height: '60px',
                  width: '71px',
                  borderRadius: '50%',
                  background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
                  overflow: 'hidden',
                }}>
                  <img
                    src="https://artificialintelligence.oodles.io/public/css/svg/icon.png"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                    onError={e => { e.target.style.display = 'none'; }}
                    alt="ERP"
                  />
                </div>

                {/* ERP branding */}
                <div>
                  <h3 style={{
                    margin: 0, fontSize: 16, fontWeight: 700,
                    color: '#ffffff', letterSpacing: '-0.01em',
                  }}>
                    ERP Solution
                  </h3>
                  <p style={{
                    margin: '3px 0 0', fontSize: 11.5,
                    color: 'rgba(255,255,255,0.82)', lineHeight: 1.35,
                  }}>
                    Oodles Technologies
                  </p>
                </div>
              </div>

              {/* Close button only — matches Image 1 (single ✕) */}
              <button onClick={() => setOpen(false)} style={{
                width: 30, height: 30,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background 0.18s',
                alignSelf: 'flex-start',
                marginTop: 2,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Very subtle curve — almost flat, like Image 2 reference */}
            <div style={{
              position: 'absolute', bottom: -1, left: 0, right: 0,
              lineHeight: 0, zIndex: 3,
            }}>
              <svg viewBox="0 0 380 12" preserveAspectRatio="none"
                style={{ width: '100%', height: 12, display: 'block' }}>
                <path d="M0,0 C190,12 190,12 380,0 L380,12 L0,12 Z" fill="#f0f4ff" />
              </svg>
            </div>
          </div>

          {/* ── Messages / Welcome Area ── */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '10px 18px 18px',
            display: 'flex', flexDirection: 'column',
            background: '#f0f4ff', scrollBehavior: 'smooth',
          }}>
            {/* Only show loading spinner during initial load, not on widget reopen */}
            {isLoading && messages.length === 0 && <Spinner />}

            {/* Welcome screen — shown only when no conversation has started */}
            {showWelcome && <WelcomeScreen onSend={handleSend} />}

            {/* Messages — render if they exist, even if still loading */}
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                animate={animatedIds.has(msg.id)}
              />
            ))}

            {isTyping && <TypingIndicator />}

            {error && (
              <div style={{
                margin: '10px 0', padding: '12px', borderRadius: 10,
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#ef4444', fontSize: 13,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span>{error}</span>
                <button onClick={clearError} style={{
                  border: 'none', background: 'transparent',
                  color: '#ef4444', cursor: 'pointer', fontWeight: 600,
                }}>✕</button>
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