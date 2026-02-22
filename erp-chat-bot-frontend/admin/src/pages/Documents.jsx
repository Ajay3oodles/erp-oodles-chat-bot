import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

/* ─────────────────── Helpers ─────────────────── */
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatRelative(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return formatDate(iso);
}

/* ─────────────────── Shared UI ─────────────────── */
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium shadow-2xl"
      style={{
        background:     toast.type === 'error' ? 'rgba(255,71,87,0.12)' : 'rgba(0,194,255,0.1)',
        border:         `1px solid ${toast.type === 'error' ? 'rgba(255,71,87,0.35)' : 'rgba(0,194,255,0.35)'}`,
        color:          toast.type === 'error' ? '#ff6b7a' : '#00c2ff',
        backdropFilter: 'blur(20px)',
        animation:      'slide-down 0.3s ease',
      }}>
      <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
      {toast.msg}
    </div>
  );
}

function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span style={{ color: 'rgba(0,194,255,0.3)' }}>›</span>}
          {item.onClick ? (
            <button onClick={item.onClick} className="transition-colors hover:underline"
              style={{ color: '#00c2ff' }}>{item.label}</button>
          ) : (
            <span style={{ color: i === items.length - 1 ? '#e8f4fd' : '#7a9bb5' }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function Spinner({ small }) {
  const size = small ? 'w-5 h-5' : 'w-8 h-8';
  return (
    <div className={`${size} rounded-full border-2 animate-spin`}
      style={{ borderColor: 'rgba(0,194,255,0.15)', borderTopColor: '#00c2ff' }} />
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center rounded-2xl"
      style={{ background: 'rgba(13,27,42,0.5)', border: '1px solid rgba(0,194,255,0.08)' }}>
      <div className="text-5xl opacity-20">{icon}</div>
      <div>
        <p className="font-bold text-white mb-1">{title}</p>
        <p className="text-sm" style={{ color: '#7a9bb5' }}>{subtitle}</p>
      </div>
    </div>
  );
}

/* ─────────────────── User Menu ─────────────────── */
function UserMenu({ onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
        style={{
          background: 'rgba(0,194,255,0.07)',
          border: '1px solid rgba(0,194,255,0.18)',
          cursor: 'pointer',
        }}>
        {/* Avatar */}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background: 'linear-gradient(135deg,#00c2ff,#0077ff)', color: '#080f1a' }}>A</div>
        <span className="text-sm font-medium hidden sm:block" style={{ color: '#e8f4fd' }}>Admin</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7a9bb5" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          minWidth: 192, borderRadius: 14, overflow: 'hidden',
          background: 'rgba(8,18,32,0.98)',
          border: '1px solid rgba(0,194,255,0.18)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(20px)',
          zIndex: 100,
          animation: 'slide-down 0.15s ease',
        }}>
          {/* User info row */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,194,255,0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                style={{ background: 'linear-gradient(135deg,#00c2ff,#0077ff)', color: '#080f1a' }}>A</div>
              <div>
                <p className="text-sm font-semibold text-white">admin</p>
                <p className="text-xs" style={{ color: '#7a9bb5' }}>Administrator</p>
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,194,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: '#00e676', boxShadow: '0 0 6px #00e676' }} />
              <span className="text-xs" style={{ color: '#7a9bb5' }}>Active session</span>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full flex items-center gap-3 text-sm transition-all"
            style={{
              padding: '12px 16px', color: '#ff6b7a',
              background: 'transparent', border: 'none',
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'Outfit, sans-serif',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,71,87,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────── Hub ─────────────────── */
function HubView({ onNavigate, docs, sessions, leads, globalLoading }) {
  const cards = [
    {
      id: 'documents', icon: '📂', title: 'Documents', color: '#00c2ff', glow: 'rgba(0,194,255,0.15)',
      description: 'Upload and manage AI knowledge base documents. Index PDFs, text files, and raw content.',
      badge: globalLoading ? null : `${docs.length} files`,
    },
    {
      id: 'sessions', icon: '💬', title: 'Sessions & Chats', color: '#00e676', glow: 'rgba(0,230,118,0.15)',
      description: 'Browse all chat sessions and drill into individual conversations with full history.',
      badge: globalLoading ? null : `${sessions.length} sessions`,
    },
    {
      id: 'leads', icon: '👤', title: 'Leads', color: '#a78bfa', glow: 'rgba(167,139,250,0.15)',
      description: 'View all captured leads from the chat widget. Contact details collected during conversation.',
      badge: globalLoading ? null : `${leads.length} leads`,
    },
  ];

  return (
    <div>
      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Documents', value: globalLoading ? '…' : docs.length,     icon: '📄', color: '#00c2ff' },
          { label: 'Chat Sessions',   value: globalLoading ? '…' : sessions.length, icon: '🗂️', color: '#00e676' },
          { label: 'Total Leads',     value: globalLoading ? '…' : leads.length,    icon: '📋', color: '#a78bfa' },
          { label: 'Avg. Response',   value: '< 2s',                                icon: '⚡', color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(13,27,42,0.7)', border: '1px solid rgba(0,194,255,0.08)' }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: '#7a9bb5' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <p className="text-sm mb-5 font-medium" style={{ color: '#7a9bb5' }}>Select a section to manage</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map(card => (
          <button key={card.id} onClick={() => onNavigate(card.id)}
            className="group text-left rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 w-full"
            style={{ background: 'rgba(13,27,42,0.8)', border: '1px solid rgba(0,194,255,0.12)', backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${card.color}40`; e.currentTarget.style.boxShadow = `0 8px 40px ${card.glow},0 4px 24px rgba(0,0,0,0.3)`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,194,255,0.12)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'; }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: card.glow, border: `1px solid ${card.color}25` }}>{card.icon}</div>
              {card.badge != null && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: card.glow, color: card.color, border: `1px solid ${card.color}25` }}>{card.badge}</span>
              )}
            </div>
            <h3 className="font-bold text-base text-white mb-2 group-hover:text-[#00c2ff] transition-colors">{card.title}</h3>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#7a9bb5' }}>{card.description}</p>
            <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: card.color }}>
              Open
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                className="group-hover:translate-x-1 transition-transform duration-200">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── Documents View ─────────────────── */
function DocumentsView({ docs, loading, onDocsChange }) {
  const [uploading,  setUploading]  = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId,  setConfirmId]  = useState(null);
  const [toast,      setToast]      = useState(null);
  const [dragOver,   setDragOver]   = useState(false);
  const [tab,        setTab]        = useState('file');
  const [title,      setTitle]      = useState('');
  const [file,       setFile]       = useState(null);
  const [rawText,    setRawText]    = useState('');
  const fileRef = useRef(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const refreshDocs = async () => {
    try {
      const res = await api.getDocuments();
      onDocsChange(Array.isArray(res) ? res : (res?.data || []));
    } catch (e) { showToast(e.message, 'error'); }
  };

  const resetForm = () => {
    setTitle(''); setFile(null); setRawText('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim())                     { showToast('Title is required', 'error'); return; }
    if (tab === 'file' && !file)           { showToast('Please select a file', 'error'); return; }
    if (tab === 'text' && !rawText.trim()) { showToast('Please paste some text', 'error'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      if (tab === 'file') fd.append('file', file);
      if (tab === 'text') fd.append('raw_text', rawText);
      await api.uploadDocument(fd);
      showToast('Document indexed into AI knowledge base ✓');
      resetForm();
      await refreshDocs();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setUploading(false); }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeletingId(confirmId);
    try {
      await api.deleteDocument(confirmId);
      onDocsChange(docs.filter(d => d.id !== confirmId));
      showToast('Document removed from knowledge base');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setDeletingId(null); setConfirmId(null); }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setTab('file'); }
  };

  return (
    <>
      <Toast toast={toast} />
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-7 text-center"
            style={{ background: '#0d1b2a', border: '1px solid rgba(255,71,87,0.25)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.2)' }}>🗑️</div>
            <h3 className="font-bold text-white text-lg mb-2">Delete Document?</h3>
            <p className="text-sm mb-6" style={{ color: '#7a9bb5' }}>This permanently removes the document and its indexed content.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmId(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#7a9bb5' }}>Cancel</button>
              <button onClick={handleDelete} disabled={!!deletingId} className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#ff4757,#ff3344)', color: 'white' }}>
                {deletingId ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Upload panel */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl p-5 sticky top-[80px]"
            style={{ background: 'rgba(13,27,42,0.7)', border: '1px solid rgba(0,194,255,0.12)', backdropFilter: 'blur(12px)' }}>
            <h3 className="font-bold text-white text-sm mb-4">Upload Document</h3>
            <div className="flex rounded-xl overflow-hidden mb-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,194,255,0.1)' }}>
              {['file','text'].map(t => (
                <button key={t} onClick={() => setTab(t)} className="flex-1 py-2 text-xs font-semibold transition-all"
                  style={{ background: tab===t ? 'rgba(0,194,255,0.15)' : 'transparent', color: tab===t ? '#00c2ff' : '#7a9bb5' }}>
                  {t==='file' ? '📎 File Upload' : '📝 Raw Text'}
                </button>
              ))}
            </div>
            <form onSubmit={handleUpload} className="flex flex-col gap-3">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Document title *"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,194,255,0.15)', color: '#e8f4fd', fontFamily: 'Outfit,sans-serif' }} />
              {tab==='file' ? (
                <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={onDrop}
                  onClick={()=>fileRef.current?.click()}
                  className="rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-all"
                  style={{ background: dragOver?'rgba(0,194,255,0.08)':'rgba(255,255,255,0.02)', border:`2px dashed ${dragOver?'#00c2ff':'rgba(0,194,255,0.2)'}`, color:'#7a9bb5' }}>
                  <span className="text-2xl">{file?'📄':'☁️'}</span>
                  <p className="text-xs text-center">{file?file.name:'Drop file here or click to browse'}</p>
                  {file && <button type="button" onClick={e=>{e.stopPropagation();setFile(null);if(fileRef.current)fileRef.current.value='';}}
                    className="text-xs px-2 py-1 rounded-lg" style={{background:'rgba(255,71,87,0.1)',color:'#ff6b7a'}}>Remove</button>}
                  <input ref={fileRef} type="file" className="hidden" onChange={e=>setFile(e.target.files[0])} />
                </div>
              ) : (
                <textarea value={rawText} onChange={e=>setRawText(e.target.value)} rows={6} placeholder="Paste your text content here…"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(0,194,255,0.15)', color:'#e8f4fd', fontFamily:'Outfit,sans-serif' }} />
              )}
              <button type="submit" disabled={uploading}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background:uploading?'rgba(0,194,255,0.3)':'linear-gradient(135deg,#00c2ff,#0077ff)', color:'#080f1a', boxShadow:uploading?'none':'0 0 24px rgba(0,194,255,0.25)' }}>
                {uploading ? (<><Spinner small />Indexing…</>) : '⚡ Index Document'}
              </button>
            </form>
          </div>
        </div>

        {/* Doc list */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white text-base">
              Indexed Documents
              {!loading && <span className="ml-2 text-sm font-normal" style={{color:'#7a9bb5'}}>({docs.length})</span>}
            </h2>
            <button onClick={refreshDocs} disabled={loading}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40"
              style={{ background:'rgba(0,194,255,0.07)', border:'1px solid rgba(0,194,255,0.15)', color:'#00c2ff' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" style={{animation:loading?'spin 1s linear infinite':'none'}}>
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Spinner /><p className="text-sm" style={{color:'#7a9bb5'}}>Loading documents…</p>
            </div>
          ) : docs.length === 0 ? (
            <EmptyState icon="📭" title="No documents indexed" subtitle="Upload your first document to train the AI" />
          ) : (
            <div className="flex flex-col gap-3">
              {docs.map(doc => (
                <div key={doc.id} className="group rounded-2xl p-4 transition-all duration-200"
                  style={{ background:'rgba(13,27,42,0.7)', border:'1px solid rgba(0,194,255,0.1)', backdropFilter:'blur(10px)' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,194,255,0.28)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(0,194,255,0.1)'}>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                      style={{ background:'rgba(0,194,255,0.07)', border:'1px solid rgba(0,194,255,0.12)' }}>
                      {doc.filename?.endsWith('.pdf')?'📕':doc.filename?'📄':'📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-sm text-white truncate">{doc.title||doc.filename}</h3>
                          {doc.filename&&<p className="text-xs truncate mt-0.5" style={{color:'rgba(122,155,181,0.6)'}}>{doc.filename}</p>}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                          {doc.filename&&(
                            <a href={`${api.downloadDocument(doc.id)}?mode=inline`} target="_blank" rel="noreferrer"
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                              style={{ background:'rgba(0,194,255,0.07)', border:'1px solid rgba(0,194,255,0.15)', color:'#00c2ff' }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                              </svg>
                            </a>
                          )}
                          <button onClick={()=>setConfirmId(doc.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{ background:'rgba(255,71,87,0.07)', border:'1px solid rgba(255,71,87,0.15)', color:'#ff6b7a' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      {doc.content&&<p className="text-xs mt-2 leading-relaxed line-clamp-2" style={{color:'rgba(122,155,181,0.7)'}}>{doc.content}</p>}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                          style={{background:'rgba(0,230,118,0.08)',color:'#00e676',border:'1px solid rgba(0,230,118,0.15)'}}>✓ Indexed</span>
                        <span className="text-xs" style={{color:'rgba(122,155,181,0.45)'}}>{formatDate(doc.uploaded_at)}</span>
                        {doc.filename&&(
                          <span className="text-xs px-2 py-0.5 rounded-full uppercase tracking-wide"
                            style={{background:'rgba(0,194,255,0.06)',color:'rgba(0,194,255,0.6)',border:'1px solid rgba(0,194,255,0.1)'}}>
                            {doc.filename.split('.').pop()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────── Sessions View ─────────────────── */
function SessionsView({ sessions, loading, onSelectSession }) {
  const [search, setSearch] = useState('');
  const filtered = sessions.filter(s => !search || s.session_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(0,194,255,0.15)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7a9bb5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search sessions…"
            className="flex-1 bg-transparent outline-none text-sm" style={{color:'#e8f4fd',fontFamily:'Outfit,sans-serif'}} />
        </div>
        {!loading&&<span className="text-sm px-3 py-2 rounded-xl"
          style={{background:'rgba(0,194,255,0.07)',color:'#7a9bb5',border:'1px solid rgba(0,194,255,0.12)',whiteSpace:'nowrap'}}>
          {filtered.length} sessions
        </span>}
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4"><Spinner /><p className="text-sm" style={{color:'#7a9bb5'}}>Loading sessions…</p></div>
      ) : filtered.length===0 ? (
        <EmptyState icon="🗂️" title="No sessions found" subtitle={search?'Try a different search term':'No chat sessions yet'} />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(session => (
            <button key={session.id} onClick={()=>onSelectSession(session)}
              className="group w-full text-left rounded-2xl p-5 transition-all duration-200 hover:scale-[1.005]"
              style={{ background:'rgba(13,27,42,0.7)', border:'1px solid rgba(0,194,255,0.1)', backdropFilter:'blur(12px)' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,194,255,0.3)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(0,194,255,0.1)'}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{background:'rgba(0,230,118,0.08)',border:'1px solid rgba(0,230,118,0.15)'}}>💬</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm text-white truncate group-hover:text-[#00c2ff] transition-colors">
                      {session.session_name||`Session #${session.id}`}
                    </h3>
                    <span className="text-xs flex-shrink-0" style={{color:'#7a9bb5'}}>{formatRelative(session.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{background:'rgba(0,194,255,0.07)',color:'rgba(0,194,255,0.7)',border:'1px solid rgba(0,194,255,0.12)'}}>
                      ID #{session.id}
                    </span>
                    <span className="text-xs" style={{color:'#7a9bb5'}}>{formatDate(session.created_at)}</span>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7a9bb5" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                  className="flex-shrink-0 group-hover:stroke-[#00c2ff] group-hover:translate-x-1 transition-all duration-200">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────── Session Detail ─────────────────── */
function SessionDetailView({ session }) {
  const [chats,   setChats]   = useState([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.getChats(session.id);
        if (!cancelled) setChats(Array.isArray(res) ? res : (res?.data || []));
      } catch(e) { console.error(e); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [session.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [chats]);

  const messages = chats.map((chat, idx) => ({ ...chat, role: idx%2===0 ? 'user' : 'bot' }));

  return (
    <div>
      <div className="rounded-2xl p-4 mb-5 flex items-center gap-4 flex-wrap"
        style={{ background:'rgba(13,27,42,0.6)', border:'1px solid rgba(0,194,255,0.12)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{background:'rgba(0,230,118,0.08)',border:'1px solid rgba(0,230,118,0.15)'}}>💬</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base">{session.session_name||`Session #${session.id}`}</h3>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{background:'rgba(0,194,255,0.07)',color:'rgba(0,194,255,0.7)',border:'1px solid rgba(0,194,255,0.12)'}}>
              ID #{session.id}
            </span>
            <span className="text-xs" style={{color:'#7a9bb5'}}>Created {formatDate(session.created_at)}</span>
            {!loading&&<span className="text-xs" style={{color:'#7a9bb5'}}>{chats.length} messages</span>}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4"><Spinner /><p className="text-sm" style={{color:'#7a9bb5'}}>Loading chats…</p></div>
      ) : messages.length===0 ? (
        <EmptyState icon="💭" title="No chats found" subtitle="This session has no recorded messages" />
      ) : (
        <div className="rounded-2xl overflow-hidden"
          style={{background:'rgba(8,15,26,0.6)',border:'1px solid rgba(0,194,255,0.1)'}}>
          <div className="px-5 py-3 flex items-center gap-2"
            style={{borderBottom:'1px solid rgba(0,194,255,0.08)',background:'rgba(13,27,42,0.8)'}}>
            <span className="w-2 h-2 rounded-full" style={{background:'#00e676'}} />
            <span className="text-xs font-semibold" style={{color:'#7a9bb5'}}>Conversation Thread</span>
          </div>
          <div className="p-5 flex flex-col gap-4 max-h-[600px] overflow-y-auto"
            style={{scrollbarWidth:'thin',scrollbarColor:'rgba(0,194,255,0.15) transparent'}}>
            {messages.map((msg, idx) => {
              const isUser = msg.role==='user';
              return (
                <div key={msg.id??idx} className={`flex items-end gap-2.5 ${isUser?'flex-row-reverse':'flex-row'}`}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={isUser
                      ? {background:'rgba(0,194,255,0.15)',color:'#00c2ff',border:'1px solid rgba(0,194,255,0.2)'}
                      : {background:'rgba(0,230,118,0.1)',color:'#00e676',border:'1px solid rgba(0,230,118,0.2)'}}>
                    {isUser?'U':'AI'}
                  </div>
                  <div className="max-w-[72%]">
                    <div className="px-4 py-3 text-sm leading-relaxed"
                      style={{
                        background:   isUser?'linear-gradient(135deg,#00c2ff,#0077ff)':'rgba(255,255,255,0.05)',
                        color:        isUser?'#0d1b2a':'#e8f4fd',
                        border:       isUser?'none':'1px solid rgba(0,194,255,0.12)',
                        borderRadius: isUser?'18px 18px 4px 18px':'18px 18px 18px 4px',
                        wordBreak:'break-word', whiteSpace:'pre-wrap',
                      }}>
                      {msg.message}
                    </div>
                    <div className={`mt-1 text-xs flex ${isUser?'justify-end':'justify-start'}`}
                      style={{color:'rgba(122,155,181,0.5)'}}>{formatTime(msg.created_at)}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────── Leads View ─────────────────── */
function LeadsView({ leads, loading }) {
  const [search, setSearch] = useState('');
  const filtered = leads.filter(l =>
    !search ||
    l.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.phone?.includes(search)
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(0,194,255,0.15)'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7a9bb5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, email, phone…"
            className="flex-1 bg-transparent outline-none text-sm" style={{color:'#e8f4fd',fontFamily:'Outfit,sans-serif'}} />
        </div>
        {!loading&&<span className="text-sm px-3 py-2 rounded-xl"
          style={{background:'rgba(167,139,250,0.07)',color:'#a78bfa',border:'1px solid rgba(167,139,250,0.15)',whiteSpace:'nowrap'}}>
          {filtered.length} leads
        </span>}
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4"><Spinner /><p className="text-sm" style={{color:'#7a9bb5'}}>Loading leads…</p></div>
      ) : filtered.length===0 ? (
        <EmptyState icon="📋" title="No leads found" subtitle={search?'Try a different search term':'No leads captured yet'} />
      ) : (
        <>
          <div className="hidden md:grid grid-cols-[2fr_2fr_1.5fr_1fr] gap-4 px-5 py-2.5 rounded-xl mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{background:'rgba(0,194,255,0.05)',color:'#7a9bb5'}}>
            <span>Name</span><span>Email</span><span>Phone</span><span>Date</span>
          </div>
          <div className="flex flex-col gap-2">
            {filtered.map(lead => (
              <div key={lead.id} className="group rounded-xl transition-all"
                style={{background:'rgba(13,27,42,0.7)',border:'1px solid rgba(167,139,250,0.1)'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(167,139,250,0.3)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(167,139,250,0.1)'}>
                {/* Mobile */}
                <div className="md:hidden p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0"
                    style={{background:'rgba(167,139,250,0.1)',color:'#a78bfa',border:'1px solid rgba(167,139,250,0.2)'}}>
                    {lead.first_name?.[0]?.toUpperCase()||'?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white">{lead.first_name||'—'}</p>
                    <p className="text-xs mt-0.5" style={{color:'#7a9bb5'}}>{lead.email}</p>
                    <p className="text-xs mt-0.5" style={{color:'#7a9bb5'}}>{lead.phone}</p>
                    <p className="text-xs mt-1" style={{color:'rgba(122,155,181,0.5)'}}>{formatDate(lead.created_at)}</p>
                  </div>
                </div>
                {/* Desktop */}
                <div className="hidden md:grid grid-cols-[2fr_2fr_1.5fr_1fr] gap-4 px-5 py-4 items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{background:'rgba(167,139,250,0.1)',color:'#a78bfa',border:'1px solid rgba(167,139,250,0.2)'}}>
                      {lead.first_name?.[0]?.toUpperCase()||'?'}
                    </div>
                    <span className="text-sm font-semibold text-white truncate">{lead.first_name||'—'}</span>
                  </div>
                  <div className="min-w-0">
                    <a href={`mailto:${lead.email}`} className="text-sm transition-colors truncate block" style={{color:'#7a9bb5'}}
                      onMouseEnter={e=>e.target.style.color='#00c2ff'} onMouseLeave={e=>e.target.style.color='#7a9bb5'}>
                      {lead.email||'—'}
                    </a>
                  </div>
                  <div>
                    <a href={`tel:${lead.phone}`} className="text-sm transition-colors" style={{color:'#7a9bb5'}}
                      onMouseEnter={e=>e.target.style.color='#00c2ff'} onMouseLeave={e=>e.target.style.color='#7a9bb5'}>
                      {lead.phone||'—'}
                    </a>
                  </div>
                  <div className="text-xs" style={{color:'rgba(122,155,181,0.5)'}}>{formatDate(lead.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────── Cache ─────────────────── */
let _cache   = null;
let _promise = null;

function fetchAllOnce() {
  if (_cache)   return Promise.resolve(_cache);
  if (_promise) return _promise;
  _promise = Promise.allSettled([
    api.getDocuments(),
    api.getSessions(),
    api.getLeads(),
  ]).then(([docsRes, sessRes, leadsRes]) => {
    _cache = {
      docs:     docsRes.status==='fulfilled'  ? (Array.isArray(docsRes.value)  ? docsRes.value  : (docsRes.value?.data  || [])) : [],
      sessions: sessRes.status==='fulfilled'  ? (Array.isArray(sessRes.value)  ? sessRes.value  : (sessRes.value?.data  || [])) : [],
      leads:    leadsRes.status==='fulfilled' ? (Array.isArray(leadsRes.value) ? leadsRes.value : (leadsRes.value?.data || [])) : [],
    };
    return _cache;
  });
  return _promise;
}

/* ─────────────────── Page ─────────────────── */
export default function DocumentsPage() {
  const navigate = useNavigate();

  const [docs,     setDocs]     = useState([]);
  const [sessions, setSessions] = useState([]);
  const [leads,    setLeads]    = useState([]);
  const [loading,  setLoading]  = useState(!_cache);
  const [view,            setView]            = useState('hub');
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    if (_cache) {
      setDocs(_cache.docs); setSessions(_cache.sessions); setLeads(_cache.leads);
      setLoading(false); return;
    }
    let active = true;
    fetchAllOnce().then(data => {
      if (!active) return;
      setDocs(data.docs); setSessions(data.sessions); setLeads(data.leads);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    _cache = null; _promise = null; // clear cache on logout
    navigate('/login', { replace: true });
  };

  const goTo = (v) => { setSelectedSession(null); setView(v); };

  const NAV_TABS = [
    { id: 'hub',       label: 'Overview',  icon: '⊞' },
    { id: 'documents', label: 'Documents', icon: '📂' },
    { id: 'sessions',  label: 'Sessions',  icon: '💬' },
    { id: 'leads',     label: 'Leads',     icon: '👤' },
  ];

  const BREADCRUMBS = {
    hub:              [{ label: 'Command Center' }],
    documents:        [{ label: 'Command Center', onClick: () => goTo('hub') }, { label: 'Documents' }],
    sessions:         [{ label: 'Command Center', onClick: () => goTo('hub') }, { label: 'Sessions & Chats' }],
    'session-detail': [
      { label: 'Command Center', onClick: () => goTo('hub') },
      { label: 'Sessions & Chats', onClick: () => goTo('sessions') },
      { label: selectedSession?.session_name || `Session #${selectedSession?.id}` },
    ],
    leads: [{ label: 'Command Center', onClick: () => goTo('hub') }, { label: 'Leads' }],
  };

  const PAGE_TITLES = {
    hub:              'Command Center',
    documents:        'Documents',
    sessions:         'Sessions & Chats',
    'session-detail': selectedSession?.session_name || `Session #${selectedSession?.id}`,
    leads:            'Leads',
  };

  return (
    <div className="min-h-screen" style={{ background: '#080f1a', fontFamily: 'Outfit,sans-serif', color: '#e8f4fd' }}>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'linear-gradient(rgba(0,194,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,194,255,1) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.06] rounded-full"
          style={{ background:'radial-gradient(circle,#00c2ff,transparent 70%)', filter:'blur(60px)', transform:'translate(20%,-20%)' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-[0.04] rounded-full"
          style={{ background:'radial-gradient(circle,#0077ff,transparent 70%)', filter:'blur(60px)', transform:'translate(-20%,20%)' }} />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 py-3"
        style={{ background:'rgba(8,15,26,0.92)', borderBottom:'1px solid rgba(0,194,255,0.1)', backdropFilter:'blur(20px)' }}>

        {/* Left — Logo + label */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img
            src="https://my.oodles.io/assets/icons/oodleslogo.svg"
            alt="Oodles ERP"
            style={{ height: 32, objectFit: 'contain' }}
            onError={e => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* SVG fallback */}
          <div style={{ display:'none', alignItems:'center', gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#00c2ff,#0077ff)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#080f1a' }}>O</div>
            <span style={{ fontWeight:700, color:'#e8f4fd', fontSize:16 }}>OodlesERP</span>
          </div>
          <div style={{ width:1, height:22, background:'rgba(0,194,255,0.2)', margin:'0 4px' }} />
          <span style={{ fontSize:11, fontWeight:600, color:'#7a9bb5', letterSpacing:'0.1em', textTransform:'uppercase' }}>
            Admin Portal
          </span>
        </div>

        {/* Centre — Nav */}
        <div className="hidden md:flex items-center gap-1 rounded-xl p-1"
          style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(0,194,255,0.1)' }}>
          {NAV_TABS.map(tab => {
            const active = view===tab.id || (view==='session-detail' && tab.id==='sessions');
            return (
              <button key={tab.id} onClick={() => goTo(tab.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                style={{ background: active?'rgba(0,194,255,0.15)':'transparent', color: active?'#00c2ff':'#7a9bb5' }}>
                <span className="mr-1.5">{tab.icon}</span>{tab.label}
              </button>
            );
          })}
        </div>

        {/* Right — User menu with logout */}
        <UserMenu onLogout={handleLogout} />
      </header>

      {/* ── Body ── */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-8">
        {/* Page title — single source, no duplication */}
        <div className="mb-6">
          <Breadcrumbs items={BREADCRUMBS[view] || []} />
          <h1 className="text-2xl font-bold text-white mt-2">{PAGE_TITLES[view]}</h1>
          {view==='hub' && (
            <p className="text-sm mt-1" style={{ color:'#7a9bb5' }}>
              Manage your AI knowledge base, monitor conversations, and track captured leads.
            </p>
          )}
          {view==='session-detail' && selectedSession && (
            <p className="text-sm mt-1" style={{ color:'#7a9bb5' }}>
              Created {formatDate(selectedSession.created_at)} · Token: {selectedSession.session_token||'—'}
            </p>
          )}
        </div>

        {view==='hub'            && <HubView docs={docs} sessions={sessions} leads={leads} globalLoading={loading} onNavigate={goTo} />}
        {view==='documents'      && <DocumentsView docs={docs} loading={loading} onDocsChange={setDocs} />}
        {view==='sessions'       && <SessionsView sessions={sessions} loading={loading} onSelectSession={s=>{setSelectedSession(s);setView('session-detail');}} />}
        {view==='session-detail' && selectedSession && <SessionDetailView session={selectedSession} />}
        {view==='leads'          && <LeadsView leads={leads} loading={loading} />}
      </main>

      <style>{`
        @keyframes slide-down { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform:rotate(360deg); } }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>
    </div>
  );
}