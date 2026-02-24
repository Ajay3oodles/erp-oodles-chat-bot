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
        background: 'transparent',
      }}
    >
      <h3
        style={{
          fontWeight: 700,
          color: '#00457a',
          fontSize: 15.5,
          margin: '0 0 5px',
          letterSpacing: '-0.01em',
        }}
      >
        Hi! I'm the OodlesERP Assistant
      </h3>
      <p
        style={{
          fontSize: 12.5,
          color: '#1a6aaa',
          lineHeight: 1.55,
          maxWidth: 270,
          margin: '0 0 20px',
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
          gap: 9,
          marginBottom: 18,
        }}
      >
        {STARTER_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSend(q)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '11px 16px',
              borderRadius: 9999,
              fontSize: 12.5,
              lineHeight: 1.45,
              cursor: 'pointer',
              transition: 'box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease, background 0.18s ease',
              background: '#ffffff',
              border: '1.5px solid rgba(0,122,219,0.22)',
              color: '#00457a',
              boxShadow: '0 1px 5px rgba(0,122,219,0.09)',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,122,219,0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.borderColor = '#007ADB';
              e.currentTarget.style.background = '#e8f4ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 5px rgba(0,122,219,0.09)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(0,122,219,0.22)';
              e.currentTarget.style.background = '#ffffff';
            }}
          >
            <span
              style={{
                display: 'inline-block',
                marginRight: 8,
                color: '#007ADB',
                fontWeight: 700,
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
          fontSize: 11.5,
          color: '#1a6aaa',
          margin: 0,
          opacity: 0.85,
        }}
      >
        Or type your own question below
      </p>
    </div>
  );
}