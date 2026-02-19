export default function ChatHeader({ sessionName, messageCount, onClose }) {
  return (
    <div className="relative flex items-center gap-3 px-4 py-3 flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #112240 50%, #0d1b2a 100%)', borderBottom: '1px solid rgba(0,194,255,0.15)' }}>

      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-t-2xl opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,194,255,0.03) 2px, rgba(0,194,255,0.03) 4px)',
        }} />
      </div>

      {/* Logo / Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(0,194,255,0.2), rgba(0,119,255,0.2))', border: '1px solid rgba(0,194,255,0.3)' }}>
          <img
            src="https://erpsolutions.oodles.io/wp-content/themes/ERP/custom_inc/image/home/erp_new_logo.png"
            alt="ERP"
            className="w-8 object-contain"
            onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
          />
          <span style={{display:'none', color:'#00c2ff', fontWeight:700, fontSize:13}}>ERP</span>
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
          style={{ background: '#00e676', borderColor: '#0d1b2a' }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-sm truncate" style={{ color: '#e8f4fd' }}>
          {sessionName || 'OodlesERP Assistant'}
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00e676' }} />
          <p className="text-xs" style={{ color: '#7a9bb5' }}>
            {messageCount > 0 ? `${messageCount} messages` : 'Online · Instant responses'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button onClick={onClose} title="Close"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ color: '#7a9bb5', background: 'rgba(0,194,255,0.05)' }}
          onMouseEnter={e => { e.currentTarget.style.color='#ff4757'; e.currentTarget.style.background='rgba(255,71,87,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color='#7a9bb5'; e.currentTarget.style.background='rgba(0,194,255,0.05)'; }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
