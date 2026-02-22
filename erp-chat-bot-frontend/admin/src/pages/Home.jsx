import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatWidget from '../components/ChatWidget';

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 4,
}));

const STATS = [
  { value: '10K+', label: 'Businesses Served' },
  { value: '99.9%', label: 'Uptime' },
  { value: '< 2s', label: 'Response Time' },
  { value: '24/7', label: 'AI Support' },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate;  // kept for reference but unused
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--navy)' }}>

      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(rgba(0,194,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,194,255,0.8) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #00c2ff 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-8"
        style={{ background: 'radial-gradient(circle, #0077ff 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {PARTICLES.map(p => (
        <div key={p.id} className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: 'var(--accent)', opacity: 0.3,
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }} />
      ))}

      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b accent-border">
        <img src="https://erpsolutions.oodles.io/wp-content/themes/ERP/custom_inc/image/home/erp_new_logo.png"
          alt="OodlesERP" className="h-9 object-contain"
          onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
        <div style={{display:'none'}} className="items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>O</div>
          <span className="text-white font-bold text-lg tracking-tight">OodlesERP</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Solutions', 'Services', 'Resources', 'About'].map(item => (
            <a key={item} href="#" className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.target.style.color = 'var(--accent)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => window.location.href = '/documents'}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{ background: 'rgba(0,194,255,0.08)', border: '1px solid rgba(0,194,255,0.2)', color: '#00c2ff' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Manage
          </button>
          <button className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'var(--navy)' }}>
            Contact Us
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 text-center">
        <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-semibold tracking-widest uppercase accent-border"
            style={{ background: 'rgba(0,194,255,0.08)', color: 'var(--accent)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
            AI-Powered ERP Assistant · Live
          </div>
        </div>

        <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '100ms' }}>
          <h1 className="text-5xl md:text-7xl font-800 leading-tight mb-6 tracking-tight" style={{ fontWeight: 800 }}>
            <span style={{ color: 'var(--text-primary)' }}>Custom ERP</span><br />
            <span className="shimmer-text">Intelligence</span><br />
            <span style={{ color: 'var(--text-primary)' }}>at Your Fingertips</span>
          </h1>
        </div>

        <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '200ms' }}>
          <p className="text-lg max-w-xl mb-10 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Get instant answers about ERP solutions, implementation timelines, pricing, and custom integrations — powered by advanced AI.
          </p>
        </div>

        <div className={`flex items-center gap-4 mb-16 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '300ms' }}>
          <button
            className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'var(--navy)', boxShadow: '0 0 30px var(--accent-glow)' }}
            onClick={() => document.querySelector('[aria-label="Open chat"]')?.click()}>
            Start AI Conversation →
          </button>
          <a href="https://erpsolutions.oodles.io" target="_blank" rel="noreferrer"
            className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 accent-border"
            style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.04)' }}>
            Explore Solutions
          </a>
        </div>

        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl w-full transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '400ms' }}>
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-2xl p-5 text-center accent-border"
              style={{ background: 'rgba(17,34,64,0.6)', backdropFilter: 'blur(10px)' }}>
              <div className="text-2xl font-bold mb-1 shimmer-text">{stat.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}