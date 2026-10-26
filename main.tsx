import React, { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ShieldCheck, Upload, Download, Copy, Play, FileCode2, LockKeyhole, Cloud, ChevronDown, Check, Zap, CircleHelp, ExternalLink, Terminal, Layers, Settings2, Github, Menu } from 'lucide-react'
import './style.css'

const starter = `-- Welcome to Luau Guard
-- Paste your own Luau script here.

local function greet(name)
    print("Hello, " .. name .. "!")
end

greet("Developer")
`
function App() {
  const [source,setSource] = useState(starter)
  const [project,setProject] = useState('My Luau Script')
  const [clean,setClean] = useState(false)
  const [built,setBuilt] = useState(false)
  const [tab,setTab] = useState<'editor'|'output'>('editor')
  const [copied,setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const output = useMemo(() => clean ? conservativeClean(source) : source, [source,clean])
  const size = new Blob([source]).size
  function conservativeClean(s:string) {
    // Only removes full-line comments and trims trailing whitespace.
    // It deliberately does not rewrite strings or rename identifiers.
    return s.split('\n').filter(line => !line.trimStart().startsWith('--')).map(line=>line.replace(/[ \t]+$/g,'')).join('\n').trim()+'\n'
  }
  function loadFile(file?:File) {
    if(!file) return
    const reader = new FileReader()
    reader.onload = () => { setSource(String(reader.result || '')); setProject(file.name.replace(/\.(luau|lua)$/i,'')); setBuilt(false); setTab('editor') }
    reader.readAsText(file)
  }
  function download(text:string, filename:string) {
    const url = URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}))
    const a = document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url)
  }
  async function copyUrl() {
    const url = `${window.location.origin}/releases/demo-build`
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(()=>setCopied(false),1600) } catch { window.prompt('Copy this illustrative URL:',url) }
  }
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><ShieldCheck size={21}/></div><div><strong>luau<span>guard</span></strong><small>SCRIPT WORKSPACE</small></div></div>
      <div className="workspace-label">WORKSPACE <ChevronDown size={13}/></div>
      <button className="nav-item active"><Layers size={17}/> Projects <span className="nav-count">1</span></button>
      <button className="nav-item" onClick={()=>setBuilt(false)}><Cloud size={17}/> Releases</button>
      <button className="nav-item" onClick={()=>setClean(!clean)}><Settings2 size={17}/> Protection settings</button>
      <div className="side-bottom">
        <div className="plan-card"><div className="plan-icon"><Zap size={16}/></div><strong>Starter workspace</strong><p>Local prototype · no account</p><div className="plan-meter"><span/></div><small>Frontend demo</small></div>
        <div className="user-row"><div className="avatar">LG</div><div><b>Developer</b><small>Local workspace</small></div><ChevronDown size={15}/></div>
      </div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="crumb"><span>Workspace</span><span className="slash">/</span><b>Projects</b><span className="slash">/</span><span>{project}</span></div><div className="top-actions"><span className="status-dot"></span><span className="saved-label">All changes local</span><button className="icon-button" title="Help"><CircleHelp size={17}/></button><button className="avatar mini">LG</button></div></header>
      <div className="content">
        <div className="page-head"><div><div className="eyebrow"><span className="eyebrow-line"/> LUАU PROTECTION STUDIO</div><h1>Protect your <span>work.</span></h1><p className="subtitle">Prepare, review, and package your Luau scripts in one place.</p></div><button className="button secondary" onClick={()=>fileRef.current?.click()}><Upload size={16}/> Import file</button><input ref={fileRef} type="file" accept=".lua,.luau,.txt" hidden onChange={e=>loadFile(e.target.files?.[0])}/></div>
        <div className="notice"><div className="notice-icon"><LockKeyhole size={17}/></div><div><b>Prototype mode</b><p>This starter runs in your browser. The cleanup option is not strong obfuscation, and release URLs are demo-only.</p></div><span className="notice-pill">LOCAL ONLY</span></div>
        <section className="stats">
          <div className="stat-card"><div className="stat-top"><span>Source size</span><FileCode2 size={16}/></div><div className="stat-value">{size.toLocaleString()} <small>bytes</small></div><div className="stat-foot">Current editor content</div></div>
          <div className="stat-card"><div className="stat-top"><span>Build status</span><ShieldCheck size={16}/></div><div className="stat-value">{built?'Prepared':'Not built'}</div><div className="stat-foot"><span className={built?'green-dot':'grey-dot'}/> {built?'Local output is ready':'Awaiting local preparation'}</div></div>
          <div className="stat-card"><div className="stat-top"><span>Published releases</span><Cloud size={16}/></div><div className="stat-value">—</div><div className="stat-foot">Backend not connected</div></div>
        </section>
        <section className="editor-card">
          <div className="editor-head"><div className="editor-title"><div className="file-icon"><FileCode2 size={17}/></div><div><input className="project-name" value={project} onChange={e=>setProject(e.target.value)} aria-label="Project name"/><small><span className="language-dot"/> Luau source · {source.split('\n').length} lines</small></div></div><div className="editor-tools"><button className="button subtle" onClick={()=>fileRef.current?.click()}><Upload size={15}/> Upload</button><button className="button subtle" onClick={()=>download(source,(project||'script')+'.luau')}><Download size={15}/> Export source</button></div></div>
          <div className="tabbar"><button className={tab==='editor'?'tab selected':'tab'} onClick={()=>setTab('editor')}>Source editor</button><button className={tab==='output'?'tab selected':'tab'} onClick={()=>setTab('output')}>Prepared output</button><div className="tab-spacer"/><span className="editor-language">LUAU</span></div>
          <div className="code-area"><div className="line-numbers">{(tab==='editor'?source:output).split('\n').map((_,i)=><span key={i}>{i+1}</span>)}</div><textarea spellCheck={false} value={tab==='editor'?source:output} onChange={e=>{if(tab==='editor'){setSource(e.target.value);setBuilt(false)}}} readOnly={tab==='output'} aria-label="Luau source editor" /></div>
          <div className="editor-foot"><span><span className="green-dot"/> Ready</span><span>UTF-8 <i/> LF <i/> {source.split('\n').length} lines</span></div>
        </section>
        <section className="build-section"><div className="section-heading"><div><h2>Build configuration</h2><p>Choose how to prepare your local source.</p></div><span className="beta-tag">BETA</span></div>
          <div className="config-row"><div className="config-icon"><Terminal size={18}/></div><div className="config-copy"><b>Conservative cleanup</b><p>Remove full-line comments and trailing whitespace. Does not rename variables or guarantee semantic equivalence.</p></div><label className="switch"><input type="checkbox" checked={clean} onChange={e=>{setClean(e.target.checked);setBuilt(false)}}/><span/></label></div>
          <div className="config-row"><div className="config-icon muted"><LockKeyhole size={18}/></div><div className="config-copy"><b>Advanced protection engine</b><p>Requires a server-side Luau parser and transformation pipeline. Not included in this frontend-only starter.</p></div><span className="coming-soon">BACKEND NEEDED</span></div>
          <div className="build-actions"><div className="build-note"><ShieldCheck size={16}/><span>Only run scripts you own or have permission to modify.</span></div><button className="button primary" onClick={()=>{setBuilt(true);setTab('output')}}><Play size={15} fill="currentColor"/> Prepare output <span className="shortcut">↗</span></button></div>
        </section>
        <section className="release-card"><div className="release-symbol"><Cloud size={21}/></div><div className="release-info"><h3>Hosted releases</h3><p>Connect a backend to store builds and issue real versioned HTTPS URLs. This preview is not a working script host.</p><div className="url-preview"><span><span className="url-dot"/> https://your-domain.example/releases/demo-build</span><button onClick={copyUrl}><Copy size={14}/>{copied?'Copied':'Copy preview'}</button></div></div><span className="disabled-badge">NOT CONNECTED</span></section>
        <footer><span>© 2026 Luau Guard <i/> Built for your own scripts</span><span><a href="https://luau.org/" target="_blank" rel="noreferrer">Luau docs <ExternalLink size={12}/></a><a href="https://vercel.com/docs" target="_blank" rel="noreferrer">Deploy guide <ExternalLink size={12}/></a></span></footer>
      </div>
    </main>
  </div>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)
