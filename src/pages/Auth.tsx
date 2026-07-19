import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Loader2, CheckCircle, LogOut, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const { user, signIn, signUp, signInWithGoogle, signOut } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      else navigate('/')
    } else {
      if (!displayName.trim()) { setError('Bitte gib deinen Namen ein.'); setLoading(false); return }
      const { error } = await signUp(email, password, displayName)
      if (error) setError(error.message)
      else setSuccess('Konto erstellt! Überprüfe deine E-Mail.')
    }
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setError(''); setSuccess('')
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
    setGoogleLoading(false)
  }

  // Signed in State Card UI
  if (user) {
    const provider = user.app_metadata?.provider || 'E-Mail'
    return (
      <div className="auth-page">
        <div className="auth-card animate-fade" style={{ textAlign: 'center', padding: '36px 28px' }}>
          <div style={{
            width: 70, height: 70, borderRadius: '50%',
            background: 'var(--green-dim)', color: 'var(--green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 20px auto', border: '2.5px solid var(--green)'
          }}>
            <CheckCircle size={36} />
          </div>

          <h2 style={{ marginBottom: 4 }}>Angemeldet</h2>
          <p className="text-muted text-sm" style={{ marginBottom: 24 }}>
            Du bist angemeldet als: <br />
            <strong style={{ color: 'var(--text-0)', fontSize: '0.92rem' }}>{user.email}</strong>
            <span style={{
              display: 'block', fontSize: '0.72rem', textTransform: 'uppercase',
              color: 'var(--accent-light)', marginTop: 6, fontWeight: 700
            }}>
              Methode: {provider}
            </span>
          </p>

          <button 
            className="btn btn-primary w-full" 
            onClick={() => navigate('/')} 
            style={{ width: '100%', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            Lernübungen starten <ArrowRight size={16} />
          </button>

          <button 
            className="btn btn-ghost w-full" 
            onClick={async () => { await signOut(); navigate('/auth') }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px solid var(--border)' }}
          >
            <LogOut size={15} /> Abmelden
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade">
        <div className="auth-logo">
          <div className="auth-logo-icon">🇩🇪</div>
          <h2 style={{ marginBottom: 4 }}>Denglisch</h2>
          <p className="text-muted text-sm">
            {mode === 'login' ? 'Willkommen zurück!' : 'Konto erstellen'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="Dein Name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">E-Mail</label>
            <input
              className="form-input"
              type="email"
              placeholder="email@beispiel.de"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Passwort</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer',
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'var(--red-dim)', borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: '0.875rem', marginBottom: 14 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ padding: '10px 14px', background: 'var(--green-dim)', borderRadius: 'var(--radius)', color: 'var(--green)', fontSize: '0.875rem', marginBottom: 14 }}>
              {success}
            </div>
          )}

          <button className="btn btn-primary w-full" type="submit" disabled={loading || googleLoading} style={{ width: '100%', marginBottom: 14 }}>
            {loading ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite', marginRight: 8 }} /> : null}
            {mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>ODER</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
        </div>

        <button
          className="btn btn-ghost w-full"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          style={{
            width: '100%',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            fontWeight: 500,
          }}
        >
          {googleLoading ? (
            <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
          ) : (
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24c0-1.55-.15-3.24-.47-4.75H24v9.03h12.75c-.55 2.87-2.17 5.31-4.61 6.94l7.19 5.57C43.53 36.32 46.5 30.73 46.5 24z"/>
              <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.19-5.57c-2 1.34-4.59 2.13-7.7 2.13-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
          )}
          Mit Google fortfahren
        </button>

        <p className="text-sm text-muted" style={{ textAlign: 'center' }}>
          {mode === 'login' ? 'Noch kein Konto?' : 'Schon ein Konto?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-light)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
          >
            {mode === 'login' ? 'Registrieren' : 'Anmelden'}
          </button>
        </p>
      </div>
    </div>
  )
}
