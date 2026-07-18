import { useState } from 'react'
import { useDialogues } from '../hooks/useData'
import { ChevronDown, ChevronUp, BookmarkPlus } from 'lucide-react'
import { useVocabularyBank } from '../hooks/useData'
import { useAuth } from '../contexts/AuthContext'
import { useLearningPath } from '../contexts/LearningPathContext'
import { useProgress } from '../contexts/ProgressContext'
import type { CEFRLevel } from '../types'

interface DialoguesPageProps {
  mode?: 'language' | 'medical'
}

export default function DialoguesPage({ mode = 'language' }: DialoguesPageProps) {
  const isMedical = mode === 'medical'
  const { chapter, lesson, translationLang } = useLearningPath()
  const { addXp } = useProgress()

  const levelsList = isMedical ? ['all', 'core', 'advanced', 'expert'] : ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const defaultLevel = 'all'

  const [level, setLevel] = useState<string>(defaultLevel)
  const { dialogues, loading } = useDialogues(level, mode, chapter, lesson)
  const { saveWord } = useVocabularyBank()
  const { user } = useAuth()
  const [openId, setOpenId] = useState<string | null>(null)
  const [rewardedIds, setRewardedIds] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const handleToggleOpen = (id: string) => {
    if (openId === id) {
      setOpenId(null)
    } else {
      setOpenId(id)
      if (!rewardedIds[id]) {
        setRewardedIds(prev => ({ ...prev, [id]: true }))
        addXp(15) // +15 XP for expanding/completing dialogue scenario
        showToast(isMedical ? 'Completed! (+15 XP) ✓' : 'Abgeschlossen! (+15 XP) ✓')
      }
    }
  }

  const handleSave = async (dialogue: any) => {
    if (!user) { showToast(isMedical ? 'Please log in' : 'Bitte anmelden'); return }
    const title = dialogue.title_de ?? dialogue.title ?? 'Dialogue'
    const translation = (isMedical || translationLang === 'en')
      ? (dialogue.title_en ?? dialogue.title)
      : (dialogue.title_ar ?? dialogue.title_en ?? '')
      
    await saveWord({
      source: isMedical ? 'medical_dialogues' : 'dialogues',
      term: title,
      translation,
      level: dialogue.level,
      language: isMedical ? 'en' : 'de',
    })
    addXp(5) // +5 XP for saving dialogue to vocab bank
    showToast(isMedical ? 'Saved! (+5 XP) ✓' : 'Gespeichert! (+5 XP) ✓')
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <h1>{isMedical ? 'Clinical Cases' : 'Dialoge'}</h1>
        <p className="text-muted">
          {isMedical 
            ? `Clinical Dialogues · ${chapter} · ${lesson === 'all' ? 'All Lessons' : lesson}` 
            : `Alltagsgespräche · ${chapter} · ${lesson === 'all' ? 'Alle Lektionen' : lesson}`}
        </p>
      </div>

      <div className="level-tabs">
        {levelsList.map(l => (
          <button key={l} className={`level-tab${level === l ? ` active-${l}` : ''}`} onClick={() => setLevel(l)}>
            {l === 'all' ? (isMedical ? 'All' : 'Alle') : l}
          </button>
        ))}
      </div>

      {loading && <div className="spinner" />}

      {!loading && dialogues.length === 0 && (
        <div className="empty-state">
          <p>{isMedical ? 'No clinical cases found for this track.' : 'Keine Dialoge für diese Lektion gefunden.'}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {dialogues.map((dialogue, i) => {
          const id = dialogue.id ?? String(i)
          const isOpen = openId === id
          const title = dialogue.title_de ?? dialogue.title ?? dialogue.name ?? 'Dialog'
          const titleTrans = (isMedical || translationLang === 'en')
            ? (dialogue.title_en ?? dialogue.title ?? '')
            : (dialogue.title_ar ?? dialogue.title_en ?? '')
          const lines: any[] = dialogue.lines ?? dialogue.dialogue_lines ?? dialogue.content ?? []

          return (
            <div key={id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Header */}
              <button
                onClick={() => handleToggleOpen(id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '18px 24px',
                  background: 'none', border: 'none', cursor: 'pointer', gap: 12,
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-0)', fontSize: '1rem', fontFamily: 'Inter, sans-serif' }}>{title}</div>
                  {titleTrans && (
                    <div 
                      style={{ 
                        fontSize: '0.85rem', 
                        color: 'var(--text-2)', 
                        direction: (isMedical || translationLang === 'en') ? 'ltr' : 'rtl',
                        fontFamily: (isMedical || translationLang === 'en') ? 'Inter, sans-serif' : 'Tajawal, sans-serif'
                      }}
                    >
                      {titleTrans}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span className={`level-badge level-${dialogue.level}`}>{dialogue.level}</span>
                  {isOpen ? <ChevronUp size={18} style={{ color: 'var(--text-2)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-2)' }} />}
                </div>
              </button>

              {/* Body */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '12px 24px 20px' }} className="animate-fade">
                  {lines.length > 0 ? (
                    lines.map((line: any, li: number) => {
                      const isLtrTrans = isMedical || translationLang === 'en'
                      const transText = isLtrTrans 
                        ? (line.translation_en ?? line.en ?? line.translation ?? '')
                        : (line.translation_ar ?? line.ar ?? '')

                      return (
                        <div key={li} className="dialogue-line" style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                          <div className="dialogue-speaker" style={{ fontWeight: 700, minWidth: 70, color: 'var(--accent-light)' }}>
                            {line.speaker ?? line.role ?? `P${li + 1}`}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="dialogue-german" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--text-0)' }}>
                              {line.german ?? line.text ?? line.de ?? ''}
                            </div>
                            {transText && (
                              <div
                                className="dialogue-translation"
                                dir={isLtrTrans ? 'ltr' : 'rtl'}
                                style={{
                                  textAlign: isLtrTrans ? 'left' : 'right',
                                  fontSize: '0.85rem',
                                  color: 'var(--text-2)',
                                  marginTop: 2,
                                  fontFamily: isLtrTrans ? 'Inter, sans-serif' : 'Tajawal, sans-serif'
                                }}
                              >
                                {transText}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-muted text-sm" style={{ padding: '8px 0' }}>
                      Kein Inhalt vorhanden.
                    </p>
                  )}

                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleSave(dialogue)}>
                      <BookmarkPlus size={14} /> Speichern
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className={`toast${toast ? ' show success' : ''}`}>{toast}</div>
    </main>
  )
}
