import { useState } from 'react'
import { useWords } from '../hooks/useData'
import { BookmarkPlus, Volume2 } from 'lucide-react'
import { useVocabularyBank } from '../hooks/useData'
import { useAuth } from '../contexts/AuthContext'
import { useLearningPath } from '../contexts/LearningPathContext'
import { useProgress } from '../contexts/ProgressContext'
import type { CEFRLevel } from '../types'

interface WordsPageProps {
  mode?: 'language' | 'medical'
}

export default function WordsPage({ mode = 'language' }: WordsPageProps) {
  const isMedical = mode === 'medical'
  const { chapter, lesson, translationLang } = useLearningPath()
  const { addXp } = useProgress()

  const levelsList = isMedical ? ['all', 'core', 'advanced', 'expert'] : ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const defaultLevel = 'all'

  const [level, setLevel] = useState<string>(defaultLevel)
  const { words, loading } = useWords(level, mode, chapter, lesson)
  const { saveWord } = useVocabularyBank()
  const { user } = useAuth()
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  const handleSave = async (word: any) => {
    if (!user) { showToast(isMedical ? 'Please log in' : 'Bitte anmelden'); return }
    const term = word.german ?? word.word ?? word.term
    const trans = (isMedical || translationLang === 'en') 
      ? (word.translation_en ?? word.translation) 
      : (word.translation ?? word.translation_ar ?? '')

    await saveWord({
      source: isMedical ? 'medical_words' : 'words',
      term,
      translation: trans,
      level: word.level,
      language: isMedical ? 'en' : 'de',
    })
    addXp(5) // Award 5 XP for saving vocabulary word
    showToast(isMedical ? 'Saved! (+5 XP) ✓' : 'Gespeichert! (+5 XP) ✓')
  }

  const playAudio = (wordText: string) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(wordText)
    utterance.lang = isMedical ? 'en-US' : 'de-DE'
    window.speechSynthesis.speak(utterance)
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <h1>{isMedical ? 'Terminology' : 'Wörter'}</h1>
        <p className="text-muted">
          {isMedical 
            ? `Cardiology Vocabulary · ${chapter} · ${lesson === 'all' ? 'All Lessons' : lesson}` 
            : `Vokabeln · ${chapter} · ${lesson === 'all' ? 'Alle Lektionen' : lesson}`}
        </p>
      </div>

      {/* Level tabs (only shown in Medical Mode for concept difficulty filter) */}
      {isMedical && (
        <div className="level-tabs">
          {levelsList.map(l => (
            <button
              key={l}
              className={`level-tab${level === l ? ` active-${l}` : ''}`}
              onClick={() => setLevel(l)}
            >
              {l === 'all' ? 'All' : l}
            </button>
          ))}
        </div>
      )}

      {loading && <div className="spinner" />}

      {!loading && words.length === 0 && (
        <div className="empty-state">
          <p>{isMedical ? 'No terms found for this track.' : 'Keine Wörter für diese Lektion gefunden.'}</p>
        </div>
      )}

      <div className="words-grid">
        {words.map((word, i) => {
          const term = word.german ?? word.word ?? word.term ?? '?'
          const translation = (isMedical || translationLang === 'en')
            ? (word.translation_en ?? word.translation ?? '')
            : (word.translation ?? word.translation_ar ?? '')
          const article = isMedical ? null : (word.article ?? word.der_die_das ?? null)
          const isLtrTrans = isMedical || translationLang === 'en'

          return (
            <div key={word.id ?? i} className="word-card animate-fade">
              {article && <div className="word-article">{article}</div>}
              <div className="word-german" style={{ fontFamily: 'Inter, sans-serif' }}>{term}</div>
              <div 
                className="word-translation" 
                dir={isLtrTrans ? 'ltr' : 'rtl'} 
                style={{ 
                  fontSize: isLtrTrans ? '0.9rem' : undefined, 
                  textAlign: isLtrTrans ? 'left' : 'right',
                  fontFamily: isLtrTrans ? 'Inter, sans-serif' : 'Tajawal, sans-serif'
                }}
              >
                {translation}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                <button className="btn-icon" style={{ padding: '5px' }} onClick={() => playAudio(term)} title="Speak term">
                  <Volume2 size={14} />
                </button>
                <button className="btn-icon" style={{ padding: '5px' }} onClick={() => handleSave(word)} title="Save word">
                  <BookmarkPlus size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className={`toast${toast ? ' show success' : ''}`}>{toast}</div>
    </main>
  )
}
