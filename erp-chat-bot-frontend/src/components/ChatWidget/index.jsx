import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import MessageBubble  from './MessageBubble';
import ChatInput      from './ChatInput';
import WelcomeScreen  from './WelcomeScreen';

// ─────────────────────────────────────────────────────────────
// ChatWidget — floating chat panel
// No LeadForm gate. Users start chatting immediately.
// Lead info is collected naturally by the bot during conversation.
// ─────────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [open,       setOpen]       = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const {
    messages,
    sessionId,
    isTyping,
    isSending,
    isLoading,
    error,
    animatedIds,
    messagesEndRef,
    sendMessage,
    startNewConversation,
    clearError,
  } = useChat();

  // Track unread messages when widget is closed
  useEffect(() => {
    if (!open && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'bot' && !lastMsg.fromHistory) {
        setUnreadCount(c => c + 1);
      }
    }
  }, [messages]); // eslint-disable-line

  const handleOpen = () => {
    setOpen(true);
    setUnreadCount(0);
  };

  const handleSend = (query) => {
    sendMessage({ query });
    // No leadData — removed entirely
  };

  const isEmpty = !isLoading && messages.length === 0;

  return (
    <>
      {/* ── Floating trigger button ── */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background:   'linear-gradient(135deg, #00c2ff, #0077ff)',
            boxShadow:    '0 8px 32px rgba(0,194,255,0.4)',
          }}
          aria-label="Open chat">
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#ff4757', color: '#fff' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      )}

      {/* ── Chat panel ── */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{
            width:      380,
            height:     580,
            background: '#0a1628',
            border:     '1px solid rgba(0,194,255,0.15)',
            boxShadow:  '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,194,255,0.05)',
          }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: 'rgba(0,194,255,0.08)', borderBottom: '1px solid rgba(0,194,255,0.1)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                style={{ background: 'linear-gradient(135deg,#00c2ff,#0077ff)' }}>
                🤖
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">Oodles AI</p>
                <p className="text-xs mt-0.5" style={{ color: '#4a9ab5' }}>
                  {isTyping ? 'Typing…' : 'Online'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* New conversation */}
              {messages.length > 0 && (
                <button onClick={startNewConversation}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#7a9bb5' }}
                  title="Start new conversation">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              )}
              {/* Close */}
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#7a9bb5' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-3 py-3"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,194,255,0.15) transparent' }}>

            {/* Loading history spinner */}
            {isLoading && (
              <div className="flex items-center justify-center py-12 gap-3">
                <div className="w-5 h-5 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(0,194,255,0.2)', borderTopColor: '#00c2ff' }} />
                <span className="text-xs" style={{ color: '#4a9ab5' }}>Loading conversation…</span>
              </div>
            )}

            {/* Welcome screen — shown on fresh start with no messages */}
            {isEmpty && !isLoading && (
              <WelcomeScreen onSend={handleSend} />
            )}

            {/* Message list */}
            {!isLoading && messages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                animate={animatedIds.has(msg.id)}
              />
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs flex-shrink-0"
                  style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.2)' }}>
                  🤖
                </div>
                <div className="px-3 py-2.5 rounded-2xl rounded-bl-md"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,194,255,0.1)' }}>
                  <div className="flex items-center gap-1">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full"
                        style={{ background: '#00c2ff', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="mx-1 mb-3 px-3 py-2.5 rounded-xl flex items-start gap-2"
                style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)' }}>
                <span className="text-sm">⚠️</span>
                <div className="flex-1">
                  <p className="text-xs" style={{ color: '#ff6b7a' }}>{error}</p>
                  <button onClick={clearError} className="text-xs mt-1 underline" style={{ color: '#ff6b7a' }}>Dismiss</button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput
            onSend={handleSend}
            disabled={isSending || isTyping || isLoading}
          />
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}