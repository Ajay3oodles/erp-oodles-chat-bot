export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(0,194,255,0.2), rgba(0,119,255,0.2))', border: '1px solid rgba(0,194,255,0.25)' }}>
        <span style={{ fontSize:9, color:'#00c2ff', fontWeight:700 }}>AI</span>
      </div>
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,194,255,0.12)' }}>
        <span className="w-2 h-2 rounded-full dot-1" style={{ background: '#00c2ff', display:'inline-block' }} />
        <span className="w-2 h-2 rounded-full dot-2" style={{ background: '#00c2ff', display:'inline-block' }} />
        <span className="w-2 h-2 rounded-full dot-3" style={{ background: '#00c2ff', display:'inline-block' }} />
      </div>
    </div>
  );
}
