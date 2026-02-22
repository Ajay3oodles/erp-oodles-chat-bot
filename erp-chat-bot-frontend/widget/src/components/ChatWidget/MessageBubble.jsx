import React, { useState, useRef, useEffect } from 'react';

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
  const isUser = message.role === 'user';
  const shouldAnimate = animate === true && !isUser && !message.fromHistory;
  const { displayed, done } = useTypewriter(message.content, shouldAnimate, 18);

  const bubbleStyle = isUser ? {
    alignSelf: 'flex-end',
    background: '#ffffff',
    color: '#1e293b',
    borderRadius: '16px 16px 4px 16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  } : {
    alignSelf: 'flex-start',
    background: '#ffffff',
    color: '#1e293b',
    borderRadius: '16px 16px 16px 4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      marginBottom: '16px',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      animation: 'ow-slide-up 0.2s ease-out',
    }}>
      <div style={{
        maxWidth: '85%',
        padding: '12px 16px',
        fontSize: '14px',
        lineHeight: '1.6',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        fontWeight: 400,
        ...bubbleStyle,
      }}>
        {displayed}
        {!done && (
          <span style={{
            display: 'inline-block', width: 2, height: 14, marginLeft: 2,
            verticalAlign: 'middle', borderRadius: 2, background: '#94a3b8',
            animation: 'ow-blink 0.7s step-end infinite',
          }} />
        )}
      </div>
    </div>
  );
}