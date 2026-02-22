import { useState, useEffect, useRef } from 'react';

function useTypewriter(text, shouldAnimate, speed = 18) {
  const [displayed, setDisplayed] = useState(shouldAnimate ? '' : text);
  const [done, setDone]           = useState(!shouldAnimate);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!shouldAnimate) { setDisplayed(text); setDone(true); return; }
    let idx = 0;
    setDisplayed(''); setDone(false);
    const tick = () => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx < text.length) {
        const ch    = text[idx - 1];
        const delay = (ch === '.' || ch === '!' || ch === '?') ? speed * 8
                    : ch === ','                                ? speed * 4 : speed;
        timerRef.current = setTimeout(tick, delay);
      } else { setDone(true); }
    };
    timerRef.current = setTimeout(tick, speed);
    return () => clearTimeout(timerRef.current);
  }, [text, shouldAnimate]);

  return { displayed, done };
}

export default function MessageBubble({ message, animate }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const shouldAnimate = animate === true && !isUser && !message.fromHistory;
  const { displayed, done } = useTypewriter(message.content, shouldAnimate, 18);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12,
      flexDirection: isUser ? 'row-reverse' : 'row',
      animation: 'ow-slide-up 0.25s ease-out',
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
          background: 'linear-gradient(135deg,rgba(0,194,255,0.2),rgba(0,119,255,0.2))',
          border: '1px solid rgba(0,194,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src="https://erpsolutions.oodles.io/wp-content/themes/ERP/custom_inc/image/home/erp_new_logo.png"
            style={{ width: 20, objectFit: 'contain' }}
            onError={e => e.target.style.display = 'none'} alt="AI" />
        </div>
      )}

      <div style={{ maxWidth: '78%', position: 'relative' }}>
        <div style={{
          padding: '10px 14px', fontSize: 13, lineHeight: 1.55, wordBreak: 'break-word', whiteSpace: 'pre-wrap',
          background:   isUser ? 'linear-gradient(135deg,#00c2ff,#0077ff)' : 'rgba(255,255,255,0.05)',
          color:        isUser ? '#0d1b2a' : '#e8f4fd',
          border:       isUser ? 'none' : '1px solid rgba(0,194,255,0.12)',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          fontWeight:   isUser ? 500 : 400,
        }}>
          {displayed}
          {!done && (
            <span style={{
              display: 'inline-block', width: 2, height: 14, marginLeft: 2,
              verticalAlign: 'middle', borderRadius: 2, background: '#00c2ff',
              animation: 'ow-blink 0.7s step-end infinite',
            }} />
          )}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
          justifyContent: isUser ? 'flex-end' : 'flex-start', opacity: 0.6,
        }}>
          <span style={{ fontSize: 10, color: '#7a9bb5' }}>{time}</span>
          {done && (
            <button onClick={handleCopy}
              style={{ fontSize: 11, color: '#7a9bb5', background: 'none', border: 'none',
                cursor: 'pointer', padding: 0 }}>
              {copied ? '✓' : '⧉'}
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: 'rgba(0,194,255,0.15)', color: '#00c2ff',
          border: '1px solid rgba(0,194,255,0.2)', fontSize: 11, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>U</div>
      )}
    </div>
  );
}
