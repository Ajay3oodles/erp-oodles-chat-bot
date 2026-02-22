// src/components/ChatWidget/index.jsx
import { useState, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import WelcomeScreen from './WelcomeScreen';

export default function ChatWidget({ config }) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const {
    messages, sessionId, isTyping, isSending,
    isLoading, error, animatedIds, messagesEndRef,
    sendMessage, startNewConversation, clearError,
  } = useChat();

  // Listen for external control events
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

  // Track unread messages
  useEffect(() => {
    if (!open && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'bot' && !lastMsg.fromHistory) {
        setUnreadCount(c => c + 1);
      }
    }
  }, [messages, open]);

  const handleOpen = () => {
    setOpen(true);
    setUnreadCount(0);
  };

  const handleSend = (query) => sendMessage({ query });
  const isEmpty = !isLoading && messages.length === 0;

  const primaryColor = config?.primaryColor || '#00c2ff';

  return (
    <>
      {/* Trigger Button */}
      {!open && (
        <button
          onClick={handleOpen}
          aria-label="Open chat"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: 'none',
            background: `linear-gradient(135deg, ${primaryColor}, #0077ff)`,
            boxShadow: `0 8px 32px ${primaryColor}66`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = `0 12px 40px ${primaryColor}88`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = `0 8px 32px ${primaryColor}66`;
          }}
        >
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 22,
              height: 22,
              padding: '0 6px',
              borderRadius: 11,
              background: '#ff4757',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #0a1628',
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: Math.min(400, window.innerWidth - 32),
          height: Math.min(600, window.innerHeight - 48),
          borderRadius: 20,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: '#0a1628',
          border: '1px solid rgba(0,194,255,0.15)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,194,255,0.1)',
          animation: 'ow-scale-in 0.2s ease-out',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(0,194,255,0.1) 0%, rgba(0,119,255,0.05) 100%)',
            borderBottom: '1px solid rgba(0,194,255,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #00c2ff, #0077ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,194,255,0.3)',
              }}>
                <img
                  src="https://erpsolutions.oodles.io/wp-content/themes/ERP/custom_inc/image/home/erp_new_logo.png"
                  style={{ width: 28, objectFit: 'contain' }}
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  alt="ERP"
                />
                <span style={{
                  display: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                }}>AI</span>
              </div>
              <div>
                <p style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  margin: 0,
                  lineHeight: 1.2,
                }}>OodlesERP Assistant</p>
                <p style={{
                  fontSize: 12,
                  color: isTyping ? '#00c2ff' : '#4a9ab5',
                  margin: '3px 0 0',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: isTyping ? '#00c2ff' : '#00e676',
                    display: 'inline-block',
                  }} />
                  {isTyping ? 'Typing…' : 'Online'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {messages.length > 0 && (
                <button
                  onClick={startNewConversation}
                  title="New conversation"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#7a9bb5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0,194,255,0.15)';
                    e.currentTarget.style.color = '#00c2ff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = '#7a9bb5';
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#7a9bb5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,71,87,0.15)';
                  e.currentTarget.style.color = '#ff4757';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = '#7a9bb5';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {isLoading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 0',
                gap: 10,
              }}>
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '2px solid rgba(0,194,255,0.2)',
                  borderTopColor: '#00c2ff',
                  animation: 'ow-spin 1s linear infinite',
                }} />
                <span style={{ fontSize: 13, color: '#4a9ab5' }}>Loading…</span>
              </div>
            )}

            {isEmpty && !isLoading && <WelcomeScreen onSend={handleSend} />}

            {!isLoading && messages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                animate={animatedIds.has(msg.id)}
              />
            ))}

            {isTyping && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 8,
                marginBottom: 12,
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: 'rgba(0,194,255,0.1)',
                  border: '1px solid rgba(0,194,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: '#00c2ff',
                  fontWeight: 700,
                }}>AI</div>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '18px 18px 18px 6px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(0,194,255,0.1)',
                }}>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: '#00c2ff',
                        display: 'inline-block',
                        animation: `ow-bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{
                margin: '8px 0 12px',
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(255,71,87,0.1)',
                border: '1px solid rgba(255,71,87,0.2)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: '#ff6b7a', margin: 0 }}>{error}</p>
                  <button
                    onClick={clearError}
                    style={{
                      fontSize: 12,
                      color: '#ff6b7a',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0,
                      marginTop: 6,
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={handleSend} disabled={isSending || isTyping || isLoading} />
        </div>
      )}
    </>
  );
}