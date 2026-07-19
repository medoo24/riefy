import { useState, useMemo } from 'react'
import { useSentences, useUserProgress, useVocabularyBank } from '../hooks/useData'
import ExerciseEngine from '../components/ExerciseEngine'
import type { CEFRLevel, TranslationLang } from '../types'

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
