import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import ExercisesPage from './pages/Exercises'
import WordsPage from './pages/Words'
import DialoguesPage from './pages/Dialogues'
import LongTextsPage from './pages/LongTexts'
import GrammarPage from './pages/Grammar'
import VocabularyPage from './pages/Vocabulary'
import AuthPage from './pages/Auth'
import ProfilePage from './pages/Profile'

import { LearningPathProvider } from './contexts/LearningPathContext'
import { ProgressProvider, useProgress } from './contexts/ProgressContext'

function AppContent() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') ?? 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  
  const { showLevelUp, setShowLevelUp, currentLevelName, xp } = useProgress()

  return (
    <>
      <Routes>
        {/* Auth page — no sidebar */}
        <Route path="/auth" element={<AuthPage />} />

        {/* All other routes inside Layout */}
        <Route path="/*" element={
          <Layout theme={theme} onToggleTheme={toggleTheme}>
            <Routes>
              <Route path="/"          element={<ExercisesPage mode="language" />} />
              <Route path="/words"     element={<WordsPage mode="language" />} />
              <Route path="/dialogues" element={<DialoguesPage mode="language" />} />
              <Route path="/texts"     element={<LongTextsPage mode="language" />} />
              <Route path="/grammar"   element={<GrammarPage mode="language" />} />
              <Route path="/vocab"     element={<VocabularyPage mode="language" />} />

              {/* Medical Mode Sections */}
              <Route path="/medical"           element={<Navigate to="/medical/exercises" replace />} />
              <Route path="/medical/exercises" element={<ExercisesPage mode="medical" />} />
              <Route path="/medical/words"     element={<WordsPage mode="medical" />} />
              <Route path="/medical/dialogues" element={<DialoguesPage mode="medical" />} />
              <Route path="/medical/texts"     element={<LongTextsPage mode="medical" />} />
              <Route path="/medical/grammar"   element={<GrammarPage mode="medical" />} />
              <Route path="/medical/vocab"     element={<VocabularyPage mode="medical" />} />

              <Route path="/profile"   element={<ProfilePage />} />
              <Route path="*"          element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        } />
      </Routes>

      {/* Level Up Celebration Modal */}
      {showLevelUp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, padding: 24, backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'var(--card-bg)', border: '2px solid var(--accent)',
            borderRadius: 'var(--radius)', padding: '32px 40px', maxWidth: 440,
            width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            transform: 'scale(1.05)', transition: 'transform 0.3s ease'
          }} className="animate-fade">
            <div style={{ fontSize: '4.5rem', marginBottom: 12 }}>🏆</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-light)', marginBottom: 8 }}>Stufe Aufgestiegen!</h2>
            <p style={{ color: 'var(--text-1)', fontSize: '1rem', marginBottom: 24 }}>
              Herzlichen Glückwunsch! Du hast genug Erfahrung gesammelt und bist nun ein:
              <br />
              <strong style={{ display: 'block', fontSize: '1.25rem', marginTop: 12, color: 'var(--text-0)', textTransform: 'uppercase' }}>
                {currentLevelName}
              </strong>
            </p>
            <div style={{
              display: 'inline-flex', padding: '6px 16px', background: 'var(--accent-dim)',
              color: 'var(--accent)', borderRadius: 20, fontSize: '0.875rem', fontWeight: 700, marginBottom: 28
            }}>
              Gesamt XP: {Math.round(xp)} XP
            </div>
            <div>
              <button 
                className="btn btn-primary" 
                style={{ minWidth: 160 }}
                onClick={() => setShowLevelUp(false)}
              >
                Weiter geht's!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProgressProvider>
          <LearningPathProvider>
            <AppContent />
          </LearningPathProvider>
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
