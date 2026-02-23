import React, { useState, useRef } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');
  const ref = useRef(null);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
    if (ref.current) { ref.current.style.height = 'auto'; ref.current.focus(); }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{
      padding: '12px 16px',
      /* ── white input bar like Image 2 ── */
      background: '#ffffff',
      borderTop: '1.5px solid rgba(26,86,219,0.12)',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 10,
        position: 'relative',
        background: '#f0f7ff',
        borderRadius: 24,
        border: '1.5px solid rgba(26,86,219,0.15)',
        padding: '4px 6px 4px 14px',
        transition: 'border-color 0.2s',
      }}
      onFocusCapture={e => e.currentTarget.style.borderColor = '#1a56db'}
      onBlurCapture={e => e.currentTarget.style.borderColor = 'rgba(26,86,219,0.15)'}
      >
        <textarea ref={ref} value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }}
          disabled={disabled} rows={1} placeholder="Type here.."
          style={{
            flex: 1,
            background: 'transparent',
            outline: 'none',
            border: 'none',
            resize: 'none',
            maxHeight: 100,
            color: '#1e3a8a',
            fontSize: 14,
            lineHeight: 1.5,
            padding: '7px 0',
            fontFamily: 'inherit',
          }}
        />
        <button onClick={handleSend} disabled={disabled || !text.trim()}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: 'none', flexShrink: 0,
            cursor: text.trim() && !disabled ? 'pointer' : 'default',
            /* ── blue send button when active ── */
            background: text.trim() && !disabled
              ? 'linear-gradient(135deg, #1a56db, #1e3a8a)'
              : 'rgba(26,86,219,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            color: text.trim() && !disabled ? '#ffffff' : '#93c5fd',
          }}
          aria-label="Send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 6 }}>
        <span style={{ fontSize: 10, color: '#93c5fd' }}>Powered by OodlesERP AI</span>
      </div>
    </div>
  );
}