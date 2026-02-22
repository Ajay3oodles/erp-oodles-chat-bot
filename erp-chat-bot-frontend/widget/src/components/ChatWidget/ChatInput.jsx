import { useState, useRef } from 'react';

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
    <div style={{ padding: 12, flexShrink: 0, borderTop: '1px solid rgba(0,194,255,0.1)', background: '#0d1b2a' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 8,
        borderRadius: 12, padding: '8px 12px',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,194,255,0.15)',
      }}>
        <textarea ref={ref} value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }}
          disabled={disabled} rows={1} placeholder="Ask about ERP solutions…"
          style={{
            flex: 1, background: 'transparent', outline: 'none', border: 'none',
            resize: 'none', maxHeight: 100, color: '#e8f4fd', fontSize: 13,
            lineHeight: 1.5, fontFamily: 'Outfit, sans-serif',
          }} />
        <button onClick={handleSend} disabled={disabled || !text.trim()}
          style={{
            width: 32, height: 32, borderRadius: 8, border: 'none', flexShrink: 0,
            cursor: text.trim() && !disabled ? 'pointer' : 'not-allowed',
            background: text.trim() && !disabled ? 'linear-gradient(135deg, #00c2ff, #0077ff)' : 'rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
            opacity: disabled ? 0.3 : 1,
          }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke={text.trim() && !disabled ? '#0d1b2a' : '#7a9bb5'}
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/>
          </svg>
        </button>
      </div>
      <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(122,155,181,0.4)', margin: '6px 0 0' }}>
        Powered by OodlesERP AI · Enter to send
      </p>
    </div>
  );
}
