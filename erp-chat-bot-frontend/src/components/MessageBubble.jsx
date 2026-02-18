import { useState, useEffect, useRef } from 'react';

function useTypewriter(text, shouldAnimate, speed = 18) {
  const [displayed, setDisplayed] = useState(shouldAnimate ? '' : text);
  const [done, setDone]           = useState(!shouldAnimate);
  const timerRef = useRef(null);

  useEffect(() => {
    // ✅ If not animating, show full text immediately
    if (!shouldAnimate) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    let idx = 0;
    setDisplayed('');
    setDone(false);

    const tick = () => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx < text.length) {
        const ch    = text[idx - 1];
        const delay = (ch === '.' || ch === '!' || ch === '?') ? speed * 8
                    : ch === ','                                ? speed * 4
                    : speed;
        timerRef.current = setTimeout(tick, delay);
      } else {
        setDone(true);
      }
    };

    timerRef.current = setTimeout(tick, speed);
    return () => clearTimeout(timerRef.current);
  }, [text, shouldAnimate]);

  return { displayed, done };
}

export default function MessageBubble({ message, animate }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  // ✅ Only animate if explicitly told to AND not from history
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
    <div className={`flex items-end gap-2 mb-3 group msg-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: 'linear-gradient(135deg,rgba(0,194,255,0.2),rgba(0,119,255,0.2))', border: '1px solid rgba(0,194,255,0.25)' }}>
          <img src="https://erpsolutions.oodles.io/wp-content/themes/ERP/custom_inc/image/home/erp_new_logo.png"
            alt="AI" className="w-5 object-contain"
            onError={e => e.target.style.display = 'none'} />
        </div>
      )}

      <div className="relative max-w-[78%]">
        <div className="px-4 py-3 text-sm leading-relaxed"
          style={{
            background:   isUser ? 'linear-gradient(135deg,#00c2ff,#0077ff)' : 'rgba(255,255,255,0.05)',
            color:        isUser ? '#0d1b2a' : '#e8f4fd',
            border:       isUser ? 'none' : '1px solid rgba(0,194,255,0.12)',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontWeight: isUser ? 500 : 400,
          }}>
          {displayed}
          {!done && (
            <span className="inline-block w-0.5 h-4 ml-0.5 align-middle rounded-sm"
              style={{ background: '#00c2ff', animation: 'blink 0.7s step-end infinite' }} />
          )}
        </div>

        <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs" style={{ color: '#7a9bb5' }}>{time}</span>
          {done && (
            <button onClick={handleCopy} className="text-xs transition-colors" style={{ color: '#7a9bb5' }}
              onMouseEnter={e => e.target.style.color = '#00c2ff'}
              onMouseLeave={e => e.target.style.color = '#7a9bb5'}>
              {copied ? '✓ Copied' : '⧉'}
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
          style={{ background: 'rgba(0,194,255,0.15)', color: '#00c2ff', border: '1px solid rgba(0,194,255,0.2)' }}>
          U
        </div>
      )}
    </div>
  );
}