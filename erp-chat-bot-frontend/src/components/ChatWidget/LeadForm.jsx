import { useState } from 'react';

const STEPS = [
  { field: 'name',  label: "What's your name?",         placeholder: 'Full name',     type: 'text',     emoji: '👋' },
  { field: 'email', label: 'Your email address?',        placeholder: 'Email address', type: 'email',    emoji: '📧' },
  { field: 'phone', label: 'Your phone number?',         placeholder: 'Phone number',  type: 'tel',      emoji: '📱' },
  { field: 'query', label: 'What can we help you with?', placeholder: 'Type your first question…', type: 'textarea', emoji: '💬' },
];

const LOADER_MESSAGES = [
  'Setting up your session…',
  'Connecting to ERP AI…',
  'Searching knowledge base…',
  'Preparing your answer…',
];

function BeautifulLoader() {
  const [msgIdx, setMsgIdx] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setMsgIdx(i => (i + 1) % LOADER_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">

      {/* Spinning rings */}
      <div className="relative w-20 h-20">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 animate-spin"
          style={{ borderColor: 'transparent', borderTopColor: '#00c2ff', animationDuration: '1s' }} />
        {/* Middle ring */}
        <div className="absolute inset-2 rounded-full border-2 animate-spin"
          style={{ borderColor: 'transparent', borderTopColor: 'rgba(0,194,255,0.5)', animationDuration: '1.5s', animationDirection: 'reverse' }} />
        {/* Inner ring */}
        <div className="absolute inset-4 rounded-full border-2 animate-spin"
          style={{ borderColor: 'transparent', borderTopColor: 'rgba(0,119,255,0.6)', animationDuration: '0.8s' }} />
        {/* Center logo */}
        <div className="absolute inset-6 rounded-full flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(0,194,255,0.1)' }}>
          <img
            src="https://erpsolutions.oodles.io/wp-content/themes/ERP/custom_inc/image/home/erp_new_logo.png"
            alt="ERP" className="w-6 object-contain"
            onError={e => e.target.style.display = 'none'}
          />
        </div>
      </div>

      {/* Pulsing dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#00c2ff',
              animation: 'dot-bounce 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`,
            }} />
        ))}
      </div>

      {/* Rotating status message */}
      <div>
        <p className="font-semibold text-sm mb-1" style={{ color: '#e8f4fd' }}>
          {LOADER_MESSAGES[msgIdx]}
        </p>
        <p className="text-xs" style={{ color: '#7a9bb5' }}>
          This usually takes a few seconds
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1 rounded-full overflow-hidden"
        style={{ background: 'rgba(0,194,255,0.1)' }}>
        <div className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #00c2ff, #0077ff)',
            animation: 'progress-fill 6s ease-out forwards',
          }} />
      </div>
    </div>
  );
}

