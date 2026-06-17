import { useState } from 'react'
import { supabase } from './supabaseClient'

// Dark greyscale tokens — matches App.jsx
const C = {
  bg:           '#0f0f10',
  bgSurface:    '#18181a',
  text:         '#ededed',
  textMuted:    '#aaaaaa',
  textFaint:    '#858585',
  border:       'rgba(255,255,255,0.07)',
  borderMid:    '#262626',
  borderStrong: '#3a3a3a',
  accent:       '#d6d6d6',
  accentBright: '#e8e8e8',
  red:          '#b5564f',
  green:        '#4e9a6b',
}

const inputStyle = {
  width: '100%', padding: '0.75rem', marginBottom: '0.75rem',
  border: `0.5px solid ${C.borderMid}`, borderRadius: '8px',
  fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box',
  outline: 'none', background: C.bgSurface, color: C.text,
}

const linkBtn = {
  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
  color: C.accent, fontSize: '13px', fontWeight: 500, fontFamily: 'inherit',
}

export default function Login() {
  const [mode, setMode] = useState('signin')   // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [msg, setMsg] = useState(null)          // { type: 'error'|'info', text }
  const [busy, setBusy] = useState(false)

  const signInWithGoogle = async () => {
    setMsg(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) setMsg({ type: 'error', text: error.message })
  }

  const handleEmailAuth = async () => {
    if (!email.trim() || !password) {
      setMsg({ type: 'error', text: 'Email and password are required.' })
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() } },
        })
        if (error) throw error
        setMsg({ type: 'info', text: 'Check your email to confirm your account, then sign in.' })
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error
        // On success, AuthContext picks up the session automatically
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  const handleReset = async () => {
    if (!email.trim()) {
      setMsg({ type: 'error', text: 'Enter your email first, then click reset.' })
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    })
    setMsg(error
      ? { type: 'error', text: error.message }
      : { type: 'info', text: 'Password reset link sent to your email.' })
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: C.bg, padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '10px', margin: '0 auto 0.875rem',
            background: C.accentBright, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: C.bg,
          }}>W</div>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700, color: C.text }}>
            Wormpack
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: C.textMuted }}>
            Learn data engineering with an adaptive AI tutor
          </p>
        </div>

        {/* Google */}
        <button onClick={signInWithGoogle} style={{
          width: '100%', padding: '0.75rem', marginBottom: '1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
          background: C.bgSurface, border: `0.5px solid ${C.borderStrong}`, borderRadius: '8px',
          fontSize: '14px', fontWeight: 500, color: C.text, cursor: 'pointer',
          fontFamily: 'inherit',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
          <div style={{ flex: 1, height: '0.5px', background: C.borderMid }} />
          <span style={{ fontSize: '12px', color: C.textFaint }}>or</span>
          <div style={{ flex: 1, height: '0.5px', background: C.borderMid }} />
        </div>

        {/* Email/password */}
        {mode === 'signup' && (
          <input type="text" placeholder="Full name" value={fullName}
            onChange={e => setFullName(e.target.value)} style={inputStyle} />
        )}
        <input type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
          style={inputStyle} />

        {msg && (
          <p style={{
            margin: '0 0 0.875rem', fontSize: '13px', lineHeight: 1.5,
            color: msg.type === 'error' ? C.red : C.green,
          }}>
            {msg.text}
          </p>
        )}

        <button onClick={handleEmailAuth} disabled={busy} style={{
          width: '100%', padding: '0.75rem', marginBottom: '0.875rem',
          background: C.accentBright, color: C.bg, border: 'none', borderRadius: '8px',
          fontSize: '14px', fontWeight: 600, cursor: busy ? 'default' : 'pointer',
          opacity: busy ? 0.6 : 1, fontFamily: 'inherit',
        }}>
          {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>

        <div style={{ textAlign: 'center', fontSize: '13px', color: C.textMuted }}>
          {mode === 'signin' ? (
            <>
              <span>New here? </span>
              <button onClick={() => { setMode('signup'); setMsg(null) }} style={linkBtn}>
                Create an account
              </button>
              <div style={{ marginTop: '0.5rem' }}>
                <button onClick={handleReset} style={linkBtn}>Forgot password?</button>
              </div>
            </>
          ) : (
            <>
              <span>Already have an account? </span>
              <button onClick={() => { setMode('signin'); setMsg(null) }} style={linkBtn}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        html, body { margin: 0; background: ${C.bg}; }
        input::placeholder { color: ${C.textFaint}; }
        input:focus { border-color: ${C.borderStrong} !important; }
      `}</style>
    </div>
  )
}
