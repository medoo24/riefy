import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useVocabularyBank, useUserProgress } from '../hooks/useData'
import { supabase } from '../lib/supabaseClient'
import { User, Save, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { vocab } = useVocabularyBank()
  const { completedIds } = useUserProgress()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!user) return
    let ignore = false
    supabase.from('profiles').select('display_name').eq('id', user.id).single()
      .then(({ data }) => {
        if (ignore) return
        if (data) setDisplayName(data.display_name ?? '')
      })
    return () => {
      ignore = true
    }
  }, [user])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').upsert({ id: user.id, display_name: displayName })
    setSaving(false)
    showToast('Gespeichert! ✓')
  }

  const handleSignOut = async () => { await signOut(); navigate('/auth') }

  if (!user) return (
    <main className="page-container">
      <div className="empty-state"><p>Bitte anmelden.</p></div>
    </main>
  )

  const knownCount = vocab.filter(v => v.status === 'known').length

  return (
    <main className="page-container">
      <div className="page-header"><h1>Profil</h1></div>

      {/* Stats */}
      <div className="stats-row" style={{ marginBottom: 32 }}>
        <div className="stat-chip">
          <div className="stat-value" style={{ color: 'var(--green)' }}>{completedIds.size}</div>
          <div className="stat-label">Sätze</div>
        </div>
        <div className="stat-chip">
          <div className="stat-value" style={{ color: 'var(--accent-light)' }}>{vocab.length}</div>
          <div className="stat-label">Vokabeln</div>
        </div>
        <div className="stat-chip">
          <div className="stat-value" style={{ color: 'var(--gold)' }}>{knownCount}</div>
          <div className="stat-label">Gelernt</div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="card" style={{ maxWidth: 480 }}>
        <h3 style={{ marginBottom: 20 }}>Einstellungen</h3>

        <div className="form-group">
          <label className="form-label">E-Mail</label>
          <input className="form-input" value={user.email ?? ''} disabled style={{ opacity: 0.6 }} />
        </div>

        <div className="form-group">
          <label className="form-label">Anzeigename</label>
          <input
            className="form-input"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Dein Name"
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15} /> Speichern
          </button>
          <button className="btn btn-ghost" onClick={handleSignOut}>
            <LogOut size={15} /> Abmelden
          </button>
        </div>
      </div>

      <div className={`toast${toast ? ' show success' : ''}`}>{toast}</div>
    </main>
  )
}
