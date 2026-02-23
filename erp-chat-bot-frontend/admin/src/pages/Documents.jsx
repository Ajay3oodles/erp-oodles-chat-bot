import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

/* ─────────── Design tokens (my.oodles.io palette) ─────────── */
const C = {
  bg:          '#f0f4f8',
  surface:     '#ffffff',
  surfaceAlt:  '#f8fafc',
  border:      '#e2e8f0',
  borderLight: '#f0f4f8',
  primary:     '#1e63c8',
  primaryDk:   '#1a4fa0',
  primarySoft: '#eff6ff',
  primaryMid:  '#bfdbfe',
  green:       '#10b981',
  greenSoft:   '#ecfdf5',
  red:         '#ef4444',
  redSoft:     '#fef2f2',
  amber:       '#f59e0b',
  purple:      '#7c3aed',
  purpleSoft:  '#f5f3ff',
  text:        '#1e293b',
  textMd:      '#475569',
  textSm:      '#64748b',
  textMuted:   '#94a3b8',
  sh:          '0 1px 3px rgba(0,0,0,0.07),0 1px 2px rgba(0,0,0,0.04)',
  shMd:        '0 4px 12px rgba(0,0,0,0.08)',
  shLg:        '0 10px 30px rgba(0,0,0,0.1)',
};

/* ─────────── Helpers ─────────── */
const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
};
const fmtTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
};
const fmtRel = (iso) => {
  if (!iso) return '—';
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return fmtDate(iso);
};

/* ─────────── Micro components ─────────── */
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{
      position:'fixed',top:16,right:16,zIndex:9000,
      display:'flex',alignItems:'center',gap:8,
      padding:'11px 16px',borderRadius:8,fontSize:13,fontWeight:500,
      background: toast.type==='error' ? C.redSoft    : C.greenSoft,
      border:     `1px solid ${toast.type==='error' ? '#fecaca' : '#a7f3d0'}`,
      color:      toast.type==='error' ? C.red         : C.green,
      boxShadow: C.shMd, animation:'fadeSlide 0.25s ease',
    }}>
      {toast.type==='error' ? '⚠️' : '✅'} {toast.msg}
    </div>
  );
}

function Spinner({ size=28 }) {
  return <div style={{ width:size,height:size,borderRadius:'50%',border:`2px solid ${C.primaryMid}`,borderTopColor:C.primary,animation:'spin 0.8s linear infinite',flexShrink:0 }} />;
}

function Empty({ icon, title, sub }) {
  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'72px 24px',textAlign:'center',background:C.surfaceAlt,border:`1.5px dashed ${C.border}`,borderRadius:10 }}>
      <div style={{ fontSize:36,opacity:0.3,marginBottom:10 }}>{icon}</div>
      <p style={{ fontWeight:600,color:C.text,margin:'0 0 4px' }}>{title}</p>
      <p style={{ fontSize:13,color:C.textMuted,margin:0 }}>{sub}</p>
    </div>
  );
}

function Chip({ children, color='blue' }) {
  const map = {
    blue:   [C.primarySoft, C.primary,   C.primaryMid],
    green:  [C.greenSoft,   C.green,     '#a7f3d0'],
    purple: [C.purpleSoft,  C.purple,    '#ddd6fe'],
    gray:   [C.surfaceAlt,  C.textMd,    C.border],
    red:    [C.redSoft,     C.red,       '#fecaca'],
  };
  const [bg,text,bd] = map[color]||map.blue;
  return (
    <span style={{ display:'inline-flex',alignItems:'center',padding:'2px 9px',borderRadius:20,fontSize:11,fontWeight:600,background:bg,color:text,border:`1px solid ${bd}`,whiteSpace:'nowrap' }}>
      {children}
    </span>
  );
}

function Card({ children, style={} }) {
  return (
    <div style={{ background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,boxShadow:C.sh,...style }}>
      {children}
    </div>
  );
}

