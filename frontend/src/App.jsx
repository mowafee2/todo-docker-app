import { useState, useEffect, useRef } from 'react'

const API = '/api/todos'

const PRIORITIES = {
  low:    { label: 'Low',    dot: '#4ade80' },
  medium: { label: 'Medium', dot: '#f59e0b' },
  high:   { label: 'High',   dot: '#c84b2f' },
}

const TAGS = ['work', 'personal', 'study', 'health', 'other']

export default function App() {
  const [todos,    setTodos]    = useState([])
  const [input,    setInput]    = useState('')
  const [priority, setPriority] = useState('medium')
  const [tag,      setTag]      = useState('work')
  const [filter,   setFilter]   = useState('all')
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const inputRef = useRef(null)

  useEffect(() => { load(); inputRef.current?.focus() }, [])

  async function load() {
    try {
      setLoading(true)
      const r = await fetch(API)
      if (!r.ok) throw new Error()
      setTodos(await r.json())
      setError(null)
    } catch {
      setError('Cannot reach backend — make sure Docker is running.')
    } finally {
      setLoading(false)
    }
  }

  async function add() {
    if (!input.trim()) return
    try {
      const r = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.trim(), priority, tag }),
      })
      if (!r.ok) throw new Error()
      const newTodo = await r.json()        // ✅
      setTodos(p => [newTodo, ...p])        // ✅
      setInput('')
      inputRef.current?.focus()
    } catch { setError('Failed to add task') }
  }
  async function toggle(id) {
    const todo = todos.find(t => t._id === id)
    try {
      const r = await fetch(`${API}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !todo.done }),
      })
      if (!r.ok) throw new Error()
      const updated = await r.json()
      setTodos(p => p.map(t => t._id === id ? updated : t))
    } catch { setError('Failed to update') }
  }

  async function remove(id) {
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' })
      setTodos(p => p.filter(t => t._id !== id))
    } catch { setError('Failed to delete') }
  }

  async function clearDone() {
    const done = todos.filter(t => t.done)
    await Promise.all(done.map(t => fetch(`${API}/${t._id}`, { method: 'DELETE' })))
    setTodos(p => p.filter(t => !t.done))
  }

  const filtered = todos.filter(t =>
    filter === 'all'    ? true :
    filter === 'active' ? !t.done :
    filter === 'done'   ?  t.done :
    t.tag === filter
  )

  const counts = {
    active: todos.filter(t => !t.done).length,
    done:   todos.filter(t =>  t.done).length,
  }

  return (
    <div style={s.page}>

      {/* ── Sidebar ── */}
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoMark}>TF</div>
          <div>
            <div style={s.logoName}>TaskFlow</div>
            <div style={s.logoSub}>Docker Project</div>
          </div>
        </div>

        <nav style={s.nav}>
          <div style={s.navSection}>VIEWS</div>
          {[
            { key: 'all',    label: 'All Tasks',  count: todos.length },
            { key: 'active', label: 'Active',     count: counts.active },
            { key: 'done',   label: 'Completed',  count: counts.done },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              style={{ ...s.navItem, ...(filter === key ? s.navActive : {}) }}
              onClick={() => setFilter(key)}
            >
              <span>{label}</span>
              <span style={s.navCount}>{count}</span>
            </button>
          ))}

          <div style={{ ...s.navSection, marginTop: 24 }}>TAGS</div>
          {TAGS.map(t => (
            <button
              key={t}
              style={{ ...s.navItem, ...(filter === t ? s.navActive : {}) }}
              onClick={() => setFilter(t)}
            >
              <span style={s.tagDot} />
              <span style={{ textTransform: 'capitalize' }}>{t}</span>
            </button>
          ))}
        </nav>

        <div style={s.sidebarFooter}>
          <div style={s.pill}>● Backend: Express</div>
          <div style={s.pill}>● DB: MongoDB</div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={s.main}>

        {/* Header */}
        <header style={s.header}>
          <div>
            <h1 style={s.heading}>
              {filter === 'all'    ? 'All Tasks' :
               filter === 'active' ? 'Active Tasks' :
               filter === 'done'   ? 'Completed' :
               <span style={{ textTransform: 'capitalize' }}>{filter}</span>}
            </h1>
            <p style={s.subheading}>
              {filtered.length} task{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          {counts.done > 0 && (
            <button style={s.clearBtn} onClick={clearDone}>
              Clear {counts.done} done
            </button>
          )}
        </header>

        {/* Error */}
        {error && (
          <div style={s.error}>
            <span>⚠ {error}</span>
            <button style={s.errX} onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Input */}
        <div style={s.inputCard}>
          <input
            ref={inputRef}
            style={s.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="What needs to be done?"
          />

          <div style={s.inputMeta}>
            {/* Priority */}
            <div style={s.metaGroup}>
              <span style={s.metaLabel}>Priority</span>
              <div style={s.segmented}>
                {Object.entries(PRIORITIES).map(([k, { label, dot }]) => (
                  <button
                    key={k}
                    style={{
                      ...s.seg,
                      background: priority === k ? '#fff' : 'transparent',
                      color: priority === k ? dot : 'var(--muted)',
                      boxShadow: priority === k ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    }}
                    onClick={() => setPriority(k)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag */}
            <div style={s.metaGroup}>
              <span style={s.metaLabel}>Tag</span>
              <select
                value={tag}
                onChange={e => setTag(e.target.value)}
                style={s.select}
              >
                {TAGS.map(t => (
                  <option key={t} value={t} style={{ textTransform: 'capitalize' }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button style={s.addBtn} onClick={add} disabled={!input.trim()}>
              Add Task
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div style={s.state}>Connecting to MongoDB...</div>
        ) : filtered.length === 0 ? (
          <div style={s.state}>
            <div style={s.emptyIcon}>✓</div>
            <div>Nothing here</div>
          </div>
        ) : (
          <ul style={s.list}>
            {filtered.map((todo, i) => {
              const p = PRIORITIES[todo.priority] || PRIORITIES.medium
              return (
                <li
                  key={todo._id}
                  style={{
                    ...s.item,
                    opacity: todo.done ? 0.55 : 1,
                    animationDelay: `${i * 35}ms`,
                  }}
                >
                  {/* Priority bar */}
                  <div style={{ ...s.prioBar, background: p.dot }} />

                  {/* Checkbox */}
                  <button
                    style={{
                      ...s.checkbox,
                      borderColor: todo.done ? p.dot : 'var(--border)',
                      background: todo.done ? p.dot : 'transparent',
                    }}
                    onClick={() => toggle(todo._id)}
                  >
                    {todo.done && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}
                  </button>

                  {/* Content */}
                  <div style={s.content}>
                    <span style={{
                      ...s.text,
                      textDecoration: todo.done ? 'line-through' : 'none',
                      color: todo.done ? 'var(--done-fg)' : 'var(--ink)',
                    }}>
                      {todo.text}
                    </span>
                    <div style={s.meta}>
                      <span style={{
                        ...s.tagBadge,
                        textTransform: 'capitalize',
                      }}>{todo.tag || 'other'}</span>
                      <span style={s.dot}>·</span>
                      <span style={{ color: p.dot, fontSize: 11 }}>{p.label}</span>
                      <span style={s.dot}>·</span>
                      <span style={s.date}>
                        {new Date(todo.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Delete */}
                  <button style={s.del} onClick={() => remove(todo._id)}>✕</button>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}

/* ─── Styles ────────────────────────────────────────────── */
const s = {
  page: { display:'flex', minHeight:'100vh', background:'var(--bg)' },

  sidebar: {
    width: 220, minWidth: 220,
    background: 'var(--card)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    padding: '28px 0',
    position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
  },
  logo: { display:'flex', alignItems:'center', gap:12, padding:'0 20px 28px', borderBottom:'1px solid var(--border)' },
  logoMark: {
    width:38, height:38, borderRadius:8,
    background:'var(--accent)', color:'#fff',
    fontFamily:'var(--serif)', fontSize:16, fontWeight:700,
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  logoName: { fontFamily:'var(--serif)', fontSize:16, fontWeight:700 },
  logoSub:  { fontSize:10, color:'var(--muted)', letterSpacing:1, marginTop:1 },

  nav: { padding:'20px 12px', flex:1 },
  navSection: { fontSize:9, letterSpacing:2, color:'var(--muted)', padding:'0 8px', marginBottom:6 },
  navItem: {
    width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'8px 10px', borderRadius:6, border:'none', background:'transparent',
    color:'var(--muted)', fontSize:13, cursor:'pointer', fontFamily:'var(--mono)',
    transition:'all .15s', marginBottom:2,
  },
  navActive: { background:'var(--surface)', color:'var(--ink)' },
  navCount:  { fontSize:11, color:'var(--muted)' },
  tagDot:    { width:6, height:6, borderRadius:'50%', background:'var(--border)', marginRight:8 },

  sidebarFooter: { padding:'20px', borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:6 },
  pill: { fontSize:10, color:'var(--muted)', letterSpacing:.5 },

  main: { flex:1, padding:'40px 48px', maxWidth:760 },

  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:28 },
  heading: { fontFamily:'var(--serif)', fontSize:32, fontWeight:300, fontStyle:'italic', lineHeight:1 },
  subheading: { fontSize:12, color:'var(--muted)', marginTop:4 },

  clearBtn: {
    fontFamily:'var(--mono)', fontSize:12, color:'var(--muted)',
    border:'1px solid var(--border)', borderRadius:6, padding:'6px 14px',
    background:'transparent', cursor:'pointer', transition:'all .15s',
  },

  error: {
    background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8,
    padding:'12px 16px', marginBottom:20, display:'flex',
    justifyContent:'space-between', alignItems:'center',
    fontSize:13, color:'#dc2626',
  },
  errX: { background:'none', border:'none', color:'#dc2626', cursor:'pointer' },

  inputCard: {
    background:'var(--card)', border:'1px solid var(--border)',
    borderRadius:12, padding:20, marginBottom:24,
    boxShadow:'var(--shadow)',
  },
  input: {
    width:'100%', background:'transparent', border:'none',
    fontFamily:'var(--mono)', fontSize:15, color:'var(--ink)',
    outline:'none', padding:'4px 0 12px', borderBottom:'1px solid var(--border)',
    marginBottom:16,
  },
  inputMeta: { display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' },
  metaGroup: { display:'flex', alignItems:'center', gap:8 },
  metaLabel: { fontSize:11, color:'var(--muted)', letterSpacing:.5 },

  segmented: {
    display:'flex', background:'var(--surface)',
    borderRadius:6, padding:2, gap:1,
  },
  seg: {
    fontFamily:'var(--mono)', fontSize:11, border:'none',
    borderRadius:5, padding:'4px 10px', cursor:'pointer',
    transition:'all .15s',
  },

  select: {
    fontFamily:'var(--mono)', fontSize:12, color:'var(--ink)',
    background:'var(--surface)', border:'1px solid var(--border)',
    borderRadius:6, padding:'5px 10px', outline:'none', cursor:'pointer',
  },

  addBtn: {
    marginLeft:'auto', background:'var(--accent)', color:'#fff', border:'none',
    borderRadius:8, padding:'8px 20px', fontFamily:'var(--mono)',
    fontSize:13, cursor:'pointer', transition:'opacity .15s',
  },

  state: { textAlign:'center', padding:'80px 0', color:'var(--muted)', fontSize:13 },
  emptyIcon: { fontSize:32, marginBottom:12, color:'var(--border)' },

  list: { listStyle:'none', display:'flex', flexDirection:'column', gap:8 },
  item: {
    display:'flex', alignItems:'center', gap:14,
    background:'var(--card)', border:'1px solid var(--border)',
    borderRadius:10, padding:'14px 16px',
    boxShadow:'var(--shadow)', animation:'slideIn .2s ease both',
    transition:'opacity .2s',
    overflow:'hidden', position:'relative',
  },

  prioBar: { width:3, height:36, borderRadius:2, minWidth:3 },

  checkbox: {
    width:22, height:22, minWidth:22, borderRadius:6,
    border:'2px solid', display:'flex', alignItems:'center',
    justifyContent:'center', cursor:'pointer', transition:'all .15s',
  },

  content: { flex:1, minWidth:0 },
  text:    { fontSize:14, lineHeight:1.4, display:'block', wordBreak:'break-word', transition:'all .2s' },
  meta:    { display:'flex', alignItems:'center', gap:6, marginTop:4 },
  tagBadge: {
    fontSize:10, color:'var(--muted)',
    background:'var(--surface)', padding:'2px 7px',
    borderRadius:4, border:'1px solid var(--border)',
  },
  dot:  { color:'var(--border)', fontSize:10 },
  date: { fontSize:11, color:'var(--muted)' },

  del: {
    background:'none', border:'none', color:'var(--border)',
    cursor:'pointer', fontSize:13, padding:'4px 6px',
    borderRadius:4, transition:'color .15s', fontFamily:'var(--mono)',
  },
}
