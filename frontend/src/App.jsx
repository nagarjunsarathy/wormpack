import { useState, useRef, useEffect } from 'react'
import { useAuth } from './AuthContext'
import Login from './Login'

const API_BASE = 'http://localhost:8000'

// ── Design tokens — dark greyscale (Apple/Perplexity inspired) ───────────────
const C = {
  bg:          '#0f0f10',   // page
  bgSurface:   '#18181a',   // cards
  bgMuted:     '#202022',   // hover surfaces
  text:        '#ededed',   // primary text
  textMuted:   '#aaaaaa',   // secondary text
  textFaint:   '#858585',   // hints
  border:      'rgba(255,255,255,0.07)',
  borderMid:   '#262626',
  borderStrong:'#3a3a3a',
  accent:      '#d6d6d6',   // light silver accent
  accentBright:'#e8e8e8',
  accentDim:   'rgba(255,255,255,0.05)',
  // muted mastery colors
  blue:        '#6b9bb5',
  blueBg:      'rgba(107,155,181,0.14)',
  blueBorder:  '#6b9bb5',
  green:       '#4e9a6b',
  greenBg:     'rgba(78,154,107,0.16)',
  amber:       '#bf8b3e',
  amberBg:     'rgba(191,139,62,0.16)',
  red:         '#b5564f',
  redBg:       'rgba(181,86,79,0.16)',
  purple:      '#8a7fc7',
  purpleBg:    'rgba(138,127,199,0.16)',
}

const TOPICS = [
  { key: 'spark',            label: 'Apache Spark',    icon: '⚡', desc: 'Performance Tuning' },
  { key: 'sql',              label: 'SQL',              icon: '🗄️', desc: 'Optimization' },
  { key: 'data_engineering', label: 'Data Engineering', icon: '🔧', desc: 'Fundamentals' },
  { key: 'python',           label: 'Python',           icon: '🐍', desc: 'For Data Engineering' },
]

const EXAMPLES = {
  spark:            ['What is Apache Spark?', 'Explain DAGs in Spark', 'What causes a shuffle?'],
  sql:              ['How does a query planner work?', 'When should I use an index?', 'Explain window functions'],
  data_engineering: ['What is ETL vs ELT?', 'Explain a data lakehouse', 'What is CDC?'],
  python:           ['How do I read a Parquet file?', 'Explain pandas DataFrames', 'What is async in Python?'],
}

const MASTERY = {
  beginner:   { color: C.red,    bg: C.redBg,    bar: 15,  label: 'Beginner'   },
  developing: { color: C.amber,  bg: C.amberBg,  bar: 42,  label: 'Developing' },
  proficient: { color: C.green,  bg: C.greenBg,  bar: 72,  label: 'Proficient' },
  mastery:    { color: C.purple, bg: C.purpleBg, bar: 100, label: 'Mastery'    },
}

function scoreColor(s) {
  if (s >= 7) return C.green
  if (s >= 5) return C.amber
  return C.red
}

// ── Pointer Text Renderer ─────────────────────────────────────────────────────
// Splits pointer text so each • renders on its own line. Handles real newlines
// and the model occasionally separating bullets with just a space.
function PointerText({ text, style = {} }) {
  if (!text) return null
  const lines = text.split(/\n| (?=[•·])/).map(l => l.trim()).filter(l => l)
  return (
    <div style={style}>
      {lines.map((line, i) => {
        const isExample = line.startsWith('Example:')
        const isBullet  = line.startsWith('•') || line.startsWith('·')
        const isHeading = !isBullet && !isExample && line.endsWith(':')
        return (
          <p key={i} style={{
            margin: '0 0 6px',
            fontSize: '14px',
            lineHeight: 1.65,
            color: isExample ? C.textMuted : C.text,
            fontStyle: isExample ? 'italic' : 'normal',
            fontWeight: isHeading ? 600 : 400,
          }}>
            {line}
          </p>
        )
      })}
    </div>
  )
}

// ── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 22
  const circ = 2 * Math.PI * r
  const col = scoreColor(score)
  const fill = (score / 10) * circ
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" style={{ flexShrink: 0 }}>
      <circle cx="28" cy="28" r={r} fill="none" stroke={C.borderMid} strokeWidth="4" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={col} strokeWidth="4"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ transition: 'stroke-dasharray 0.5s ease' }} />
      <text x="28" y="33" textAnchor="middle" fontSize="14" fontWeight="600" fill={col}>
        {score}
      </text>
    </svg>
  )
}

// ── Teach Card ────────────────────────────────────────────────────────────────
function TeachCard({ data }) {
  return (
    <div style={cardStyle}>
      <p style={conceptLabelStyle}>{data.concept}</p>
      <PointerText text={data.explanation} style={{ marginBottom: '1rem' }} />
      {data.question && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0',
          background: C.accentDim, borderLeft: `3px solid ${C.accent}`,
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: C.text, lineHeight: 1.6 }}>
            {data.question}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Eval Card ─────────────────────────────────────────────────────────────────
function EvalCard({ data }) {
  const m = MASTERY[data.mastery_level] ?? MASTERY.beginner
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
        <ScoreRing score={data.score} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '11px', fontWeight: 600, padding: '2px 10px',
              borderRadius: '999px', background: m.bg, color: m.color,
            }}>{m.label}</span>
            {data.correct && (
              <span style={{ fontSize: '12px', color: C.green, fontWeight: 500 }}>✓ Correct</span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: C.textMuted, lineHeight: 1.5 }}>
            {data.encouragement}
          </p>
        </div>
      </div>

      <div style={{ height: '4px', borderRadius: '4px', background: C.borderMid, marginBottom: '0.875rem', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${m.bar}%`, background: m.color,
          borderRadius: '4px', transition: 'width 0.6s ease',
        }} />
      </div>

      {data.corrected_explanation && (
        <PointerText text={data.corrected_explanation} style={{ marginBottom: '0.75rem' }} />
      )}

      {data.misconceptions?.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          {data.misconceptions.map((mis, i) => (
            <p key={i} style={{
              margin: '4px 0', fontSize: '13px', color: C.red,
              paddingLeft: '0.75rem', borderLeft: `2px solid ${C.redBg}`,
              lineHeight: 1.5,
            }}>⚠ {mis}</p>
          ))}
        </div>
      )}

      {data.needs_remediation && data.remediation_questions?.length > 0 && (
        <div style={{ padding: '0.75rem', borderRadius: '8px', background: C.amberBg }}>
          <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: C.amber }}>
            Let's solidify the foundation first:
          </p>
          {data.remediation_questions.map((q, i) => (
            <p key={i} style={{ margin: '3px 0', fontSize: '13px', color: C.textMuted }}>
              {i + 1}. {q}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Message ───────────────────────────────────────────────────────────────────
function Message({ msg }) {
  if (msg.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
        <div style={{
          maxWidth: '76%', padding: '0.625rem 0.875rem',
          background: C.bgMuted, border: `0.5px solid ${C.border}`,
          borderRadius: '12px 12px 4px 12px',
          fontSize: '14px', color: C.text, lineHeight: 1.6,
        }}>
          {msg.content}
        </div>
      </div>
    )
  }

  const { parsed } = msg
  if (parsed?.type === 'teach')      return <TeachCard data={parsed} />
  if (parsed?.type === 'evaluation') return <EvalCard data={parsed} />
  if (parsed?.type === 'redirect') {
    return (
      <div style={cardStyle}>
        <PointerText text={parsed.message} style={{ marginBottom: parsed.question ? '0.5rem' : 0 }} />
        {parsed.question && (
          <p style={{
            margin: 0, fontSize: '14px', color: C.text, lineHeight: 1.6,
            padding: '0.625rem 0.875rem', borderRadius: '0 8px 8px 0',
            background: C.accentDim, borderLeft: `3px solid ${C.accent}`,
          }}>{parsed.question}</p>
        )}
      </div>
    )
  }
  return (
    <div style={{ padding: '0.5rem 0', fontSize: '14px', color: C.textMuted }}>
      {msg.content}
    </div>
  )
}

// ── Typing dots ───────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: '5px', padding: '0.75rem 0', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '7px', height: '7px', borderRadius: '50%',
          background: C.textFaint,
          animation: `wp-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  )
}

