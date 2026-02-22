const STARTER_QUESTIONS = [
  'What ERP solutions does Oodles Technologies offer?',
  'How long does a typical ERP implementation take?',
  'Can you build a custom ERP for my industry?',
];

export default function WelcomeScreen({ onSend }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', padding: '24px 16px', textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16, marginBottom: 16,
        background: 'linear-gradient(135deg, rgba(0,194,255,0.15), rgba(0,119,255,0.15))',
        border: '1px solid rgba(0,194,255,0.2)',
        boxShadow: '0 0 32px rgba(0,194,255,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <img src="https://erpsolutions.oodles.io/wp-content/themes/ERP/custom_inc/image/home/erp_new_logo.png"
          style={{ width: 44, objectFit: 'contain' }}
          onError={e => e.target.style.display='none'} alt="ERP" />
      </div>

      <h3 style={{ fontWeight: 700, color: '#fff', fontSize: 15, margin: '0 0 8px' }}>
        Hi! I'm the OodlesERP Assistant
      </h3>
      <p style={{ fontSize: 12, color: '#4a9ab5', lineHeight: 1.5, maxWidth: 260, margin: '0 0 20px' }}>
        Ask me anything about our ERP solutions, services, or how we can help your business.
      </p>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {STARTER_QUESTIONS.map(q => (
          <button key={q} onClick={() => onSend(q)}
            style={{
              width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 12,
              fontSize: 12, lineHeight: 1.45, cursor: 'pointer', transition: 'all 0.15s',
              background: 'rgba(0,194,255,0.06)', border: '1px solid rgba(0,194,255,0.15)',
              color: '#c8dae8', fontFamily: 'Outfit, sans-serif',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,194,255,0.4)'; e.currentTarget.style.background='rgba(0,194,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(0,194,255,0.15)'; e.currentTarget.style.background='rgba(0,194,255,0.06)'; }}>
            <span style={{ color: '#00c2ff', marginRight: 8 }}>→</span>{q}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 11, color: 'rgba(74,154,181,0.5)', margin: 0 }}>Or type your own question below</p>
    </div>
  );
}
