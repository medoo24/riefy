import { useState, useMemo } from 'react'
import { useSentences, useUserProgress, useVocabularyBank } from '../hooks/useData'
import ExerciseEngine from '../components/ExerciseEngine'
import type { CEFRLevel, TranslationLang } from '../types'
import { useAuth } from '../contexts/AuthContext'

const LEVELS: (CEFRLevel | 'all')[] = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const LANGS: { value: TranslationLang; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'عربي' },
]

import { useLearningPath } from '../contexts/LearningPathContext'

interface ExercisesPageProps {
  mode?: 'language' | 'medical'
}

export default function ExercisesPage({ mode = 'language' }: ExercisesPageProps) {
  const isMedical = mode === 'medical'
  const { chapter, lesson, translationLang, setTranslationLang } = useLearningPath()
  const { user, signInWithGoogle } = useAuth()
  const [googleLoading, setGoogleLoading] = useState(false)
  
  // Local level filter within the active chapter/lesson
  const levelsList = isMedical ? ['all', 'core', 'advanced', 'expert'] : ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const defaultLevel = isMedical ? 'all' : 'all' // default to all to respect curriculum chapter/lesson first
  const [level, setLevel] = useState<string>(defaultLevel)

  // Query sentences filtered by curriculum mode, level, active chapter and active lesson
  const { sentences, loading, error } = useSentences(level, mode, chapter, lesson)
  const { markComplete } = useUserProgress()
  const { saveWord } = useVocabularyBank()

  // Get translation title
  const getTranslationLangLabel = () => {
    if (isMedical) return 'Concept Explanation'
    if (translationLang === 'en') return 'Translation (English)'
    return 'الترجمة (Arabic)'
  }

  // Map Sentences to standard ExerciseItems
  const exerciseItems = useMemo(() => {
    return sentences.map(s => {
      let trans = s.translation
      if (translationLang === 'en') trans = s.translation_en ?? s.translation

      return {
        id: s.id,
        text: s.german, // For medical, s.german holds the English target text
        translation: isMedical ? (s.translation_en || s.translation || '') : trans,
        level: s.level,
        audioUrl: s.audio_url,
        extra: s.translation_de ? `Context: ${s.translation_de}` : null
      }
    })
  }, [sentences, translationLang, isMedical])

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    await signInWithGoogle()
    setGoogleLoading(false)
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <h1>{isMedical ? 'Medical Practice' : 'Tipp-Übungen'}</h1>
        <p className="text-muted">
          {isMedical 
            ? `Cardiology Practice · ${chapter} · ${lesson === 'all' ? 'All Lessons' : lesson}` 
            : `Deutsch lernen · ${chapter} · ${lesson === 'all' ? 'Alle Lektionen' : lesson}`}
        </p>
      </div>

      {/* Prominent Google Sign-In Banner for Logged Out users */}
      {!user && (
        <div className="card animate-fade" style={{
          background: 'var(--accent-dim)',
          border: '1.5px solid var(--accent)',
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 12,
          boxShadow: '0 8px 30px rgba(59, 130, 246, 0.15)'
        }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-0)', fontSize: '1.15rem' }}>
              {isMedical ? 'Connect to Cloud Progress' : 'Verbinde deinen Lernfortschritt'}
            </h3>
            <p className="text-muted text-xs" style={{ margin: '0 0 4px 0' }}>
              {isMedical 
                ? 'Sign in to save your streaks, track XP, and sync vocabulary on any device!' 
                : 'Melde dich an, um deine XP, Streaks und gelernten Wörter in der Cloud zu sichern!'}
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: '#ffffff',
              color: '#1f2937',
              border: '1px solid #d1d5db',
              fontWeight: 600,
              padding: '10px 20px',
              fontSize: '0.9rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
              cursor: 'pointer'
            }}
          >
            {googleLoading ? (
              <div className="spinner" style={{ width: 14, height: 14, margin: 0 }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24c0-1.55-.15-3.24-.47-4.75H24v9.03h12.75c-.55 2.87-2.17 5.31-4.61 6.94l7.19 5.57C43.53 36.32 46.5 30.73 46.5 24z"/>
                <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.19-5.57c-2 1.34-4.59 2.13-7.7 2.13-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            {isMedical ? 'Sign in with Google' : 'Mit Google anmelden'}
          </button>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
        {/* Level tabs (only shown in Medical Mode for concept difficulty filter) */}
        {isMedical && (
          <div className="level-tabs" style={{ marginBottom: 0 }}>
            {levelsList.map(l => (
              <button
                key={l}
                className={`level-tab${level === l ? ` active-${l}` : ''}`}
                onClick={() => setLevel(l)}
              >
                {l === 'all' ? 'All difficulties' : l}
              </button>
            ))}
          </div>
        )}

        {/* Translation language (hidden in English-only Medical mode) */}
        {!isMedical && (
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            <button
              className={`level-tab${translationLang === 'en' ? ' active-all' : ''}`}
              onClick={() => setTranslationLang('en')}
              style={{ minWidth: 'auto' }}
            >
              English
            </button>
            <button
              className={`level-tab${translationLang === 'ar' ? ' active-all' : ''}`}
              onClick={() => setTranslationLang('ar')}
              style={{ minWidth: 'auto' }}
            >
              عربي
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading && (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="spinner" />
          <p className="text-muted" style={{ marginTop: 16 }}>Lade Übungen…</p>
        </div>
      )}
      {error && (
        <div className="card" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
          Fehler: {error}
        </div>
      )}
      {!loading && !error && sentences.length === 0 && (
        <div className="empty-state">
          <p>Keine Sätze für dieses Level gefunden.</p>
          <p className="text-xs text-muted-2" style={{ marginTop: 8 }}>
            Füge Inhalte in der Supabase-Datenbank hinzu.
          </p>
        </div>
      )}
      {!loading && sentences.length > 0 && (
        <ExerciseEngine
          items={exerciseItems}
          language={isMedical ? "en-US" : "de-DE"}
          translationLangLabel={getTranslationLangLabel()}
          onCompleteItem={markComplete}
          onSaveItem={(entry) => saveWord({
            source: isMedical ? 'medical_sentences' : 'sentences',
            term: entry.term,
            translation: entry.translation,
            level: entry.level,
            language: isMedical ? 'en' : 'de'
          })}
        />
      )}
    </main>
  )
}
