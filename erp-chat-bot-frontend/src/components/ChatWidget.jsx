import { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import LeadForm from './LeadForm';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import { useChat } from '../hooks/useChat';

export default function ChatWidget() {
  const [open, setOpen]     = useState(false);
  const [unread, setUnread] = useState(0);
  const [pulse, setPulse]   = useState(true);
  const scrollRef           = useRef(null);

  const {
    messages, sessionName, isTyping, isSending, isLoading, error,
    hasSession, animatedIds, sendMessage, startNewConversation,
    messagesEndRef, clearError,
  } = useChat();

  // Scroll to bottom when opened or new messages arrive
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages, isTyping]);

  useEffect(() => {
    if (!open && messages.length > 0) setUnread(u => u + 1);
  }, [messages.length]);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const handleOpen = () => { setOpen(true); setUnread(0); };

  return (
    <>
      {/* ✅ Backdrop — pointer-events-none so it doesn't catch hover on main page
          Only blocks clicks (via onClick) when open */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{
            background: 'rgba(13,27,42,0.65)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
          }}
          onClick={() => setOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

        {/* Chat panel */}
        <div
          className={`transition-all duration-300 ease-out origin-bottom-right
            w-[390px] max-w-[calc(100vw-2rem)] rounded-2xl flex flex-col
            ${open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-6 pointer-events-none'}`}
          style={{
            height: '580px',
            maxHeight: 'calc(100vh - 6rem)',
            background: '#0d1b2a',
            border: '1px solid rgba(0,194,255,0.2)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(0,194,255,0.1)',
            // ✅ overflow hidden on the panel itself — children handle their own scroll
            overflow: 'hidden',
          }}
        >
          {/* Header — fixed height */}
          <ChatHeader
            sessionName={sessionName}
            messageCount={messages.length}
            onClose={() => setOpen(false)}
            onNewConversation={startNewConversation}
          />

          {/* Error toast — fixed height */}
          {error && (
            <div className="mx-3 mt-2 px-3 py-2 rounded-xl text-xs flex items-center justify-between flex-shrink-0"
              style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', color: '#ff6b7a' }}>
              <span>⚠️ {error}</span>
              <button onClick={clearError} className="ml-2 opacity-70 hover:opacity-100">✕</button>
            </div>
          )}

          {/* ✅ Body fills remaining space */}
          {!hasSession ? (
            // LeadForm handles its own internal scroll
            <LeadForm onSubmit={({ leadData, query }) => sendMessage({ query, leadData })} />
          ) : (
            <>
              {/* ✅ Messages — flex-1 + overflow scroll */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4"
                style={{
                  minHeight: 0,
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(0,194,255,0.2) transparent',
                }}
              >
                {isLoading && (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="w-8 h-8 rounded-full border-2 animate-spin"
                      style={{ borderColor: 'rgba(0,194,255,0.15)', borderTopColor: '#00c2ff' }} />
                    <p className="text-xs" style={{ color: '#7a9bb5' }}>Loading your conversation…</p>
                  </div>
                )}

                {!isLoading && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden"
                      style={{ background: 'rgba(0,194,255,0.08)', border: '1px solid rgba(0,194,255,0.2)' }}>
                      <img
                        src="https://erpsolutions.oodles.io/wp-content/themes/ERP/custom_inc/image/home/erp_new_logo.png"
                        alt="ERP" className="w-12 object-contain"
                        onError={e => e.target.style.display = 'none'}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1 text-white">How can I help you today?</p>
                      <p className="text-xs" style={{ color: '#7a9bb5' }}>Ask me anything about ERP solutions</p>
                    </div>
                    {['ERP implementation timeline', 'Custom integration options', 'Pricing & plans'].map(q => (
                      <button key={q}
                        onClick={() => sendMessage({ query: q })}
                        className="w-full text-left px-4 py-2.5 rounded-xl text-xs transition-all duration-200 hover:scale-[1.02]"
                        style={{ background: 'rgba(0,194,255,0.05)', border: '1px solid rgba(0,194,255,0.12)', color: '#7a9bb5' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,194,255,0.35)'; e.currentTarget.style.color = '#00c2ff'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,194,255,0.12)'; e.currentTarget.style.color = '#7a9bb5'; }}>
                        → {q}
                      </button>
                    ))}
                  </div>
                )}

                {messages.map(m => (
                  <MessageBubble key={m.id} message={m} animate={animatedIds.has(m.id)} />
                ))}

                {/* Immediate spinner while waiting for API response */}
                {isSending && (
                  <div className="flex items-end gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ background: 'linear-gradient(135deg,rgba(0,194,255,0.2),rgba(0,119,255,0.2))', border: '1px solid rgba(0,194,255,0.25)' }}>
                      <img src="https://erpsolutions.oodles.io/wp-content/themes/ERP/custom_inc/image/home/erp_new_logo.png"
                        alt="AI" className="w-5 object-contain" onError={e => e.target.style.display='none'} />
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-3"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,194,255,0.12)' }}>
                      <div className="w-4 h-4 rounded-full border-2 animate-spin flex-shrink-0"
                        style={{ borderColor: 'rgba(0,194,255,0.2)', borderTopColor: '#00c2ff' }} />
                      <span className="text-xs" style={{ color: '#7a9bb5' }}>Thinking…</span>
                    </div>
                  </div>
                )}

                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Input — fixed at bottom */}
              <ChatInput onSend={q => sendMessage({ query: q })} disabled={isTyping || isSending} />
            </>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={open ? () => setOpen(false) : handleOpen}
          aria-label={open ? 'Close chat' : 'Open chat'}
          className="w-14 h-14 rounded-2xl flex items-center justify-center relative transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            background: open ? 'rgba(255,71,87,0.15)' : 'linear-gradient(135deg,#00c2ff,#0077ff)',
            border:     open ? '1px solid rgba(255,71,87,0.3)' : '1px solid rgba(0,194,255,0.4)',
            boxShadow:  !open ? '0 8px 30px rgba(0,194,255,0.4)' : 'none',
            animation:  !open && pulse ? 'glow-pulse 2s ease-in-out infinite' : 'none',
          }}>
          {open
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6b7a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d1b2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          }
          {unread > 0 && !open && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center border-2"
              style={{ background: '#ff4757', color: 'white', borderColor: '#0d1b2a' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Tooltip */}
        {!open && pulse && (
          <div className="absolute bottom-16 right-0 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap animate-slide-up"
            style={{ background: '#112240', border: '1px solid rgba(0,194,255,0.2)', color: '#00c2ff', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
            💬 Chat with ERP AI
            <div className="absolute bottom-[-5px] right-5 w-2.5 h-2.5 rotate-45"
              style={{ background: '#112240', borderRight: '1px solid rgba(0,194,255,0.2)', borderBottom: '1px solid rgba(0,194,255,0.2)' }} />
          </div>
        )}
      </div>
    </>
  );
}