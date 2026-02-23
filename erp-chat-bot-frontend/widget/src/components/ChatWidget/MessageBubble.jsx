// src/components/ChatWidget/MessageBubble.jsx
import React, { useState, useEffect, useRef } from 'react';

const TYPING_SPEED = 18; // ms per character

export default function MessageBubble({ message, animate }) {
  const isUser = message.role === 'user';

  const [displayed, setDisplayed] = useState(
    animate && !isUser ? '' : message.content
  );
  const indexRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!animate || isUser) return;
    indexRef.current = 0;
    setDisplayed('');
    const content = message.content || '';
    const tick = () => {
      if (indexRef.current < content.length) {
        indexRef.current += 1;
        setDisplayed(content.slice(0, indexRef.current));
        frameRef.current = setTimeout(tick, TYPING_SPEED);
      }
    };
    frameRef.current = setTimeout(tick, TYPING_SPEED);
    return () => clearTimeout(frameRef.current);
  }, [animate, isUser, message.content]);

  const stillTyping = animate && !isUser && displayed.length < (message.content || '').length;

  return (
    <div style={{
      display:'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems:'flex-end',
      gap:8, marginBottom:10,
    }}>
      {/* Bot avatar */}
      {!isUser && (
        <div style={{
          width:28, height:28, borderRadius:'50%',
          background:'#ffffff',
          border:'1.5px solid #c7dcf8',
          display:'flex', alignItems:'center', justifyContent:'center',
          flexShrink:0, padding:3,
          boxShadow:'0 1px 4px rgba(26,86,219,0.12)',
        }}>
          <img
            src="https://artificialintelligence.oodles.io/public/css/svg/icon.png"
            alt="AI"
            style={{ width:'100%', height:'100%', objectFit:'contain', display:'block' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth:'75%',
        padding:'9px 13px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser
          ? 'linear-gradient(135deg, #1a56db, #1565C0)'
          : '#ffffff',
        color: isUser ? '#ffffff' : '#1a237e',
        fontSize:13, lineHeight:1.55,
        boxShadow: isUser
          ? '0 2px 10px rgba(26,86,219,0.28)'
          : '0 2px 8px rgba(26,86,219,0.09)',
        border: isUser ? 'none' : '1px solid #dbeafe',
        wordBreak:'break-word', whiteSpace:'pre-wrap',
      }}>
        {displayed}
        {stillTyping && (
          <span style={{
            display:'inline-block', width:2, height:'1em',
            background:'#1a56db', marginLeft:2,
            verticalAlign:'text-bottom',
            animation:'ow-blink 0.7s step-end infinite',
          }} />
        )}
        <style>{`
          @keyframes ow-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        `}</style>
      </div>
    </div>
  );
}