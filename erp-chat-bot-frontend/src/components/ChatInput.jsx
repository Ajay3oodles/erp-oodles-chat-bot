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
    <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(0,194,255,0.1)', background: '#0d1b2a' }}>
      <div className="flex items-end gap-2 rounded-xl px-3 py-2 transition-all duration-200"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,194,255,0.15)' }}
        onFocus={() => {}} >
        <textarea ref={ref} value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }}
          disabled={disabled} rows={1} placeholder="Ask about ERP solutions…"
          style={{ flex:1, background:'transparent', outline:'none', resize:'none', maxHeight:100,
            color:'#e8f4fd', fontSize:13, lineHeight:1.5, fontFamily:'Outfit, sans-serif',
          }}
          className="placeholder-gray-600"
        />
        <button onClick={handleSend} disabled={disabled || !text.trim()}
          aria-label="Send message"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          style={{ background: text.trim() && !disabled ? 'linear-gradient(135deg, #00c2ff, #0077ff)' : 'rgba(255,255,255,0.08)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={text.trim() && !disabled ? '#0d1b2a' : '#7a9bb5'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/>
          </svg>
        </button>
      </div>
      <p className="text-center text-xs mt-2" style={{ color: 'rgba(122,155,181,0.5)' }}>
        Powered by OodlesERP AI · Enter to send
      </p>
    </div>
  );
}