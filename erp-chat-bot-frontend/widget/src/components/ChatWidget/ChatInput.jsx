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
      padding: '16px',
      background: '#ffffff',
      borderTop: '1px solid #f1f5f9',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 10,
        position: 'relative'
      }}>
        <textarea ref={ref} value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }}
          disabled={disabled} rows={1} placeholder="Ask something..."
          style={{
            flex: 1,
            background: 'transparent',
            outline: 'none',
            border: 'none',
            resize: 'none',
            maxHeight: 100,
            color: '#334155',
            fontSize: 14,
            lineHeight: 1.5,
            padding: '8px 0',
            fontFamily: 'inherit',
          }}
        />
        <button onClick={handleSend} disabled={disabled || !text.trim()}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: 'none', flexShrink: 0,
            cursor: text.trim() && !disabled ? 'pointer' : 'default',
            background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            opacity: disabled ? 0.5 : 1,
            color: text.trim() && !disabled ? '#4f46e5' : '#cbd5e1',
          }}
          aria-label="Send"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 6 }}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>Powered by OodlesERP AI</span>
      </div>
    </div>
  );
}