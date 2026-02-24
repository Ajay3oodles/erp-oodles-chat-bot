import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('admin_access_token')) {
      navigate('/dashboard', { replace: true });
      return;
    }
    setTimeout(() => setMounted(true), 60);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/auth/login/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.detail || 'Invalid credentials');
        setLoading(false);
        return;
      }
      localStorage.setItem('admin_access_token',  data.access);
      localStorage.setItem('admin_refresh_token', data.refresh);
      localStorage.setItem('admin_user_email',    data.email);
      localStorage.setItem('admin_user_name',     data.name || 'Admin');
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Network error — please try again');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Two-tone background: top blue ~40%, bottom white */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: '#4a8fd4' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: '#fff' }} />
      </div>

      {/* Page layout */}
      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Segoe UI','Helvetica Neue',Arial,sans-serif",
        padding: '20px 16px',
      }}>

        {/* ── Card — fully white, no internal colour strip ── */}
        <div style={{
          width: '100%', maxWidth: 400,
          background: '#ffffff',
          borderRadius: 8,
          boxShadow: '0 8px 30px rgba(0,0,0,0.14)',
          overflow: 'hidden',
          opacity:   mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
        }}>

          {/* Logo — small, original colours, centred at top of white card */}
          <div style={{ padding: '28px 32px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src="https://my.oodles.io/assets/icons/oodleslogo.svg"
              alt="Oodles"
              style={{ height: 28, objectFit: 'contain' }}
              onError={e => { e.target.style.display='none'; }}
            />
          </div>

          {/* Avatar icon */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '18px 0 16px' }}>
            <img
              src="https://my.oodles.io/assets/icons/loginIcons/user.svg"
              alt="User"
              style={{ width: 54, height: 54 }}
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback */}
            <div style={{
              display: 'none', width: 54, height: 54, borderRadius: '50%',
              border: '2px solid #c8dff5', background: '#eef6ff',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a8fd4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>

          {/* Form */}
          <div style={{ padding: '0 28px 26px' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>

              {/* Email */}
              <div style={{
                display: 'flex', alignItems: 'center',
                border: '1px solid #c8dff5', borderRadius: 5, overflow: 'hidden',
                background: '#eef6ff',
              }}
                onFocusCapture={e => { e.currentTarget.style.borderColor='#4a8fd4'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(74,143,212,0.12)'; e.currentTarget.style.background='#fff'; }}
                onBlurCapture={e  => { e.currentTarget.style.borderColor='#c8dff5'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.background='#eef6ff'; }}>
                <div style={{ width: 38, flexShrink: 0, alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d6eaff', borderRight: '1px solid #c8dff5' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a8fd4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  type="email" value={email} required autoComplete="email"
                  placeholder="Email address"
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  style={{ flex: 1, padding: '10px 10px', border: 'none', outline: 'none', fontSize: 13, color: '#2d3748', background: 'transparent', fontFamily: 'inherit' }}
                />
              </div>

              {/* Password */}
              <div style={{
                display: 'flex', alignItems: 'center',
                border: '1px solid #c8dff5', borderRadius: 5, overflow: 'hidden',
                background: '#eef6ff',
              }}
                onFocusCapture={e => { e.currentTarget.style.borderColor='#4a8fd4'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(74,143,212,0.12)'; e.currentTarget.style.background='#fff'; }}
                onBlurCapture={e  => { e.currentTarget.style.borderColor='#c8dff5'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.background='#eef6ff'; }}>
                <div style={{ width: 38, flexShrink: 0, alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#d6eaff', borderRight: '1px solid #c8dff5' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a8fd4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  type={showPass ? 'text' : 'password'} value={password} required
                  placeholder="Password" autoComplete="current-password"
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  style={{ flex: 1, padding: '10px 10px', border: 'none', outline: 'none', fontSize: 13, color: '#2d3748', background: 'transparent', fontFamily: 'inherit' }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ padding: '0 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#4a8fd4', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {showPass
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>

              {/* Error */}
              {error && (
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 11px', borderRadius:5, background:'#fef2f2', border:'1px solid #fecaca', animation:'shake 0.4s ease' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span style={{ fontSize: 12, color: '#dc2626' }}>{error}</span>
                </div>
              )}

              {/* Login button */}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '11px',
                background: loading ? '#93c5fd' : '#4a8fd4',
                border: 'none', borderRadius: 5,
                fontSize: 14, fontWeight: 600, color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', marginTop: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: loading ? 'none' : '0 2px 8px rgba(74,143,212,0.3)',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#3a7fc5'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#4a8fd4'; }}
              >
                {loading
                  ? <><div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', animation:'spin 0.8s linear infinite' }}/>Signing in…</>
                  : 'Login'
                }
              </button>

              {/* Keep me / Forgot */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: 2 }}>
                <label style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#64748b', cursor:'pointer' }}>
                  <input type="checkbox" style={{ accentColor:'#4a8fd4', width:12, height:12 }} />
                  Keep me logged in
                </label>
                <button type="button" style={{ fontSize:12, color:'#4a8fd4', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', padding:0 }}>
                  Forgot Password?
                </button>
              </div>
            </form>

            {/* Recommended Browser — single chrome icon, centred */}
            <div style={{ textAlign:'center', marginTop:22 }}>
              <p style={{ fontSize:12, color:'#94a3b8', margin:'0 0 8px' }}>Recommended Browser</p>
              <div style={{ display:'flex', justifyContent:'center' }}>
                <img
                  src="https://my.oodles.io/assets/icons/loginIcons/chrome.svg"
                  alt="Chrome"
                  style={{ width: 36, height: 36 }}
                  onError={e => { e.target.style.display='none'; }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p style={{ marginTop:14, fontSize:12, color:'rgba(255,255,255,0.6)', textAlign:'center' }}>
          © {new Date().getFullYear()} Oodles Technologies Pvt. Ltd.
        </p>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 60%{transform:translateX(5px)} 80%{transform:translateX(-2px)} }
        input::placeholder { color: #a8c4dc; font-size: 13px; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #eef6ff inset !important; -webkit-text-fill-color: #2d3748 !important; }
      `}</style>
    </>
  );
}