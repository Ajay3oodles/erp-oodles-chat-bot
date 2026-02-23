// src/components/ChatWidget/WelcomeScreen.jsx

const STARTER_QUESTIONS = [
  'What ERP solutions does Oodles Technologies offer?',
  'How long does a typical ERP implementation take?',
  'Can you build a custom ERP for my industry?',
];

export default function WelcomeScreen({ onSend }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '20px 16px',
        textAlign: 'center',
        /* ── matches the light-blue chat background ── */
        background: 'transparent',
      }}
    >
      <h3
        style={{
          fontWeight: 600,
          color: '#1e3a8a',
          fontSize: 15,
          margin: '0 0 4px',
        }}
      >
        Hi! I'm the OodlesERP Assistant
      </h3>
      <p
        style={{
          fontSize: 12,
          color: '#3b5ea6',
          lineHeight: 1.5,
          maxWidth: 260,
          margin: '0 0 18px',
        }}
      >
        Ask me anything about our ERP solutions, services, or how we can help
        your business.
      </p>

      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          marginBottom: 16,
        }}
      >
        {STARTER_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSend(q)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '10px 14px',
              borderRadius: 9999,
              fontSize: 12,
              lineHeight: 1.45,
              cursor: 'pointer',
              transition:
                'box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
              /* ── white pills on blue bg, like Image 2 ── */
              background: '#ffffff',
              border: '1.5px solid rgba(26,86,219,0.2)',
              color: '#1e3a8a',
              boxShadow: '0 1px 4px rgba(26,86,219,0.1)',
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,86,219,0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.borderColor = '#1a56db';
              e.currentTarget.style.background = '#eff6ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(26,86,219,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(26,86,219,0.2)';
              e.currentTarget.style.background = '#ffffff';
            }}
          >
            <span
              style={{
                display: 'inline-block',
                marginRight: 8,
                color: '#1a56db',
                fontWeight: 600,
              }}
            >
              →
            </span>
            {q}
          </button>
        ))}
      </div>

      <p
        style={{
          fontSize: 11,
          color: '#3b5ea6',
          margin: 0,
        }}
      >
        Or type your own question below
      </p>
    </div>
  );
}