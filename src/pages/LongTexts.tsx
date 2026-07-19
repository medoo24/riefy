import { useState } from 'react'
import { useLongTexts } from '../hooks/useData'
import { ChevronDown, ChevronUp, Volume2, Square } from 'lucide-react'
import { useLearningPath } from '../contexts/LearningPathContext'
import { useProgress } from '../contexts/ProgressContext'
import type { CEFRLevel } from '../types'

interface LongTextsPageProps {
  mode?: 'language' | 'medical'
}

export default function LongTextsPage({ mode = 'language' }: LongTextsPageProps) {
  const isMedical = mode === 'medical'
  const { chapter, lesson, translationLang } = useLearningPath()
  const { addXp } = useProgress()

  const levelsList = isMedical ? ['all', 'core', 'advanced', 'expert'] : ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const defaultLevel = 'all'

  const [level, setLevel] = useState<string>(defaultLevel)
  const { texts, loading } = useLongTexts(level, mode, chapter, lesson)
  const [openId, setOpenId] = useState<string | null>(null)
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({})
  const [rewardedIds, setRewardedIds] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState('')
  const [audioPlayingId, setAudioPlayingId] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const handleToggleTranslation = (id: string) => {
    setShowTranslation(prev => {
      const nextShow = !prev[id]
      if (nextShow && !rewardedIds[id]) {
        setRewardedIds(r => ({ ...r, [id]: true }))
        addXp(20) // +20 XP for reading case study / long text
        showToast(isMedical ? 'Read! (+20 XP) ✓' : 'Gelesen! (+20 XP) ✓')
      }
      return { ...prev, [id]: nextShow }
    })
  }

  const playAudio = (id: string, bodyText: string, titleText: string) => {
    window.speechSynthesis.cancel()
    if (audioPlayingId === id) {
      setAudioPlayingId(null)
      return
    }

    const fullSpeech = isMedical ? `Case Study: ${titleText}. ${bodyText}` : bodyText
    const utterance = new SpeechSynthesisUtterance(fullSpeech)
    utterance.lang = isMedical ? 'en-US' : 'de-DE'

    if (isMedical) {
      const allVoices = window.speechSynthesis.getVoices()
      const ukFemale = allVoices.find(v => 
        v.lang.toLowerCase().startsWith('en') && 
        v.name.toLowerCase().includes('google') && 
        v.name.toLowerCase().includes('uk') && 
        v.name.toLowerCase().includes('female')
      ) || allVoices.find(v => 
        v.lang.toLowerCase().startsWith('en') && 
        v.name.toLowerCase().includes('google')
      ) || allVoices.find(v => 
        v.lang.toLowerCase().startsWith('en')
      )
      if (ukFemale) utterance.voice = ukFemale
    }

    utterance.onstart = () => setAudioPlayingId(id)
    utterance.onend = () => setAudioPlayingId(null)
    utterance.onerror = () => setAudioPlayingId(null)

    window.speechSynthesis.speak(utterance)
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <h1>{isMedical ? 'Case Studies' : 'Lesetexte'}</h1>
        <p className="text-muted">
          {isMedical 
            ? `Clinical Case Studies · ${chapter} · ${lesson === 'all' ? 'All Lessons' : lesson}` 
            : `Lesetexte · ${chapter} · ${lesson === 'all' ? 'Alle Lektionen' : lesson}`}
        </p>
      </div>

      {/* Level tabs (only shown in Medical Mode for concept difficulty filter) */}
      {isMedical && (
        <div className="level-tabs">
          {levelsList.map(l => (
            <button key={l} className={`level-tab${level === l ? ` active-${l}` : ''}`} onClick={() => setLevel(l)}>
              {l === 'all' ? 'All' : l}
            </button>
          ))}
        </div>
      )}

      {loading && <div className="spinner" />}

      {!loading && texts.length === 0 && (
        <div className="empty-state">
          <p>{isMedical ? 'No case studies found for this track.' : 'Keine Texte für diese Lektion gefunden.'}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {texts.map((text, i) => {
          const id = text.id ?? String(i)
          const isOpen = openId === id
          const title = text.title_de ?? text.title ?? 'Text'
          
          const isLtrTrans = isMedical || translationLang === 'en'
          const titleTrans = isLtrTrans
            ? (text.title_en ?? text.title ?? '')
            : (text.title_ar ?? text.title_en ?? '')

          const body = text.body_de ?? text.content_de ?? text.body ?? text.content ?? ''
          
          const transText = isLtrTrans
            ? (text.translation_en ?? text.content_en ?? text.body_en ?? '')
            : (text.translation_ar ?? text.content_ar ?? '')

          return (
            <div key={id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <button
                onClick={() => {
                  window.speechSynthesis.cancel()
                  setAudioPlayingId(null)
                  setOpenId(isOpen ? null : id)
                }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer', gap: 12,
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-0)', fontSize: '1rem', fontFamily: 'Inter, sans-serif' }}>{title}</div>
                  {titleTrans && (
                    <div 
                      style={{ 
                        fontSize: '0.85rem', 
                        color: 'var(--text-2)', 
                        direction: isLtrTrans ? 'ltr' : 'rtl',
                        fontFamily: isLtrTrans ? 'Inter, sans-serif' : 'Tajawal, sans-serif'
                      }}
                    >
                      {titleTrans}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span className={`level-badge level-${text.level}`}>{text.level}</span>
                  {isOpen ? <ChevronUp size={18} style={{ color: 'var(--text-2)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-2)' }} />}
                </div>
              </button>

              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '20px 24px' }} className="animate-fade">
                  <p style={{ color: 'var(--text-1)', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: 16, fontFamily: 'Inter, sans-serif' }}>
                    {body}
                  </p>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => playAudio(id, body, title)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {audioPlayingId === id ? <Square size={14} /> : <Volume2 size={14} />}
                      {audioPlayingId === id ? (isMedical ? 'Stop' : 'Stoppen') : (isMedical ? 'Listen' : 'Anhören')}
                    </button>

                    {transText && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleToggleTranslation(id)}
                      >
                        {showTranslation[id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {showTranslation[id] 
                          ? (isMedical ? 'Hide explanation' : 'Übersetzung ausblenden') 
                          : (isMedical ? 'Show explanation' : 'Übersetzung anzeigen')}
                      </button>
                    )}
                  </div>

                  {showTranslation[id] && transText && (
                    <div style={{
                      marginTop: 14, padding: '16px 20px',
                      background: 'var(--accent-dim)', borderRadius: 'var(--radius)',
                      borderLeft: '3px solid var(--accent)',
                    }}>
                      <p style={{
                        color: 'var(--text-1)', lineHeight: 1.8, whiteSpace: 'pre-wrap',
                        direction: isLtrTrans ? 'ltr' : 'rtl',
                        fontFamily: isLtrTrans ? 'Inter, sans-serif' : 'Tajawal, sans-serif'
                      }}>
                        {transText}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Toast Alert */}
      <div className={`toast${toast ? ' show' : ''}`} style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        background: 'var(--accent)',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: 'var(--radius-full)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
        transform: toast ? 'translateY(0)' : 'translateY(100px)',
        opacity: toast ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        zIndex: 10000,
        fontWeight: 600,
        fontSize: '0.9rem'
      }}>
        {toast}
      </div>
    </main>
  )
}
