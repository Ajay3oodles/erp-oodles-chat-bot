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
        background: '#f7f9fc',
      }}
    >
      <h3
        style={{
          fontWeight: 600,
          color: '#111827',
          fontSize: 15,
          margin: '0 0 4px',
        }}
      >
        Hi! I'm the OodlesERP Assistant
      </h3>
      <p
        style={{
          fontSize: 12,
          color: '#6b7280',
          lineHeight: 1.5,
          maxWidth: 260,
          margin: '0 0 18px',
        }}
      >
        Ask me anything about our ERP solutions, services, or how we can help
        your business.
      </p>

      {/* Single column list of starters, like Oodles dark screen */}
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
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              color: '#111827',
              boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                '0 2px 6px rgba(15,23,42,0.12)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.borderColor = '#cbd5f5';
              e.currentTarget.style.background = '#f3f4ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                '0 1px 2px rgba(15,23,42,0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.background = '#ffffff';
            }}
          >
            <span
              style={{
                display: 'inline-block',
                marginRight: 8,
                color: '#4f46e5',
                fontWeight: 500,
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
          color: '#9ca3af',
          margin: 0,
        }}
      >
        Or type your own question below
      </p>
    </div>
  );
}