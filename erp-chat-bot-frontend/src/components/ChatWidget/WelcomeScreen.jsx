// WelcomeScreen.jsx
// Replaces the old multi-step LeadForm.
// No name / email / phone fields — users start chatting immediately.
// The bot collects contact info naturally during conversation.

const STARTER_QUESTIONS = [
  'What ERP solutions does Oodles Technologies offer?',
  'How long does a typical ERP implementation take?',
  'Can you build a custom ERP for my industry?',
];

export default function WelcomeScreen({ onSend }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-6 text-center">

      {/* Avatar */}
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
        style={{
          background:  'linear-gradient(135deg, rgba(0,194,255,0.15), rgba(0,119,255,0.15))',
          border:      '1px solid rgba(0,194,255,0.2)',
          boxShadow:   '0 0 32px rgba(0,194,255,0.12)',
        }}>
        🤖
      </div>

      {/* Greeting */}
      <h3 className="font-bold text-white text-base mb-1">
        Hi there! I'm the Oodles AI Assistant
      </h3>
      <p className="text-xs leading-relaxed mb-6" style={{ color: '#4a9ab5', maxWidth: 280 }}>
        Ask me anything about our ERP solutions, services, or how we can help your business.
      </p>

      {/* Starter question chips */}
      <div className="w-full flex flex-col gap-2 mb-4">
        {STARTER_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSend(q)}
            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 hover:scale-[1.02]"
            style={{
              background:   'rgba(0,194,255,0.06)',
              border:       '1px solid rgba(0,194,255,0.15)',
              color:        '#c8dae8',
              lineHeight:   1.45,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor    = 'rgba(0,194,255,0.4)';
              e.currentTarget.style.background     = 'rgba(0,194,255,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor    = 'rgba(0,194,255,0.15)';
              e.currentTarget.style.background     = 'rgba(0,194,255,0.06)';
            }}>
            <span style={{ color: '#00c2ff', marginRight: 6 }}>→</span>
            {q}
          </button>
        ))}
      </div>

      <p className="text-xs" style={{ color: 'rgba(74,154,181,0.5)' }}>
        Or type your own question below
      </p>
    </div>
  );
}