// ── Welcome screen ────────────────────────────────────────────────────────────
function WelcomeScreen({ topic, onSend }) {
  const t = TOPICS.find(x => x.key === topic)
  const examples = EXAMPLES[topic] ?? []
  return (
    <div style={{ textAlign: 'center', padding: '2.5rem 0.5rem 1.5rem' }}>
      <div style={{ fontSize: '52px', marginBottom: '0.75rem', lineHeight: 1 }}>{t?.icon}</div>
      <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 600, color: C.text }}>{t?.label}</h2>
      <p style={{ margin: '0 0 2rem', fontSize: '13px', color: C.textFaint }}>{t?.desc} · Adaptive mastery-based tutoring</p>
      <div style={{ textAlign: 'left' }}>
        <p style={{
          fontSize: '11px', fontWeight: 600, color: C.textFaint,
          letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.5rem',
        }}>
          Try asking
        </p>
        {examples.map(q => (
          <button key={q} onClick={() => onSend(q)} style={{
            display: 'block', width: '100%', textAlign: 'left',
            padding: '0.625rem 0.875rem', marginBottom: '6px',
            background: C.bgSurface, border: `0.5px solid ${C.borderMid}`,
            borderRadius: '8px', cursor: 'pointer',
            fontSize: '14px', color: C.text, lineHeight: 1.5,
            transition: 'background 0.12s',
            fontFamily: 'inherit',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.bgMuted }}
            onMouseLeave={e => { e.currentTarget.style.background = C.bgSurface }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Shared style objects ──────────────────────────────────────────────────────
const cardStyle = {
  background: C.bgSurface,
  border: `0.5px solid ${C.borderMid}`,
  borderRadius: '12px',
  padding: '1rem 1.25rem',
  marginBottom: '0.625rem',
}

const conceptLabelStyle = {
  margin: '0 0 0.625rem',
  fontSize: '11px', fontWeight: 600,
  letterSpacing: '0.07em', textTransform: 'uppercase',
  color: C.textFaint,
}

const ghostBtn = {
  fontSize: '12px', color: C.textMuted,
  background: 'none', border: 'none',
  cursor: 'pointer', padding: '4px 8px',
  fontFamily: 'inherit',
}

// ── Tutor (the authenticated app) ─────────────────────────────────────────────
function Tutor() {
  const { user, signOut } = useAuth()
  const [topic, setTopic]       = useState('spark')
  const [messages, setMessages] = useState([])
  const [apiMsgs, setApiMsgs]   = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [started, setStarted]   = useState(false)
  const bottomRef               = useRef(null)
  const inputRef                = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const resetSession = (newTopic) => {
    setTopic(newTopic)
    setMessages([])
    setApiMsgs([])
    setStarted(false)
    setInput('')
  }

  const sendMessage = async (text) => {
    const userText = (text ?? input).trim()
    if (!userText || loading) return

    setInput('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
    setStarted(true)

    const userApiMsg = { role: 'user', content: userText }
    const nextApiMsgs = [...apiMsgs, userApiMsg]
    setMessages(prev => [...prev, { role: 'user', content: userText }])
    setApiMsgs(nextApiMsgs)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextApiMsgs, topic }),
      })
      const data = await res.json()
      const raw = data.content ?? data.error ?? 'Something went wrong.'

      let parsed = null
      try { parsed = JSON.parse(raw) } catch (_) { /* raw text fallback */ }

      const assistantApiMsg = { role: 'assistant', content: raw }
      setApiMsgs(prev => [...prev, assistantApiMsg])
      setMessages(prev => [...prev, { role: 'assistant', content: raw, parsed }])
    } catch (_) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Could not reach localhost:8000 — is the FastAPI backend running?',
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const canSend = input.trim().length > 0 && !loading
  const currentTopic = TOPICS.find(t => t.key === topic)

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Account'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', maxWidth: '700px',
      margin: '0 auto', padding: '0 1rem',
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: C.bg, color: C.text,
    }}>

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.875rem 0 0.75rem',
        borderBottom: `0.5px solid ${C.border}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '6px',
            background: C.accentBright,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: C.bg,
          }}>W</div>
          <span style={{ fontWeight: 700, fontSize: '15px', color: C.text }}>Wormpack</span>
          <span style={{
            fontSize: '11px', color: C.textFaint,
            borderLeft: `0.5px solid ${C.border}`, paddingLeft: '0.625rem',
          }}>Adaptive Tutor</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {started && (
            <button onClick={() => resetSession(topic)} style={ghostBtn}>
              New session
            </button>
          )}
          <span style={{ fontSize: '12px', color: C.textMuted }}>{displayName}</span>
          <button onClick={signOut} style={{
            ...ghostBtn,
            border: `0.5px solid ${C.borderMid}`,
            borderRadius: '6px',
          }}>
            Log out
          </button>
        </div>
      </header>

      {/* Topic tabs */}
      <div style={{
        display: 'flex', gap: '4px',
        padding: '0.625rem 0 0.375rem',
        overflowX: 'auto', flexShrink: 0,
      }}>
        {TOPICS.map(t => {
          const active = topic === t.key
          return (
            <button key={t.key} onClick={() => resetSession(t.key)} style={{
              whiteSpace: 'nowrap', padding: '5px 13px',
              borderRadius: '999px', fontSize: '13px',
              cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: active ? 600 : 400,
              border: active ? `1px solid ${C.accent}` : `0.5px solid ${C.borderMid}`,
              background: active ? C.accentBright : 'transparent',
              color: active ? C.bg : C.textMuted,
              transition: 'all 0.12s',
            }}>
              {t.icon} {t.label}
            </button>
          )
        })}
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
        {!started && <WelcomeScreen topic={topic} onSend={sendMessage} />}
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: '0.625rem 0 1rem',
        borderTop: `0.5px solid ${C.border}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            placeholder={started
              ? 'Answer the question or ask anything…'
              : `Ask about ${currentTopic?.label}…`
            }
            rows={1}
            style={{
              flex: 1, resize: 'none', lineHeight: 1.55,
              fontSize: '14px', padding: '0.625rem 0.875rem',
              border: `0.5px solid ${C.borderMid}`,
              borderRadius: '8px',
              background: C.bgSurface, color: C.text,
              outline: 'none',
              fontFamily: 'inherit',
              overflowY: 'hidden',
            }}
            onFocus={e => { e.target.style.borderColor = C.borderStrong }}
            onBlur={e => { e.target.style.borderColor = C.borderMid }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!canSend}
            style={{
              padding: '0.625rem 1.125rem', borderRadius: '8px',
              border: `0.5px solid ${canSend ? C.accent : C.borderMid}`,
              background: canSend ? C.accentBright : 'transparent',
              color: canSend ? C.bg : C.textFaint,
              cursor: canSend ? 'pointer' : 'default',
              fontSize: '13px', fontWeight: 600,
              transition: 'all 0.12s', flexShrink: 0,
              fontFamily: 'inherit',
            }}
          >
            Send
          </button>
        </div>
        <p style={{ margin: '5px 0 0', fontSize: '11px', color: C.textFaint, textAlign: 'center' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes wp-pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.75); }
          40% { opacity: 1; transform: scale(1); }
        }
        * { box-sizing: border-box; }
        html, body { margin: 0; background: ${C.bg}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.borderStrong}; border-radius: 4px; }
        textarea::placeholder { color: ${C.textFaint}; }
      `}</style>
    </div>
  )
}

// ── Auth gate ─────────────────────────────────────────────────────────────────
export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: C.bg, color: C.textFaint, fontSize: '14px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        Loading…
      </div>
    )
  }

  return session ? <Tutor /> : <Login />
}
