import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'oodles@123';

// Floating particle data — generated once, stable across renders
const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  delay: Math.random() * 6,
  duration: Math.random() * 8 + 6,
  opacity: Math.random() * 0.4 + 0.1,
}));

export default function Login() {
  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [showPass,  setShowPass]  = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (sessionStorage.getItem('admin_auth') === 'true') {
      navigate('/dashboard', { replace: true });
      return;
    }
    setTimeout(() => setMounted(true), 80);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate slight delay for UX feel
    await new Promise(r => setTimeout(r, 600));

    if (username.trim() === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem('admin_auth', 'true');
      navigate('/dashboard', { replace: true });
    } else {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080f1a',
      fontFamily: "'Outfit', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Animated grid background ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(0,194,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,194,255,0.04) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* ── Radial glows ── */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-10%',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,194,255,0.12) 0%, transparent 65%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-15%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,119,255,0.1) 0%, transparent 65%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,194,255,0.04) 0%, transparent 70%)',
        filter: 'blur(60px)', transform: 'translate(-50%,-50%)', pointerEvents: 'none',
      }} />

      {/* ── Floating particles ── */}
      {PARTICLES.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: '50%',
          background: '#00c2ff',
          opacity: p.opacity,
          pointerEvents: 'none',
          animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
        }} />
      ))}

      {/* ── Login card ── */}
      <div style={{
        width: '100%', maxWidth: 420,
        margin: '0 16px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>

        {/* Card */}
        <div style={{
          background: 'rgba(10,20,35,0.85)',
          border: '1px solid rgba(0,194,255,0.18)',
          borderRadius: 24,
          padding: '40px 36px',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,194,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Card inner glow top */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '60%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(0,194,255,0.5), transparent)',
          }} />

          {/* ── Logo + heading ── */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72, height: 72,
              borderRadius: 20,
              background: 'rgba(0,194,255,0.08)',
              border: '1px solid rgba(0,194,255,0.2)',
              marginBottom: 20,
              boxShadow: '0 0 32px rgba(0,194,255,0.15)',
            }}>
              <img
                src="https://my.oodles.io/assets/icons/oodleslogo.svg"
                alt="Oodles"
                style={{ width: 44, height: 44, objectFit: 'contain' }}
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback if logo fails */}
              <span style={{
                display: 'none', fontSize: 28, fontWeight: 800,
                background: 'linear-gradient(135deg,#00c2ff,#0077ff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>O</span>
            </div>

            <h1 style={{
              fontSize: 22, fontWeight: 700, color: '#e8f4fd',
              margin: '0 0 6px', letterSpacing: '-0.3px',
            }}>
              Oodles ERP Admin
            </h1>
            <p style={{ fontSize: 13, color: '#7a9bb5', margin: 0 }}>
              Sign in to access the command centre
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#7a9bb5', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#4a6a80', display: 'flex', alignItems: 'center',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  placeholder="Enter username"
                  autoComplete="username"
                  required
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${error ? 'rgba(255,71,87,0.4)' : 'rgba(0,194,255,0.15)'}`,
                    borderRadius: 12, fontSize: 14, color: '#e8f4fd',
                    outline: 'none', fontFamily: 'Outfit, sans-serif',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(0,194,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,194,255,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = error ? 'rgba(255,71,87,0.4)' : 'rgba(0,194,255,0.15)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#7a9bb5', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#4a6a80', display: 'flex', alignItems: 'center',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%', padding: '12px 44px 12px 40px',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${error ? 'rgba(255,71,87,0.4)' : 'rgba(0,194,255,0.15)'}`,
                    borderRadius: 12, fontSize: 14, color: '#e8f4fd',
                    outline: 'none', fontFamily: 'Outfit, sans-serif',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(0,194,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,194,255,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = error ? 'rgba(255,71,87,0.4)' : 'rgba(0,194,255,0.15)'; e.target.style.boxShadow = 'none'; }}
                />
                {/* Show/hide password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#4a6a80', padding: 4, display: 'flex', alignItems: 'center',
                  }}>
                  {showPass ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,71,87,0.08)',
                border: '1px solid rgba(255,71,87,0.25)',
                animation: 'shake 0.4s ease',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b7a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ fontSize: 13, color: '#ff6b7a' }}>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? 'rgba(0,194,255,0.3)' : 'linear-gradient(135deg, #00c2ff, #0077ff)',
                border: 'none', borderRadius: 12,
                fontSize: 14, fontWeight: 700,
                color: loading ? 'rgba(8,15,26,0.6)' : '#080f1a',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Outfit, sans-serif',
                marginTop: 4,
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 0 24px rgba(0,194,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = 'scale(1.02)'; e.target.style.boxShadow = '0 0 36px rgba(0,194,255,0.45)'; } }}
              onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = loading ? 'none' : '0 0 24px rgba(0,194,255,0.3)'; }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid rgba(8,15,26,0.3)',
                    borderTopColor: '#080f1a',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* ── Footer ── */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(0,194,255,0.08)', textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'rgba(122,155,181,0.45)', margin: 0 }}>
              Oodles Technologies · Admin Portal · Restricted Access
            </p>
          </div>
        </div>

        {/* Below card tag */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(122,155,181,0.35)' }}>
          © {new Date().getFullYear()} Oodles Technologies Pvt. Ltd.
        </p>
      </div>

      {/* ── Keyframe styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33%       { transform: translateY(-12px) translateX(4px); }
          66%       { transform: translateY(6px) translateX(-4px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }

        input::placeholder { color: rgba(122,155,181,0.45); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px rgba(10,20,35,0.95) inset !important;
          -webkit-text-fill-color: #e8f4fd !important;
        }
      `}</style>
    </div>
  );
}