/* ─────────── User menu ─────────── */
function UserMenu({ onLogout }) {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);
  const name  = localStorage.getItem('admin_user_name')  || 'Admin';
  const email = localStorage.getItem('admin_user_email') || '';

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={() => setOpen(o=>!o)} style={{
        display:'flex',alignItems:'center',gap:6,
        padding:'4px 8px 4px 4px',borderRadius:8,
        background:'transparent',border:`1px solid ${open?C.primaryMid:C.border}`,
        cursor:'pointer',transition:'all 0.15s',
      }}
        onMouseEnter={e=>e.currentTarget.style.borderColor=C.primaryMid}
        onMouseLeave={e=>{if(!open)e.currentTarget.style.borderColor=C.border;}}>
        <div style={{ width:30,height:30,borderRadius:6,background:`linear-gradient(135deg,${C.primary},${C.primaryDk})`,color:'#fff',fontWeight:700,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center' }}>
          {name[0].toUpperCase()}
        </div>
        <span style={{ fontSize:13,fontWeight:600,color:C.text }}>{name}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform:open?'rotate(180deg)':'none',transition:'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && (
        <div style={{ position:'absolute',right:0,top:'calc(100% + 6px)',minWidth:210,borderRadius:10,overflow:'hidden',background:C.surface,border:`1px solid ${C.border}`,boxShadow:C.shLg,zIndex:300,animation:'fadeSlide 0.15s ease' }}>
          <div style={{ padding:'12px 14px',background:C.surfaceAlt,borderBottom:`1px solid ${C.borderLight}`,display:'flex',alignItems:'center',gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:8,background:`linear-gradient(135deg,${C.primary},${C.primaryDk})`,color:'#fff',fontWeight:700,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              {name[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight:600,color:C.text,fontSize:13,margin:0 }}>{name}</p>
              <p style={{ color:C.textMuted,fontSize:11,margin:'2px 0 0' }}>{email}</p>
            </div>
          </div>
          <div style={{ padding:'8px 14px',borderBottom:`1px solid ${C.borderLight}`,display:'flex',alignItems:'center',gap:6 }}>
            <span style={{ width:7,height:7,borderRadius:'50%',background:C.green,boxShadow:`0 0 4px ${C.green}` }} />
            <span style={{ fontSize:12,color:C.textMd }}>Active session</span>
          </div>
          <button onClick={()=>{setOpen(false);onLogout();}} style={{
            width:'100%',display:'flex',alignItems:'center',gap:10,
            padding:'11px 14px',fontSize:13,fontWeight:600,color:C.red,
            background:'transparent',border:'none',cursor:'pointer',textAlign:'left',fontFamily:'inherit',
          }}
            onMouseEnter={e=>e.currentTarget.style.background=C.redSoft}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────── Breadcrumbs ─────────── */
function Crumbs({ items }) {
  return (
    <nav style={{ display:'flex',alignItems:'center',gap:5,fontSize:13,marginBottom:6 }}>
      {items.map((it,i) => (
        <span key={i} style={{ display:'flex',alignItems:'center',gap:5 }}>
          {i>0 && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>}
          {it.onClick
            ? <button onClick={it.onClick} style={{ color:C.primary,background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:13,padding:0 }}>{it.label}</button>
            : <span style={{ color:i===items.length-1?C.text:C.textMd }}>{it.label}</span>
          }
        </span>
      ))}
    </nav>
  );
}

/* ─────────── Stat card ─────────── */
function StatTile({ icon, label, value, color='blue' }) {
  const accent = { blue:C.primary, green:C.green, purple:C.purple, amber:C.amber }[color]||C.primary;
  const soft   = { blue:C.primarySoft, green:C.greenSoft, purple:C.purpleSoft, amber:'#fffbeb' }[color]||C.primarySoft;
  return (
    <Card style={{ padding:20,display:'flex',alignItems:'center',gap:14 }}>
      <div style={{ width:46,height:46,borderRadius:10,background:soft,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>{icon}</div>
      <div>
        <p style={{ fontSize:22,fontWeight:800,color:accent,margin:0,lineHeight:1 }}>{value}</p>
        <p style={{ fontSize:12,color:C.textMuted,margin:'4px 0 0' }}>{label}</p>
      </div>
    </Card>
  );
}

/* ─────────── Hub ─────────── */
function Hub({ onNav, docs, sessions, leads, loading }) {
  const sections = [
    { id:'documents', icon:'📂', title:'Documents',      color:'blue',   chipColor:'blue',   badge:`${docs.length} files`,     desc:'Upload and manage AI knowledge base documents. Index PDFs, text files, and raw content for the chatbot.' },
    { id:'sessions',  icon:'💬', title:'Sessions & Chats',color:'green',  chipColor:'green',  badge:`${sessions.length} sessions`, desc:'Browse all chat sessions and drill into individual conversations. Each session contains a full chat history.' },
    { id:'leads',     icon:'👤', title:'Leads',           color:'purple', chipColor:'purple', badge:`${leads.length} leads`,    desc:'View all captured leads from the chat widget. Name, email, and contact details collected during conversations.' },
  ];
  const accent = { blue:C.primary, green:C.green, purple:C.purple };

  return (
    <div>
      {/* Stats */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,marginBottom:24 }}>
        <StatTile icon="📄" label="Total Documents" value={loading?'…':docs.length}     color="blue" />
        <StatTile icon="🗂️" label="Chat Sessions"   value={loading?'…':sessions.length} color="green" />
        <StatTile icon="📋" label="Total Leads"     value={loading?'…':leads.length}    color="purple" />
        <StatTile icon="⚡" label="Avg. Response"   value="< 2s"                        color="amber" />
      </div>

      <p style={{ fontSize:12,fontWeight:700,color:C.textMuted,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:14 }}>Sections</p>

      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14 }}>
        {sections.map(s => (
          <button key={s.id} onClick={()=>onNav(s.id)} style={{
            background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,
            padding:22,textAlign:'left',cursor:'pointer',boxShadow:C.sh,
            display:'flex',flexDirection:'column',gap:14,transition:'all 0.18s',
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=accent[s.color]+'60';e.currentTarget.style.boxShadow=C.shMd;e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow=C.sh;e.currentTarget.style.transform='none';}}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
              <div style={{ width:48,height:48,borderRadius:10,background:{blue:C.primarySoft,green:C.greenSoft,purple:C.purpleSoft}[s.color],display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>{s.icon}</div>
              {!loading && <Chip color={s.chipColor}>{s.badge}</Chip>}
            </div>
            <div>
              <p style={{ fontWeight:700,fontSize:14,color:C.text,margin:'0 0 6px' }}>{s.title}</p>
              <p style={{ fontSize:12,color:C.textMuted,lineHeight:1.6,margin:0 }}>{s.desc}</p>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:4,fontSize:12,fontWeight:700,color:accent[s.color] }}>
              Open
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Documents ─────────── */
function Docs({ docs, loading, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId,setDeletingId]= useState(null);
  const [toast,     setToast]     = useState(null);
  const [dragOver,  setDragOver]  = useState(false);
  const [tab,       setTab]       = useState('file');
  const [title,     setTitle]     = useState('');
  const [file,      setFile]      = useState(null);
  const [rawText,   setRawText]   = useState('');
  const fileRef = useRef(null);

  const toast$ = (msg,type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };
  const refresh = async () => { try { const r=await api.getDocuments(); onChange(Array.isArray(r)?r:(r?.data||[])); } catch(e){toast$(e.message,'error');} };
  const reset   = () => { setTitle(''); setFile(null); setRawText(''); if(fileRef.current)fileRef.current.value=''; };

  const submit = async e => {
    e.preventDefault();
    if (!title.trim())                  { toast$('Title is required','error'); return; }
    if (tab==='file'&&!file)            { toast$('Please select a file','error'); return; }
    if (tab==='text'&&!rawText.trim())  { toast$('Please paste some text','error'); return; }
    setUploading(true);
    try {
      const fd=new FormData(); fd.append('title',title.trim());
      if(tab==='file') fd.append('file',file); else fd.append('raw_text',rawText);
      await api.uploadDocument(fd); toast$('Document indexed ✓'); reset(); await refresh();
    } catch(e){ toast$(e.message,'error'); } finally { setUploading(false); }
  };

  const del = async () => {
    if (!confirmId) return;
    setDeletingId(confirmId);
    try { await api.deleteDocument(confirmId); onChange(docs.filter(d=>d.id!==confirmId)); toast$('Removed'); }
    catch(e){ toast$(e.message,'error'); } finally { setDeletingId(null); setConfirmId(null); }
  };

  const inp = { width:'100%',boxSizing:'border-box',padding:'9px 12px',border:`1px solid ${C.border}`,borderRadius:6,fontSize:13,color:C.text,background:C.surface,outline:'none',fontFamily:'inherit',transition:'border-color 0.18s,box-shadow 0.18s' };
  const focus = e => { e.target.style.borderColor=C.primary; e.target.style.boxShadow=`0 0 0 3px ${C.primarySoft}`; };
  const blur  = e => { e.target.style.borderColor=C.border;  e.target.style.boxShadow='none'; };

  return (
    <>
      <Toast toast={toast} />
      {confirmId && (
        <div style={{ position:'fixed',inset:0,zIndex:900,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.3)',backdropFilter:'blur(3px)' }}>
          <Card style={{ width:'100%',maxWidth:360,margin:'0 16px',padding:26,textAlign:'center',boxShadow:C.shLg }}>
            <div style={{ width:48,height:48,borderRadius:10,background:C.redSoft,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,margin:'0 auto 12px' }}>🗑️</div>
            <h3 style={{ fontWeight:700,color:C.text,fontSize:15,margin:'0 0 8px' }}>Delete Document?</h3>
            <p style={{ color:C.textMuted,fontSize:13,margin:'0 0 20px' }}>This permanently removes the document and its indexed content.</p>
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={()=>setConfirmId(null)} style={{ flex:1,padding:'9px',borderRadius:6,border:`1px solid ${C.border}`,background:C.surface,color:C.textMd,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>Cancel</button>
              <button onClick={del} disabled={!!deletingId} style={{ flex:1,padding:'9px',borderRadius:6,border:'none',background:C.red,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',opacity:deletingId?.5:1 }}>
                {deletingId?'Deleting…':'Yes, Delete'}
              </button>
            </div>
          </Card>
        </div>
      )}

      <div style={{ display:'grid',gridTemplateColumns:'320px 1fr',gap:18 }}>
        {/* Upload panel */}
        <Card style={{ padding:18,position:'sticky',top:72,alignSelf:'start' }}>
          <p style={{ fontWeight:700,color:C.text,fontSize:13,margin:'0 0 14px' }}>Upload Document</p>
          <div style={{ display:'flex',borderRadius:6,overflow:'hidden',border:`1px solid ${C.border}`,marginBottom:14 }}>
            {['file','text'].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{ flex:1,padding:'7px 4px',fontSize:12,fontWeight:600,border:'none',cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s',background:tab===t?C.primarySoft:C.surface,color:tab===t?C.primary:C.textMd,borderRight:t==='file'?`1px solid ${C.border}`:'none' }}>
                {t==='file'?'📎 File':'📝 Text'}
              </button>
            ))}
          </div>
          <form onSubmit={submit} style={{ display:'flex',flexDirection:'column',gap:10 }}>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Document title *" style={inp} onFocus={focus} onBlur={blur} />
            {tab==='file' ? (
              <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f){setFile(f);setTab('file');}}} onClick={()=>fileRef.current?.click()}
                style={{ padding:20,borderRadius:6,textAlign:'center',cursor:'pointer',border:`2px dashed ${dragOver?C.primary:C.border}`,background:dragOver?C.primarySoft:C.surfaceAlt,transition:'all 0.18s' }}>
                <div style={{ fontSize:24,marginBottom:4 }}>{file?'📄':'☁️'}</div>
                <p style={{ fontSize:12,color:C.textMuted,margin:0 }}>{file?file.name:'Drop or click to browse'}</p>
                {file&&<button type="button" onClick={e=>{e.stopPropagation();setFile(null);if(fileRef.current)fileRef.current.value='';}} style={{ marginTop:6,fontSize:11,padding:'3px 9px',borderRadius:5,border:'none',background:C.redSoft,color:C.red,cursor:'pointer' }}>Remove</button>}
                <input ref={fileRef} type="file" style={{ display:'none' }} onChange={e=>setFile(e.target.files[0])} />
              </div>
            ):(
              <textarea value={rawText} onChange={e=>setRawText(e.target.value)} rows={5} placeholder="Paste text content here…" style={{ ...inp,resize:'vertical' }} onFocus={focus} onBlur={blur} />
            )}
            <button type="submit" disabled={uploading} style={{ padding:'10px',borderRadius:6,border:'none',background:uploading?C.primaryMid:`linear-gradient(135deg,${C.primaryDk},${C.primary})`,color:uploading?C.primary:'#fff',fontSize:13,fontWeight:700,cursor:uploading?'not-allowed':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:uploading?'none':'0 2px 8px rgba(30,99,200,0.25)',transition:'all 0.18s' }}>
              {uploading?<><Spinner size={15}/>Indexing…</>:'⚡ Index Document'}
            </button>
          </form>
        </Card>

        {/* List */}
        <div>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
            <p style={{ fontWeight:700,color:C.text,fontSize:14,margin:0 }}>
              Indexed Documents {!loading&&<span style={{ fontWeight:400,color:C.textMuted,fontSize:13 }}>({docs.length})</span>}
            </p>
            <button onClick={refresh} title="Refresh" style={{ width:30,height:30,borderRadius:6,border:`1px solid ${C.border}`,background:C.surface,color:C.primary,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation:loading?'spin 1s linear infinite':'none' }}>
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
          </div>
          {loading ? <div style={{ display:'flex',flexDirection:'column',alignItems:'center',padding:72,gap:10 }}><Spinner/><p style={{ color:C.textMuted,fontSize:13 }}>Loading…</p></div>
            : docs.length===0 ? <Empty icon="📭" title="No documents indexed" sub="Upload your first document to train the AI"/>
            : <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              {docs.map(doc=>(
                <Card key={doc.id} style={{ padding:14,display:'flex',alignItems:'flex-start',gap:12 }}>
                  <div style={{ width:38,height:38,borderRadius:8,background:C.primarySoft,border:`1px solid ${C.primaryMid}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0 }}>
                    {doc.filename?.endsWith('.pdf')?'📕':doc.filename?'📄':'📝'}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8 }}>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontWeight:600,fontSize:13,color:C.text,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{doc.title||doc.filename}</p>
                        {doc.filename&&<p style={{ fontSize:11,color:C.textMuted,margin:'2px 0 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{doc.filename}</p>}
                      </div>
                      <div style={{ display:'flex',gap:5,flexShrink:0 }}>
                        {doc.filename&&<a href={`${api.downloadDocument(doc.id)}?mode=inline`} target="_blank" rel="noreferrer" style={{ width:26,height:26,borderRadius:5,border:`1px solid ${C.border}`,background:C.surface,color:C.primary,display:'flex',alignItems:'center',justifyContent:'center' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </a>}
                        <button onClick={()=>setConfirmId(doc.id)} style={{ width:26,height:26,borderRadius:5,border:`1px solid #fecaca`,background:C.redSoft,color:C.red,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                        </button>
                      </div>
                    </div>
                    {doc.content&&<p style={{ fontSize:12,color:C.textMuted,margin:'6px 0 0',lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>{doc.content}</p>}
                    <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:8,flexWrap:'wrap' }}>
                      <Chip color="green">✓ Indexed</Chip>
                      <span style={{ fontSize:11,color:C.textMuted }}>{fmtDate(doc.uploaded_at)}</span>
                      {doc.filename&&<Chip color="gray">{doc.filename.split('.').pop().toUpperCase()}</Chip>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          }
        </div>
      </div>
    </>
  );
}

/* ─────────── Sessions list ─────────── */
function Sessions({ sessions, loading, onSelect }) {
  const [q, setQ] = useState('');
  const list = sessions.filter(s => !q || s.session_name?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:14 }}>
        <div style={{ flex:1,display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:6,background:C.surface,border:`1.5px solid ${C.border}` }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search sessions…" style={{ flex:1,border:'none',outline:'none',fontSize:13,color:C.text,background:'transparent',fontFamily:'inherit' }} />
        </div>
        {!loading&&<Chip color="blue">{list.length} sessions</Chip>}
      </div>
      {loading ? <div style={{ display:'flex',flexDirection:'column',alignItems:'center',padding:72,gap:10 }}><Spinner/><p style={{ color:C.textMuted,fontSize:13 }}>Loading…</p></div>
        : list.length===0 ? <Empty icon="🗂️" title="No sessions found" sub={q?'Try another search':'No sessions yet'}/>
        : <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          {list.map(s=>(
            <button key={s.id} onClick={()=>onSelect(s)} style={{ width:'100%',textAlign:'left',padding:14,borderRadius:8,cursor:'pointer',background:C.surface,border:`1px solid ${C.border}`,boxShadow:C.sh,display:'flex',alignItems:'center',gap:12,transition:'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.primaryMid;e.currentTarget.style.boxShadow=C.shMd;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow=C.sh;}}>
              <div style={{ width:40,height:40,borderRadius:8,background:C.greenSoft,border:'1px solid #a7f3d0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>💬</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',gap:8 }}>
                  <p style={{ fontWeight:600,fontSize:13,color:C.text,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{s.session_name||`Session #${s.id}`}</p>
                  <span style={{ fontSize:12,color:C.textMuted,flexShrink:0 }}>{fmtRel(s.created_at)}</span>
                </div>
                <div style={{ display:'flex',gap:6,marginTop:4 }}>
                  <Chip color="gray">ID #{s.id}</Chip>
                  <span style={{ fontSize:12,color:C.textMuted }}>{fmtDate(s.created_at)}</span>
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          ))}
        </div>
      }
    </div>
  );
}

/* ─────────── Session detail ─────────── */
const _cc={}, _cp={};
function fetchChats(id) {
  if(_cc[id]) return Promise.resolve(_cc[id]);
  if(_cp[id]) return _cp[id];
  _cp[id]=api.getChats(id).then(r=>{const d=Array.isArray(r)?r:(r?.data||[]);_cc[id]=d;return d;});
  return _cp[id];
}

function SessionDetail({ session }) {
  const [chats, setChats] = useState(_cc[session.id]||[]);
  const [loading,setLoading]=useState(!_cc[session.id]);
  const bot=useRef(null);

  useEffect(()=>{
    if(_cc[session.id])return;
    let ok=true;
    fetchChats(session.id).then(d=>{if(ok){setChats(d);setLoading(false);}}).catch(e=>{console.error(e);if(ok)setLoading(false);});
    return ()=>{ok=false;};
  },[session.id]);

  useEffect(()=>{bot.current?.scrollIntoView({behavior:'smooth'});},[chats]);

  const msgs = chats.map((c,i)=>({...c,role:i%2===0?'user':'bot'}));

  return (
    <div>
      <Card style={{ padding:14,marginBottom:14,display:'flex',alignItems:'center',gap:12 }}>
        <div style={{ width:40,height:40,borderRadius:8,background:C.greenSoft,border:'1px solid #a7f3d0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>💬</div>
        <div>
          <p style={{ fontWeight:700,fontSize:14,color:C.text,margin:0 }}>{session.session_name||`Session #${session.id}`}</p>
          <div style={{ display:'flex',gap:6,marginTop:4 }}>
            <Chip color="gray">ID #{session.id}</Chip>
            <span style={{ fontSize:12,color:C.textMuted }}>Created {fmtDate(session.created_at)}</span>
            {!loading&&<span style={{ fontSize:12,color:C.textMuted }}>{chats.length} messages</span>}
          </div>
        </div>
      </Card>

      {loading ? <div style={{ display:'flex',flexDirection:'column',alignItems:'center',padding:72,gap:10 }}><Spinner/><p style={{ color:C.textMuted,fontSize:13 }}>Loading…</p></div>
        : msgs.length===0 ? <Empty icon="💭" title="No messages" sub="This session has no recorded messages"/>
        : <Card style={{ overflow:'hidden' }}>
          <div style={{ padding:'8px 14px',background:C.surfaceAlt,borderBottom:`1px solid ${C.borderLight}`,display:'flex',alignItems:'center',gap:6 }}>
            <span style={{ width:7,height:7,borderRadius:'50%',background:C.green }} />
            <span style={{ fontSize:12,fontWeight:600,color:C.textMd }}>Conversation Thread</span>
          </div>
          <div style={{ padding:16,display:'flex',flexDirection:'column',gap:12,maxHeight:540,overflowY:'auto' }}>
            {msgs.map((msg,idx)=>{
              const u=msg.role==='user';
              return (
                <div key={msg.id??idx} style={{ display:'flex',alignItems:'flex-end',gap:8,flexDirection:u?'row-reverse':'row' }}>
                  <div style={{ width:28,height:28,borderRadius:6,flexShrink:0,background:u?C.primarySoft:C.greenSoft,border:`1px solid ${u?C.primaryMid:'#a7f3d0'}`,color:u?C.primary:C.green,fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center' }}>{u?'U':'AI'}</div>
                  <div style={{ maxWidth:'68%' }}>
                    <div style={{ padding:'9px 13px',fontSize:13,lineHeight:1.55,background:u?`linear-gradient(135deg,${C.primaryDk},${C.primary})`:C.surfaceAlt,color:u?'#fff':C.text,border:u?'none':`1px solid ${C.border}`,borderRadius:u?'12px 12px 3px 12px':'12px 12px 12px 3px',wordBreak:'break-word',whiteSpace:'pre-wrap',boxShadow:C.sh }}>{msg.message}</div>
                    <p style={{ fontSize:11,color:C.textMuted,margin:'3px 0 0',textAlign:u?'right':'left' }}>{fmtTime(msg.created_at)}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bot}/>
          </div>
        </Card>
      }
    </div>
  );
}

/* ─────────── Leads ─────────── */
function Leads({ leads, loading }) {
  const [q,setQ]=useState('');
  const list=leads.filter(l=>!q||l.first_name?.toLowerCase().includes(q.toLowerCase())||l.email?.toLowerCase().includes(q.toLowerCase())||l.phone?.includes(q));
  return (
    <div>
      <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:14 }}>
        <div style={{ flex:1,display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:6,background:C.surface,border:`1.5px solid ${C.border}` }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, email, phone…" style={{ flex:1,border:'none',outline:'none',fontSize:13,color:C.text,background:'transparent',fontFamily:'inherit' }}/>
        </div>
        {!loading&&<Chip color="purple">{list.length} leads</Chip>}
      </div>
      {loading ? <div style={{ display:'flex',flexDirection:'column',alignItems:'center',padding:72,gap:10 }}><Spinner/><p style={{ color:C.textMuted,fontSize:13 }}>Loading…</p></div>
        : list.length===0 ? <Empty icon="📋" title="No leads found" sub={q?'Try another search':'No leads captured yet'}/>
        : <Card style={{ overflow:'hidden' }}>
          <div style={{ display:'grid',gridTemplateColumns:'2fr 2fr 1.5fr 1fr',gap:12,padding:'9px 18px',background:C.surfaceAlt,borderBottom:`1px solid ${C.border}` }}>
            {['Name','Email','Phone','Date'].map(h=><span key={h} style={{ fontSize:11,fontWeight:700,color:C.textMuted,textTransform:'uppercase',letterSpacing:'0.07em' }}>{h}</span>)}
          </div>
          {list.map((lead,i)=>(
            <div key={lead.id} style={{ display:'grid',gridTemplateColumns:'2fr 2fr 1.5fr 1fr',gap:12,padding:'12px 18px',alignItems:'center',borderBottom:i<list.length-1?`1px solid ${C.borderLight}`:'none',transition:'background 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background=C.surfaceAlt}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{ display:'flex',alignItems:'center',gap:8,minWidth:0 }}>
                <div style={{ width:30,height:30,borderRadius:6,background:C.primarySoft,border:`1px solid ${C.primaryMid}`,color:C.primary,fontWeight:700,fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>{lead.first_name?.[0]?.toUpperCase()||'?'}</div>
                <span style={{ fontWeight:600,fontSize:13,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{lead.first_name||'—'}</span>
              </div>
              <a href={`mailto:${lead.email}`} style={{ fontSize:13,color:C.textMd,textDecoration:'none',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'block' }} onMouseEnter={e=>e.target.style.color=C.primary} onMouseLeave={e=>e.target.style.color=C.textMd}>{lead.email||'—'}</a>
              <a href={`tel:${lead.phone}`} style={{ fontSize:13,color:C.textMd,textDecoration:'none' }} onMouseEnter={e=>e.target.style.color=C.primary} onMouseLeave={e=>e.target.style.color=C.textMd}>{lead.phone||'—'}</a>
              <span style={{ fontSize:12,color:C.textMuted }}>{fmtDate(lead.created_at)}</span>
            </div>
          ))}
        </Card>
      }
    </div>
  );
}

/* ─────────── Cache ─────────── */
let _cache=null, _promise=null;
function fetchAll() {
  if(_cache) return Promise.resolve(_cache);
  if(_promise) return _promise;
  _promise=Promise.allSettled([api.getDocuments(),api.getSessions(),api.getLeads()]).then(([d,s,l])=>{
    _cache={
      docs:     d.status==='fulfilled'?(Array.isArray(d.value)?d.value:(d.value?.data||[])):[] ,
      sessions: s.status==='fulfilled'?(Array.isArray(s.value)?s.value:(s.value?.data||[])):[] ,
      leads:    l.status==='fulfilled'?(Array.isArray(l.value)?l.value:(l.value?.data||[])):[] ,
    };
    return _cache;
  });
  return _promise;
}

/* ─────────── Page ─────────── */
export default function DocumentsPage() {
  const navigate = useNavigate();
  const [docs,setSessions2]=[useState([]),useState([])].map(a=>a); // temp
  // proper state:
  const [docsList,  setDocs]     = useState([]);
  const [sessList,  setSessions] = useState([]);
  const [leadsList, setLeads]    = useState([]);
  const [loading,   setLoading]  = useState(!_cache);
  const [view,      setView]     = useState('hub');
  const [selSession,setSelSession]=useState(null);

  useEffect(()=>{
    if(_cache){setDocs(_cache.docs);setSessions(_cache.sessions);setLeads(_cache.leads);setLoading(false);return;}
    let ok=true;
    fetchAll().then(d=>{ if(!ok)return; setDocs(d.docs);setSessions(d.sessions);setLeads(d.leads);setLoading(false); });
    return ()=>{ok=false;};
  },[]);

  const handleLogout=()=>{
    const rt=localStorage.getItem('admin_refresh_token');
    const at=localStorage.getItem('admin_access_token');
    ['admin_access_token','admin_refresh_token','admin_user_email','admin_user_name'].forEach(k=>localStorage.removeItem(k));
    _cache=null; _promise=null;
    Object.keys(_cc).forEach(k=>{delete _cc[k];delete _cp[k];});
    navigate('/login',{replace:true});
    if(rt&&at) fetch(`${import.meta.env.VITE_API_BASE_URL||''}/api/auth/logout/`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${at}`},body:JSON.stringify({refresh:rt})}).catch(()=>{});
  };

  const goTo = v => { setSelSession(null); setView(v); };

  const TABS=[
    {id:'hub',       label:'Overview',  icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>},
    {id:'documents', label:'Documents', icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>},
    {id:'sessions',  label:'Sessions',  icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>},
    {id:'leads',     label:'Leads',     icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>},
  ];

  const CRUMBS={
    hub:              [{label:'Command Center'}],
    documents:        [{label:'Command Center',onClick:()=>goTo('hub')},{label:'Documents'}],
    sessions:         [{label:'Command Center',onClick:()=>goTo('hub')},{label:'Sessions & Chats'}],
    'session-detail': [{label:'Command Center',onClick:()=>goTo('hub')},{label:'Sessions & Chats',onClick:()=>goTo('sessions')},{label:selSession?.session_name||`Session #${selSession?.id}`}],
    leads:            [{label:'Command Center',onClick:()=>goTo('hub')},{label:'Leads'}],
  };
  const TITLE={hub:'Command Center',documents:'Documents',sessions:'Sessions & Chats','session-detail':selSession?.session_name||`Session #${selSession?.id}`,leads:'Leads'};

  return (
    <div style={{ minHeight:'100vh',background:C.bg,fontFamily:"'Segoe UI','Helvetica Neue',Arial,sans-serif",color:C.text }}>

      {/* ── Header: exactly my.oodles.io style ── */}
      <header style={{ position:'sticky',top:0,zIndex:200,background:C.surface,borderBottom:`1px solid ${C.border}`,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',height:58,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px' }}>

        {/* Logo */}
        <div style={{ display:'flex',alignItems:'center',gap:8,flexShrink:0 }}>
          <img src="https://my.oodles.io/assets/icons/oodleslogo.svg" alt="Oodles" style={{ height:30,objectFit:'contain' }}
            onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}}/>
          <div style={{ display:'none',alignItems:'center',gap:6 }}>
            <div style={{ width:26,height:26,borderRadius:5,background:`linear-gradient(135deg,${C.primary},${C.primaryDk})`,color:'#fff',fontWeight:800,fontSize:12,display:'flex',alignItems:'center',justifyContent:'center' }}>O</div>
            <span style={{ fontWeight:700,fontSize:15,color:C.text }}>Oodles</span>
          </div>
        </div>

        {/* Centre nav — icon above label, active = blue underline */}
        <nav style={{ display:'flex',alignItems:'stretch',gap:2,height:'100%' }}>
          {TABS.map(tab=>{
            const active=view===tab.id||(view==='session-detail'&&tab.id==='sessions');
            return (
              <button key={tab.id} onClick={()=>goTo(tab.id)} style={{
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,
                padding:'0 16px',border:'none',cursor:'pointer',fontFamily:'inherit',
                background:'transparent',
                color:active?C.primary:C.textMd,
                borderBottom:active?`2.5px solid ${C.primary}`:'2.5px solid transparent',
                fontSize:12,fontWeight:active?700:500,
                transition:'all 0.15s',
              }}
                onMouseEnter={e=>{if(!active){e.currentTarget.style.color=C.primary;e.currentTarget.style.background=C.primarySoft;}}}
                onMouseLeave={e=>{if(!active){e.currentTarget.style.color=C.textMd;e.currentTarget.style.background='transparent';}}}>
                <span style={{ display:'flex',color:'inherit' }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: user menu */}
        <UserMenu onLogout={handleLogout} />
      </header>

      {/* ── Content ── */}
      <main style={{ maxWidth:1120,margin:'0 auto',padding:'24px 24px' }}>
        <div style={{ marginBottom:20 }}>
          <Crumbs items={CRUMBS[view]||[]} />
          <h1 style={{ fontSize:20,fontWeight:800,color:C.text,margin:'4px 0 0' }}>{TITLE[view]}</h1>
          {view==='hub'&&<p style={{ fontSize:13,color:C.textMuted,margin:'4px 0 0' }}>Manage your AI knowledge base, monitor conversations, and track captured leads.</p>}
          {view==='session-detail'&&selSession&&<p style={{ fontSize:13,color:C.textMuted,margin:'4px 0 0' }}>Created {fmtDate(selSession.created_at)}</p>}
        </div>

        {view==='hub'            && <Hub docs={docsList} sessions={sessList} leads={leadsList} loading={loading} onNav={goTo}/>}
        {view==='documents'      && <Docs docs={docsList} loading={loading} onChange={setDocs}/>}
        {view==='sessions'       && <Sessions sessions={sessList} loading={loading} onSelect={s=>{setSelSession(s);setView('session-detail');}}/>}
        {view==='session-detail' && selSession && <SessionDetail session={selSession}/>}
        {view==='leads'          && <Leads leads={leadsList} loading={loading}/>}
      </main>

      <style>{`
        *{box-sizing:border-box;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}