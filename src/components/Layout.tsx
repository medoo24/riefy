import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  BookOpen, PenLine, Mic2, AlignLeft, Brain,
  BookMarked, User, LogOut, Sun, Moon, Menu, Stethoscope,
  GraduationCap, Trophy, Award, Clock, Hourglass, Info
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLearningPath } from '../contexts/LearningPathContext'
import { useProgress } from '../contexts/ProgressContext'

interface LayoutProps {
  children: React.ReactNode
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

const navItems = [
  { to: '/',          icon: <BookOpen size={18} />,  label: 'Übungen' },
  { to: '/words',     icon: <PenLine size={18} />,   label: 'Wörter' },
  { to: '/dialogues', icon: <Mic2 size={18} />,      label: 'Dialoge' },
  { to: '/texts',     icon: <AlignLeft size={18} />, label: 'Texte' },
  { to: '/grammar',   icon: <Brain size={18} />,     label: 'Grammatik' },
  { to: '/vocab',     icon: <BookMarked size={18} />,label: 'Vokabeln' },
]

const medicalNavItems = [
  { to: '/medical/exercises', icon: <BookOpen size={18} />,  label: 'Exercises' },
  { to: '/medical/words',     icon: <PenLine size={18} />,   label: 'Terminology' },
  { to: '/medical/dialogues', icon: <Mic2 size={18} />,      label: 'Clinical Cases' },
  { to: '/medical/texts',     icon: <AlignLeft size={18} />, label: 'Case Studies' },
  { to: '/medical/grammar',   icon: <Brain size={18} />,     label: 'Quizzes' },
  { to: '/medical/vocab',     icon: <BookMarked size={18} />,label: 'Vocabulary' },
]

// Constant curriculum mappings
const GERMAN_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const GERMAN_LECTURES = ['all', 'Lecture 1: Basics', 'Lecture 2: Daily Life', 'Lecture 3: Advanced']

const MEDICAL_CHAPTERS = ['Cardiology', 'Pulmonology', 'Gastroenterology']
const MEDICAL_LESSONS: Record<string, string[]> = {
  Cardiology: ['all', 'IHD', 'Arrhythmia', 'Heart Failure'],
  Pulmonology: ['all', 'Asthma', 'COPD', 'Pneumonia'],
  Gastroenterology: ['all', 'GERD', 'IBD']
}

export default function Layout({ children, theme, onToggleTheme }: LayoutProps) {
  const { user, signOut } = useAuth()
  const { 
    mode, 
    chapter, 
    lesson, 
    setMode, 
    setChapter, 
    setLesson,
    translationLang,
    setTranslationLang
  } = useLearningPath()
  const {
    xp,
    rank,
    totalUsers,
    todayStudyMinutes,
    sessionSeconds,
    currentLevelName
  } = useProgress()

  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showMilestones, setShowMilestones] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const sidebarContent = (
    <>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🇩🇪</div>
        <div>
          <div className="sidebar-logo-text">Riefy</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontWeight: 500 }}>Smart Learning</div>
        </div>
      </div>

      {/* Language Learning Mode */}
      <div className="nav-section" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
        <div className="nav-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>German Lernen</span>
          {/* Quick translation language selector */}
          <select
            value={translationLang}
            onChange={(e) => setTranslationLang(e.target.value as 'en' | 'ar')}
            style={{
              padding: '2px 6px',
              fontSize: '0.68rem',
              borderRadius: '4px',
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              color: 'var(--text-1)',
              cursor: 'pointer'
            }}
          >
            <option value="en">EN</option>
            <option value="ar">AR</option>
          </select>
        </div>

        {/* Level / Lecture select dropdowns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 10px 10px' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <select
              value={mode === 'language' ? chapter : 'A1'}
              onChange={(e) => {
                setMode('language')
                setChapter(e.target.value)
              }}
              style={{
                flex: 1,
                padding: '4px 6px',
                fontSize: '0.72rem',
                borderRadius: '6px',
                background: mode === 'language' ? 'var(--bg-3)' : 'var(--bg-1)',
                border: mode === 'language' ? '1px solid var(--accent)' : '1px solid var(--border)',
                color: 'var(--text-1)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {GERMAN_LEVELS.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>

            <select
              value={mode === 'language' ? lesson : 'all'}
              onChange={(e) => {
                setMode('language')
                setLesson(e.target.value)
              }}
              style={{
                flex: 2,
                padding: '4px 6px',
                fontSize: '0.72rem',
                borderRadius: '6px',
                background: mode === 'language' ? 'var(--bg-3)' : 'var(--bg-1)',
                border: mode === 'language' ? '1px solid var(--accent)' : '1px solid var(--border)',
                color: 'var(--text-1)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {GERMAN_LECTURES.map(les => (
                <option key={les} value={les}>{les}</option>
              ))}
            </select>
          </div>
        </div>

        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-link${isActive && mode === 'language' ? ' active' : ''}`}
            onClick={() => {
              setMode('language')
              setSidebarOpen(false)
            }}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Medical Mode Section */}
      <div className="nav-section">
        <div className="nav-label" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f56565' }}>
          <Stethoscope size={14} />
          <span>Medical Mode</span>
        </div>

        {/* Chapter / Lesson select dropdowns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 10px 10px' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <select
              value={mode === 'medical' ? chapter : 'Cardiology'}
              onChange={(e) => {
                setMode('medical')
                setChapter(e.target.value)
              }}
              style={{
                flex: 1,
                padding: '4px 6px',
                fontSize: '0.72rem',
                borderRadius: '6px',
                background: mode === 'medical' ? 'var(--bg-3)' : 'var(--bg-1)',
                border: mode === 'medical' ? '1px solid var(--red)' : '1px solid var(--border)',
                color: 'var(--text-1)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {MEDICAL_CHAPTERS.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>

            <select
              value={mode === 'medical' ? lesson : 'all'}
              onChange={(e) => {
                setMode('medical')
                setLesson(e.target.value)
              }}
              style={{
                flex: 1,
                padding: '4px 6px',
                fontSize: '0.72rem',
                borderRadius: '6px',
                background: mode === 'medical' ? 'var(--bg-3)' : 'var(--bg-1)',
                border: mode === 'medical' ? '1px solid var(--red)' : '1px solid var(--border)',
                color: 'var(--text-1)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {(MEDICAL_LESSONS[mode === 'medical' ? chapter : 'Cardiology'] || ['all']).map(les => (
                <option key={les} value={les}>{les}</option>
              ))}
            </select>
          </div>
        </div>

        {medicalNavItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive && mode === 'medical' ? ' active' : ''}`}
            onClick={() => {
              setMode('medical')
              setSidebarOpen(false)
            }}
            style={({ isActive }) => isActive && mode === 'medical' ? { background: 'rgba(229,62,62,0.12)', color: '#fc8181' } : {}}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="sidebar-bottom">
        <button className="nav-link" onClick={onToggleTheme}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Hell-Modus' : 'Dunkel-Modus'}
        </button>
        {user ? (
          <>
            <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <User size={18} />
              Profil
            </NavLink>
            <button className="nav-link" onClick={handleSignOut}>
              <LogOut size={18} />
              Abmelden
            </button>
          </>
        ) : (
          <NavLink to="/auth" className="nav-link" onClick={() => setSidebarOpen(false)}>
            <User size={18} />
            Anmelden
          </NavLink>
        )}
      </div>
    </>
  )

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <nav className="sidebar" style={{ display: 'flex' }}>
        {sidebarContent}
      </nav>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <nav className={`sidebar${sidebarOpen ? ' open' : ''}`} style={{
        display: 'none',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
      }}>
        {sidebarContent}
      </nav>

      <div className="main-content">
        {/* Mobile topbar */}
        <header className="topbar">
          <button className="btn-icon" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Riefy</span>
          <button className="btn-icon" onClick={onToggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        {/* Global Gamification Capsule Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '12px 18px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--card-bg)',
          flexWrap: 'wrap',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}>
          {/* Level Badge (Green) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 16,
            border: '1.5px solid rgba(52, 211, 153, 0.3)', background: 'rgba(52, 211, 153, 0.06)',
            color: '#34d399', fontSize: '0.82rem', fontWeight: 600
          }} title="Current Rank Level">
            <GraduationCap size={15} />
            <span>{currentLevelName.split(' ')[0]}</span>
          </div>

          {/* XP Score (Orange) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 16,
            border: '1.5px solid rgba(251, 146, 60, 0.3)', background: 'rgba(251, 146, 60, 0.06)',
            color: '#fb923c', fontSize: '0.82rem', fontWeight: 600
          }} title="Total Experience Points">
            <Trophy size={15} />
            <span>{xp.toFixed(1)}</span>
          </div>

          {/* Leaderboard Position (Purple) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 16,
            border: '1.5px solid rgba(192, 132, 252, 0.3)', background: 'rgba(192, 132, 252, 0.06)',
            color: '#c084fc', fontSize: '0.82rem', fontWeight: 600
          }} title="Leaderboard Ranking">
            <Award size={15} />
            <span>#{rank}/{totalUsers}</span>
          </div>

          {/* Daily Study Time (Blue) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 16,
            border: '1.5px solid rgba(96, 165, 250, 0.3)', background: 'rgba(96, 165, 250, 0.06)',
            color: '#60a5fa', fontSize: '0.82rem', fontWeight: 600
          }} title="Daily Study Time">
            <Clock size={15} />
            <span>{todayStudyMinutes}m</span>
          </div>

          {/* Session Timer (Red) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 16,
            border: '1.5px solid rgba(248, 113, 113, 0.3)', background: 'rgba(248, 113, 113, 0.06)',
            color: '#f87171', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'monospace'
          }} title="Active Session duration">
            <Hourglass size={15} />
            <span>{formatTimer(sessionSeconds)}</span>
          </div>

          {/* Info icon to show milestones */}
          <button 
            className="btn-icon" 
            onClick={() => setShowMilestones(prev => !prev)}
            style={{
              padding: '6px', borderRadius: '50%',
              border: '1.5px solid rgba(156, 163, 175, 0.3)', background: 'rgba(156, 163, 175, 0.06)',
              color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Level Milestones"
          >
            <Info size={15} />
          </button>
        </div>

        {/* Milestone info dropdown overlay */}
        {showMilestones && (
          <div style={{
            position: 'absolute', top: 56, right: 24, zIndex: 999,
            background: 'var(--card-bg)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '16px 20px', maxWidth: 300,
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: 10
          }} className="animate-fade">
            <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: 'var(--accent-light)' }}>XP Stufen-Meilensteine</h4>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-1)', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🌱 Anfänger</span>
                <strong>0 XP</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🚀 Fortgeschritten</span>
                <strong>100 XP</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🎓 Spezialist</span>
                <strong>300 XP</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>⚡ Meister</span>
                <strong>600 XP</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>👑 Legende</span>
                <strong>1000 XP</strong>
              </div>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '6px 0' }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>
              Löse Übungen, speichere Vokabeln und lies Fallstudien, um XP zu verdienen!
            </span>
          </div>
        )}

        <div style={{ padding: '0 0px 24px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
