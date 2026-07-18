import { useState } from 'react'
import { useGrammarExercises } from '../hooks/useData'
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import type { CEFRLevel } from '../types'

const LEVELS: (CEFRLevel | 'all')[] = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']

import { useLearningPath } from '../contexts/LearningPathContext'

interface GrammarPageProps {
  mode?: 'language' | 'medical'
}

export default function GrammarPage({ mode = 'language' }: GrammarPageProps) {
  const isMedical = mode === 'medical'
  const { chapter, lesson } = useLearningPath()

  const levelsList = isMedical ? ['all', 'core', 'advanced', 'expert'] : ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const defaultLevel = 'all'

  const [level, setLevel] = useState<string>(defaultLevel)
  const { exercises, loading } = useGrammarExercises(level, mode, chapter, lesson)
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const exercise = exercises[idx]

  const handleSelect = (option: string) => {
    if (selected) return
    setSelected(option)
    const correct = option.trim() === (correctAnswer ?? '').trim()
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  const handleNext = () => {
    setIdx(i => Math.min(i + 1, exercises.length - 1))
    setSelected(null)
  }

  const correctAnswer = exercise?.correct_answer ?? exercise?.answer ?? exercise?.correct

  const getOptions = (ex: any): string[] => {
    if (Array.isArray(ex?.options)) return ex.options
    if (Array.isArray(ex?.choices)) return ex.choices
    if (ex?.option_a) return [ex.option_a, ex.option_b, ex.option_c, ex.option_d].filter(Boolean)
    return []
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <h1>{isMedical ? 'Quizzes & MCQs' : 'Grammatik'}</h1>
        <p className="text-muted">
          {isMedical 
            ? `Cardiology Quizzes · ${chapter} · ${lesson === 'all' ? 'All Lessons' : lesson}` 
            : `Teste dein Wissen · ${chapter} · ${lesson === 'all' ? 'Alle Lektionen' : lesson}`}
        </p>
      </div>

      <div className="level-tabs">
        {levelsList.map(l => (
          <button 
            key={l} 
            className={`level-tab${level === l ? ` active-${l}` : ''}`} 
            onClick={() => { 
              setLevel(l)
              setIdx(0)
              setSelected(null)
              setScore({ correct: 0, total: 0 }) 
            }}
          >
            {l === 'all' ? (isMedical ? 'All' : 'Alle') : l}
          </button>
        ))}
      </div>

      {score.total > 0 && (
        <div className="stats-row" style={{ marginBottom: 20 }}>
          <div className="stat-chip">
            <div className="stat-value" style={{ color: 'var(--green)' }}>{score.correct}</div>
            <div className="stat-label">{isMedical ? 'Correct' : 'Richtig'}</div>
          </div>
          <div className="stat-chip">
            <div className="stat-value" style={{ color: 'var(--red)' }}>{score.total - score.correct}</div>
            <div className="stat-label">{isMedical ? 'Wrong' : 'Falsch'}</div>
          </div>
          <div className="stat-chip">
            <div className="stat-value">{Math.round((score.correct / score.total) * 100)}%</div>
            <div className="stat-label">{isMedical ? 'Accuracy' : 'Genauigkeit'}</div>
          </div>
        </div>
      )}

      {loading && <div className="spinner" />}

      {!loading && exercises.length === 0 && (
        <div className="empty-state">
          <p>{isMedical ? 'No quizzes found.' : 'Keine Übungen gefunden. Füge Inhalte in Supabase hinzu.'}</p>
        </div>
      )}

      {!loading && exercise && (
        <div className="exercise-card animate-fade" key={exercise.id ?? idx}>
          {/* Progress */}
          <div className="flex items-center justify-between mb-4" style={{ marginBottom: 16 }}>
            <span className="text-xs text-muted-2">{idx + 1} / {exercises.length}</span>
            <span className={`level-badge level-${exercise.level}`}>{exercise.level}</span>
          </div>

          {/* Topic */}
          {exercise.topic && (
            <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent-light)', marginBottom: 12 }}>
              {exercise.topic}
            </div>
          )}

          {/* Question */}
          <div className="german-text" style={{ fontSize: '1.25rem', marginBottom: 24, fontFamily: 'Inter, sans-serif' }}>
            {exercise.question ?? exercise.frage ?? exercise.stem ?? ''}
          </div>

          {/* Options */}
          <div>
            {getOptions(exercise).map((opt: string, i: number) => {
              let cls = 'grammar-option'
              if (selected) {
                if (opt === correctAnswer) cls += ' correct'
                else if (opt === selected) cls += ' wrong'
              }
              return (
                <button key={i} className={cls} onClick={() => handleSelect(opt)} style={{ fontFamily: 'Inter, sans-serif' }}>
                  {opt}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {selected && exercise.explanation && (
            <div className="translation-reveal animate-fade" style={{ marginTop: 12 }}>
              <div className="translation-label">{isMedical ? 'Explanation / Clinical Pearl' : 'Erklärung'}</div>
              <div className="translation-text" style={{ fontFamily: 'Inter, sans-serif' }}>{exercise.explanation}</div>
            </div>
          )}

          {/* Result + next */}
          {selected && (
            <div className="flex items-center gap-2" style={{ marginTop: 16 }}>
              {selected === correctAnswer ? (
                <span style={{ color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} /> {isMedical ? 'Correct!' : 'Richtig!'}
                </span>
              ) : (
                <span style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <XCircle size={16} /> {isMedical ? `Wrong — correct: ${correctAnswer}` : `Falsch — ${correctAnswer}`}
                </span>
              )}
              {idx < exercises.length - 1 && (
                <button className="btn btn-primary btn-sm" onClick={handleNext} style={{ marginLeft: 'auto' }}>
                  {isMedical ? 'Next' : 'Weiter'} <ChevronRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
