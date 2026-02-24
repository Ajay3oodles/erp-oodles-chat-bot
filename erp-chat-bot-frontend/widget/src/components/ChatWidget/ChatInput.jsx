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
      padding: '12px 16px 14px',
      background: '#ffffff',
      borderTop: '1.5px solid rgba(0,122,219,0.12)',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 10,
        position: 'relative',
        background: '#e8f4ff',
        borderRadius: 26,
        border: '1.5px solid rgba(0,122,219,0.18)',
        padding: '4px 6px 4px 16px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: '0 1px 4px rgba(0,122,219,0.07)',
      }}
      onFocusCapture={e => {
        e.currentTarget.style.borderColor = '#007ADB';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,122,219,0.12)';
      }}
      onBlurCapture={e => {
        e.currentTarget.style.borderColor = 'rgba(0,122,219,0.18)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,122,219,0.07)';
      }}
      >
        <textarea ref={ref} value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          onInput={e => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
          }}
          disabled={disabled} rows={1} placeholder="Type here.."
          style={{
            flex: 1,
            background: 'transparent',
            outline: 'none',
            border: 'none',
            resize: 'none',
            maxHeight: 100,
            color: '#00457a',
            fontSize: 14,
            lineHeight: 1.5,
            padding: '8px 0',
            fontFamily: 'inherit',
          }}
        />
        <button onClick={handleSend} disabled={disabled || !text.trim()}
          style={{
            width: 38, height: 38, borderRadius: '50%', border: 'none', flexShrink: 0,
            cursor: text.trim() && !disabled ? 'pointer' : 'default',
            background: text.trim() && !disabled
              ? 'linear-gradient(135deg, #007ADB, #005fa3)'
              : 'rgba(0,122,219,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            color: text.trim() && !disabled ? '#ffffff' : '#7ec8f5',
            boxShadow: text.trim() && !disabled
              ? '0 2px 10px rgba(0,122,219,0.38)'
              : 'none',
          }}
          aria-label="Send"
        >
          {/* Paper-plane send icon */}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: 7 }}>
        <span style={{ fontSize: 10.5, color: '#7ec8f5', letterSpacing: '0.01em' }}>
          Powered by OodlesERP AI
        </span>
      </div>
    </div>
  );
}