import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useVocabularyBank, useUserProgress } from '../hooks/useData'
import { useProgress } from '../contexts/ProgressContext'
import { supabase } from '../lib/supabaseClient'
import { User, Save, LogOut, Dices, Sparkles, Check, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const EMOJIS = ['🩺', '👨‍⚕️', '👩‍⚕️', '🧠', '🦁', '👑', '⚡', '🚀', '🎓', '⚕️', '❤️', '🔥']
const FRAMES = [
  { name: 'Bronze', color: '#fb923c', desc: 'Anfänger Tier' },
  { name: 'Silver', color: '#94a3b8', desc: 'Fortgeschritten Tier' },
  { name: 'Gold', color: '#eab308', desc: 'Spezialist Tier' },
  { name: 'Platinum', color: '#3b82f6', desc: 'Legende Tier' }
]

const MILESTONES = [
  { level: 1, minXp: 0, name: 'Anfänger', medicalName: 'Pre-med Student' },
  { level: 2, minXp: 100, name: 'Novize', medicalName: 'Medical Student' },
  { level: 3, minXp: 300, name: 'Lernender', medicalName: 'Cardiology Intern' },
  { level: 4, minXp: 600, name: 'Fortgeschrittener', medicalName: 'Cardiology Resident' },
  { level: 5, minXp: 1000, name: 'Kenner', medicalName: 'Cardiology Fellow' },
  { level: 6, minXp: 1500, name: 'Könner', medicalName: 'Cardiology Specialist' },
  { level: 7, minXp: 2100, name: 'Experte', medicalName: 'Attending Cardiologist' },
  { level: 8, minXp: 2800, name: 'Großmeister', medicalName: 'Chief of Cardiology' }
]

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { vocab } = useVocabularyBank()
  const { completedIds } = useUserProgress()
  const { xp } = useProgress()
  const navigate = useNavigate()
  
  const [displayName, setDisplayName] = useState('')
  const [avatarEmoji, setAvatarEmoji] = useState('🩺')
  const [frameColor, setFrameColor] = useState('#fb923c')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!user) return
    let ignore = false
    supabase.from('profiles').select('display_name, avatar_url, native_language').eq('id', user.id).single()
      .then(({ data }) => {
        if (ignore) return
        if (data) {
          setDisplayName(data.display_name ?? '')
          setAvatarEmoji(data.avatar_url ?? '🩺')
          setFrameColor(data.native_language ?? '#fb923c')
        }
      })
    return () => {
      ignore = true
    }
  }, [user])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const handleRandomEmoji = () => {
    const random = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
    setAvatarEmoji(random)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').upsert({ 
      id: user.id, 
      display_name: displayName,
      avatar_url: avatarEmoji,
      native_language: frameColor
    })
    setSaving(false)
    // Dispatch event to refresh layout avatar
    window.dispatchEvent(new Event('riefy_mode_change'))
    showToast(frameColor === '#3b82f6' ? 'Profile saved! Legend frame active! 👑' : 'Profile saved successfully! ✓')
  }

  const handleSignOut = async () => { await signOut(); navigate('/auth') }

  if (!user) return (
    <main className="page-container">
      <div className="empty-state"><p>Bitte anmelden.</p></div>
    </main>
  )

  const knownCount = vocab.filter(v => v.status === 'known').length
  const selectedFrame = FRAMES.find(f => f.color === frameColor) || FRAMES[0]

  // Find next milestone details
  const currentMilestoneIndex = [...MILESTONES].reverse().findIndex(m => xp >= m.minXp)
  const activeMilestoneIdx = currentMilestoneIndex !== -1 ? (MILESTONES.length - 1 - currentMilestoneIndex) : 0
  const nextMilestone = activeMilestoneIdx < MILESTONES.length - 1 ? MILESTONES[activeMilestoneIdx + 1] : null
  const currentMilestone = MILESTONES[activeMilestoneIdx]
  
  const xpInCurrentLevel = xp - currentMilestone.minXp
  const xpNeededForNext = nextMilestone ? (nextMilestone.minXp - currentMilestone.minXp) : 1
  const levelProgress = Math.min((xpInCurrentLevel / xpNeededForNext) * 100, 100)

  return (
    <main className="page-container">
      <div className="page-header"><h1>Profil & Anpassung</h1></div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 24 }}>
        
        {/* Visual Card Preview Card */}
        <div className="card" style={{
          flex: '1 1 300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          padding: '30px 20px',
          border: `2px solid ${frameColor}`,
          boxShadow: `0 10px 30px ${frameColor}1a`,
          overflow: 'hidden'
        }}>
          {/* Avatar Container with glowing frame */}
          <div style={{
            width: 110,
            height: 110,
            borderRadius: '50%',
            background: 'var(--bg-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3.2rem',
            border: `5px solid ${frameColor}`,
            boxShadow: `0 0 20px ${frameColor}4d`,
            marginBottom: 16,
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            {avatarEmoji}
          </div>

          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem' }}>{displayName || 'No Name'}</h3>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: frameColor,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            background: `${frameColor}15`,
            padding: '2px 10px',
            borderRadius: 12,
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <Sparkles size={11} /> {selectedFrame.name} Member
          </div>

          {/* XP Progress Bar */}
          <div style={{ width: '100%', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: 4 }}>
              <span>Lvl {activeMilestoneIdx + 1} ({Math.round(xp)} XP)</span>
              <span>{nextMilestone ? `${Math.round(nextMilestone.minXp)} XP` : 'Max Level'}</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${levelProgress}%`, background: frameColor, borderRadius: 3 }}></div>
            </div>
          </div>

          {/* Mini Stats Inside Card */}
          <div style={{ display: 'flex', width: '100%', gap: 10, background: 'var(--bg-3)', padding: 12, borderRadius: 'var(--radius)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--green)' }}>{completedIds.size}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>Sätze</div>
            </div>
            <div style={{ flex: 1, borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-light)' }}>{vocab.length}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>Vokabeln</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--gold)' }}>{knownCount}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>Meister</div>
            </div>
          </div>
        </div>

        {/* Profile Settings Panel */}
        <div className="card" style={{ flex: '2 1 400px', maxWidth: 580 }}>
          <h3 style={{ marginBottom: 20 }}>Einstellungen</h3>

          <div className="form-group">
            <label className="form-label">E-Mail</label>
            <input className="form-input" value={user.email ?? ''} disabled style={{ opacity: 0.6 }} />
          </div>

          <div className="form-group">
            <label className="form-label">Anzeigename / Spitzname</label>
            <input
              className="form-input"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Wähle deinen Spitznamen..."
            />
          </div>

          {/* Emoji Picker Grid */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label">Profil-Emoji wählen</label>
              <button 
                type="button" 
                onClick={handleRandomEmoji}
                className="btn btn-ghost btn-sm"
                style={{ padding: '2px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Dices size={12} /> Zufällig
              </button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 8,
              background: 'var(--bg-3)',
              padding: 10,
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)'
            }}>
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarEmoji(emoji)}
                  style={{
                    fontSize: '1.6rem',
                    background: avatarEmoji === emoji ? 'var(--accent-dim)' : 'transparent',
                    border: avatarEmoji === emoji ? '1.5px solid var(--accent)' : '1px solid transparent',
                    borderRadius: 8,
                    padding: '6px 0',
                    cursor: 'pointer',
                    transition: 'all 120ms'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Colored Frame Selection */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Rang-Rahmen farbe</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {FRAMES.map(frame => (
                <button
                  key={frame.color}
                  type="button"
                  onClick={() => setFrameColor(frame.color)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 'var(--radius)',
                    border: `2px solid ${frame.color}`,
                    background: frameColor === frame.color ? `${frame.color}22` : 'var(--bg-3)',
                    color: 'var(--text-1)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 120ms'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: frame.color }}>{frame.name}</span>
                  <span style={{ fontSize: '0.58rem', opacity: 0.7 }}>{frame.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Save size={15} /> Einstellungen Speichern
            </button>
            <button className="btn btn-ghost" onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LogOut size={15} /> Abmelden
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Parallel Level Milestones Board */}
      <div className="card" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            🏆 XP Stufen-Meilensteine / Achievements
          </h3>
          <p className="text-muted text-xs" style={{ margin: 0 }}>
            Verfolge deinen akademischen Rang in beiden Lernpfaden! Dein aktueller Fortschritt schaltet Titel frei.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20
        }}>
          {/* German milestones */}
          <div style={{ background: 'var(--bg-3)', padding: 18, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 14px 0', color: 'var(--accent-light)', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              🇩🇪 Deutsch-Pfad Ränge
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MILESTONES.map((m, idx) => {
                const isUnlocked = xp >= m.minXp
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: isUnlocked ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
                    border: isUnlocked ? '1px solid rgba(34, 197, 94, 0.2)' : '1px dashed var(--border)',
                    borderRadius: 8,
                    opacity: isUnlocked ? 1 : 0.6
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, background: 'var(--bg-1)', padding: '2px 6px', borderRadius: 4 }}>
                        Lvl {m.level}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isUnlocked ? 'var(--text-0)' : 'var(--text-2)' }}>
                        {m.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 700 }}>
                      <span style={{ color: isUnlocked ? 'var(--green)' : 'var(--text-3)' }}>{m.minXp} XP</span>
                      {isUnlocked ? <Check size={14} style={{ color: 'var(--green)' }} /> : <Lock size={12} style={{ color: 'var(--text-3)' }} />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Medical milestones */}
          <div style={{ background: 'var(--bg-3)', padding: 18, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 14px 0', color: 'var(--gold)', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
              🩺 Medical Cardiologist Ränge
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MILESTONES.map((m, idx) => {
                const isUnlocked = xp >= m.minXp
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: isUnlocked ? 'rgba(234, 179, 8, 0.05)' : 'transparent',
                    border: isUnlocked ? '1px solid rgba(234, 179, 8, 0.2)' : '1px dashed var(--border)',
                    borderRadius: 8,
                    opacity: isUnlocked ? 1 : 0.6
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, background: 'var(--bg-1)', padding: '2px 6px', borderRadius: 4 }}>
                        Lvl {m.level}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isUnlocked ? 'var(--text-0)' : 'var(--text-2)' }}>
                        {m.medicalName}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 700 }}>
                      <span style={{ color: isUnlocked ? 'var(--gold)' : 'var(--text-3)' }}>{m.minXp} XP</span>
                      {isUnlocked ? <Check size={14} style={{ color: 'var(--gold)' }} /> : <Lock size={12} style={{ color: 'var(--text-3)' }} />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      <div className={`toast${toast ? ' show success' : ''}`}>{toast}</div>
    </main>
  )
}
