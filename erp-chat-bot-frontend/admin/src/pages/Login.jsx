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

  /* ── inline styles ── */
  const page = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    /* exact gradient from screenshot: top ≈ deep blue, bottom ≈ lighter blue */
    background: 'linear-gradient(175deg, #1a4fa0 0%, #1e63c8 45%, #3b8be8 100%)',
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    padding: '24px 16px',
  };

  const card = {
    width: '100%',
    maxWidth: 420,
    background: '#ffffff',
    borderRadius: 10,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    overflow: 'hidden',
    opacity:    mounted ? 1 : 0,
    transform:  mounted ? 'translateY(0)' : 'translateY(16px)',
    transition: 'opacity 0.4s ease, transform 0.4s ease',
  };

  const fieldWrap = { position: 'relative', marginBottom: 14 };

  const iconBox = {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#ebf3fd', borderRight: '1px solid #d4e7fa',
    borderTopLeftRadius: 6, borderBottomLeftRadius: 6,
  };

  const inputBase = {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 12px 11px 50px',
    border: '1px solid #d4e7fa', borderRadius: 6,
    fontSize: 14, color: '#2d3748', background: '#f7fbff',
    outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={page}>

      {/* ── Card ── */}
      <div style={card}>

        {/* Top section: white background, logo centred */}
        <div style={{ padding: '32px 32px 20px', textAlign: 'center', borderBottom: '1px solid #f0f4f8' }}>
          <img
            src="https://my.oodles.io/assets/icons/oodleslogo.svg"
            alt="Oodles"
            style={{ height: 80, objectFit: 'contain' }}
            onError={e => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          {/* Text fallback */}
          <span style={{ display: 'none', fontSize: 26, fontWeight: 800, color: '#1a4fa0', letterSpacing: -0.5 }}>
            Oodles
          </span>
        </div>

        {/* Form section */}
        <div style={{ padding: '24px 32px 28px' }}>

          {/* Avatar icon */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              border: '2px solid #d4e7fa', background: '#f7fbff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b8be8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={fieldWrap}>
              <div style={iconBox}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b8be8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <input
                type="email" value={email} required autoComplete="email"
                placeholder="Email address"
                onChange={e => { setEmail(e.target.value); setError(''); }}
                style={inputBase}
                onFocus={e => { e.target.style.borderColor='#3b8be8'; e.target.style.boxShadow='0 0 0 3px rgba(59,139,232,0.12)'; e.target.style.background='#fff'; }}
                onBlur={e =>  { e.target.style.borderColor='#d4e7fa'; e.target.style.boxShadow='none'; e.target.style.background='#f7fbff'; }}
              />
            </div>

            {/* Password */}
            <div style={{ ...fieldWrap, marginBottom: 6 }}>
              <div style={iconBox}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b8be8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input
                type={showPass ? 'text' : 'password'} value={password} required
                placeholder="Password" autoComplete="current-password"
                onChange={e => { setPassword(e.target.value); setError(''); }}
                style={{ ...inputBase, paddingRight: 42 }}
                onFocus={e => { e.target.style.borderColor='#3b8be8'; e.target.style.boxShadow='0 0 0 3px rgba(59,139,232,0.12)'; e.target.style.background='#fff'; }}
                onBlur={e =>  { e.target.style.borderColor='#d4e7fa'; e.target.style.boxShadow='none'; e.target.style.background='#f7fbff'; }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#90b8e0', display: 'flex', padding: 4,
              }}>
                {showPass
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 12px', marginBottom: 14, borderRadius: 6,
                background: '#fef2f2', border: '1px solid #fecaca',
                animation: 'shake 0.4s ease',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>
              </div>
            )}

            {/* Login button */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px',
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1a4fa0, #2563eb)',
              border: 'none', borderRadius: 6,
              fontSize: 14, fontWeight: 600, color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', marginTop: 8,
              boxShadow: loading ? 'none' : '0 3px 12px rgba(37,99,235,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background='linear-gradient(135deg,#163e82,#1d4ed8)'; e.currentTarget.style.boxShadow='0 5px 18px rgba(37,99,235,0.4)'; }}}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.background='linear-gradient(135deg,#1a4fa0,#2563eb)'; e.currentTarget.style.boxShadow='0 3px 12px rgba(37,99,235,0.3)'; }}}
            >
              {loading
                ? <><div style={{ width:15,height:15,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'#fff',animation:'spin 0.8s linear infinite' }} />Signing in…</>
                : 'Login'
              }
            </button>

            {/* Keep me logged in + Forgot */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14 }}>
              <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#64748b', cursor:'pointer' }}>
                <input type="checkbox" style={{ accentColor:'#2563eb', width:13, height:13 }} />
                Keep me logged in
              </label>
              <button type="button" style={{ fontSize:13, color:'#2563eb', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', padding:0 }}>
                Forgot Password?
              </button>
            </div>
          </form>
        </div>

        {/* Bottom: Recommended browser */}
        <div style={{ padding:'16px 32px 20px', borderTop:'1px solid #f0f4f8', textAlign:'center' }}>
          <p style={{ fontSize:12, color:'#94a3b8', margin:'0 0 8px' }}>Recommended Browser</p>
          <div style={{ display:'flex', justifyContent:'center' }}>
            {/* Chrome-coloured circle icon */}
            <svg width="28" height="28" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="14" fill="#f1f5f9"/>
              <circle cx="14" cy="14" r="6" fill="#4285F4"/>
              <circle cx="14" cy="14" r="3.5" fill="#fff"/>
              {/* Chrome segments */}
              <path d="M14 8 h7 a7 7 0 0 1 -3.5 6.06z" fill="#EA4335"/>
              <path d="M14 8 h-7 a7 7 0 0 0 3.5 6.06z" fill="#FBBC05"/>
              <path d="M7 14 a7 7 0 0 0 10.5 6.06L14 14z" fill="#34A853"/>
              <circle cx="14" cy="14" r="3.5" fill="#fff"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p style={{ marginTop:16, fontSize:12, color:'rgba(255,255,255,0.5)', textAlign:'center' }}>
        © {new Date().getFullYear()} Oodles Technologies Pvt. Ltd.
      </p>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 60%{transform:translateX(5px)} 80%{transform:translateX(-2px)} }
        input::placeholder { color: #a0b8d0; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #f7fbff inset !important; -webkit-text-fill-color: #2d3748 !important; }
      `}</style>
    </div>
  );
}