export default function LeadForm({ onSubmit }) {
  const [started, setStarted]   = useState(false);
  const [step, setStep]         = useState(0);
  const [values, setValues]     = useState({ name: '', email: '', phone: '', query: '' });
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  const current = STEPS[step];
  const value   = values[current?.field] ?? '';
  const isLast  = step === STEPS.length - 1;

  const validate = () => {
    if (!value.trim()) return 'This field is required';
    if (current.field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return 'Please enter a valid email';
    return '';
  };

  const handleNext = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    if (isLast) {
      // ✅ Show loader immediately then call onSubmit
      setSubmitting(true);
      onSubmit({
        leadData: { name: values.name, email: values.email, phone: values.phone },
        query: values.query,
      });
    } else {
      setStep(s => s + 1);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && current.type !== 'textarea') {
      e.preventDefault();
      handleNext();
    }
    if (e.key === 'Enter' && current.type === 'textarea' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleNext();
    }
  };

  // ✅ Show beautiful loader while waiting for API
  if (submitting) {
    return <BeautifulLoader />;
  }

  /* ── WELCOME SCREEN ── */
  if (!started) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center justify-center px-6 pt-6 pb-8 text-center min-h-full">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 overflow-hidden flex-shrink-0"
            style={{ background: 'rgba(0,194,255,0.08)', border: '1px solid rgba(0,194,255,0.2)' }}>
            <img
              src="https://erpsolutions.oodles.io/wp-content/themes/ERP/custom_inc/image/home/erp_new_logo.png"
              alt="OodlesERP" className="w-14 object-contain"
              onError={e => e.target.style.display = 'none'}
            />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Welcome to OodlesERP AI</h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: '#7a9bb5' }}>
            Before we begin, we'll ask for your<br />
            <span style={{ color: '#00c2ff' }}>name, email, and phone number</span><br />
            so our team can follow up if needed.
          </p>

          <div className="flex flex-col gap-2 w-full mb-7">
            {[
              { icon: '⚡', text: 'Instant AI-powered answers' },
              { icon: '🔒', text: 'Your data is safe with us' },
              { icon: '🤝', text: 'Human follow-up when needed' },
            ].map(f => (
              <div key={f.text}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left"
                style={{ background: 'rgba(0,194,255,0.05)', border: '1px solid rgba(0,194,255,0.1)', color: '#a8c4d8' }}>
                <span className="text-base flex-shrink-0">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-95 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00c2ff, #0077ff)', color: '#0d1b2a', boxShadow: '0 0 24px rgba(0,194,255,0.25)' }}
          >
            Get Started →
          </button>

          <p className="text-xs mt-3" style={{ color: 'rgba(122,155,181,0.4)' }}>
            Takes less than 30 seconds
          </p>
        </div>
      </div>
    );
  }

  /* ── STEP FORM ── */
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col items-center justify-center px-6 pt-6 pb-8 min-h-full">

        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className="transition-all duration-300 rounded-full"
              style={{
                width: i === step ? 24 : 8, height: 8,
                background: i <= step ? '#00c2ff' : 'rgba(255,255,255,0.1)',
              }} />
          ))}
        </div>

        <div className="w-full rounded-2xl p-6 flex flex-col gap-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,194,255,0.12)' }}>

          <div className="flex flex-col items-center text-center gap-1 mb-1">
            <span className="text-3xl mb-1">{current.emoji}</span>
            <h3 className="font-semibold text-base text-white">{current.label}</h3>
            <p className="text-xs" style={{ color: '#7a9bb5' }}>Step {step + 1} of {STEPS.length}</p>
          </div>

          {current.type === 'textarea' ? (
            <>
              <textarea
                autoFocus rows={4} placeholder={current.placeholder} value={value}
                onChange={e => { setValues(v => ({ ...v, [current.field]: e.target.value })); setError(''); }}
                onKeyDown={handleKey}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none resize-none bg-white/5 border border-white/10 focus:border-cyan-400/50"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              />
              <p className="text-xs -mt-2" style={{ color: 'rgba(122,155,181,0.5)' }}>
                Ctrl+Enter to submit
              </p>
            </>
          ) : (
            <input
              autoFocus type={current.type} placeholder={current.placeholder} value={value}
              onChange={e => { setValues(v => ({ ...v, [current.field]: e.target.value })); setError(''); }}
              onKeyDown={handleKey}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none bg-white/5 border border-white/10 focus:border-cyan-400/50"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            />
          )}

          {error && <p className="text-xs text-red-400 text-center -mt-1">{error}</p>}

          <div className="flex gap-2 mt-1">
            <button
              onClick={() => { step === 0 ? setStarted(false) : setStep(s => s - 1); setError(''); }}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#7a9bb5' }}>
              ← Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #00c2ff, #0077ff)', color: '#0d1b2a' }}>
              {isLast ? 'Start Chat →' : 'Next →'}
            </button>
          </div>
        </div>

        <p className="text-xs mt-4" style={{ color: 'rgba(122,155,181,0.4)' }}>
          {current.type === 'textarea' ? 'Ctrl+Enter or click Start Chat' : 'Press Enter to continue'}
        </p>
      </div>
    </div>
  );
}
