import { createContext, useContext, useState, useEffect } from 'react'

export type LearningMode = 'language' | 'medical'

interface LearningPathContextType {
  mode: LearningMode
  chapter: string
  lesson: string
  translationLang: 'en' | 'ar'
  setMode: (mode: LearningMode) => void
  setChapter: (chapter: string) => void
  setLesson: (lesson: string) => void
  setTranslationLang: (lang: 'en' | 'ar') => void
  chaptersList: string[]
  lessonsList: string[]
}

const LearningPathContext = createContext<LearningPathContextType | undefined>(undefined)

export function LearningPathProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<LearningMode>(() => {
    return (localStorage.getItem('riefy_curr_mode') as LearningMode) || 'language'
  })

  const [translationLang, setTranslationLangState] = useState<'en' | 'ar'>(() => {
    return (localStorage.getItem('riefy_trans_lang') as 'en' | 'ar') || 'en'
  })

  // List of available chapters/levels depending on mode
  const chaptersList = mode === 'medical' 
    ? ['Cardiology', 'Pulmonology', 'Gastroenterology'] 
    : ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

  const [chapter, setChapterState] = useState<string>(() => {
    const saved = localStorage.getItem(`riefy_curr_chapter_${mode}`)
    if (saved) return saved
    return mode === 'medical' ? 'Cardiology' : 'A1'
  })

  // List of lessons depending on active chapter
  const getLessonsForChapter = (ch: string) => {
    if (mode === 'medical') {
      if (ch === 'Cardiology') return ['all', 'IHD', 'Arrhythmia', 'Heart Failure']
      if (ch === 'Pulmonology') return ['all', 'Asthma', 'COPD', 'Pneumonia']
      return ['all', 'GERD', 'IBD']
    } else {
      return ['all', 'Lecture 1: Basics', 'Lecture 2: Daily Life', 'Lecture 3: Advanced']
    }
  }

  const lessonsList = getLessonsForChapter(chapter)

  const [lesson, setLessonState] = useState<string>(() => {
    const saved = localStorage.getItem(`riefy_curr_lesson_${mode}_${chapter}`)
    if (saved && getLessonsForChapter(chapter).includes(saved)) return saved
    return 'all'
  })

  // Synchronize when mode changes
  const setMode = (newMode: LearningMode) => {
    setModeState(newMode)
    localStorage.setItem('riefy_curr_mode', newMode)
    window.dispatchEvent(new Event('riefy_mode_change'))
    
    // Load or set default chapter/lesson for that mode
    const savedCh = localStorage.getItem(`riefy_curr_chapter_${newMode}`)
    const defaultCh = newMode === 'medical' ? 'Cardiology' : 'A1'
    const targetCh = savedCh || defaultCh
    setChapterState(targetCh)

    const savedLes = localStorage.getItem(`riefy_curr_lesson_${newMode}_${targetCh}`)
    setLessonState(savedLes || 'all')
  }

  const setChapter = (newChapter: string) => {
    setChapterState(newChapter)
    localStorage.setItem(`riefy_curr_chapter_${mode}`, newChapter)

    // Reset lesson to 'all' or load saved lesson for this chapter
    const savedLes = localStorage.getItem(`riefy_curr_lesson_${mode}_${newChapter}`)
    const defaultLessons = getLessonsForChapter(newChapter)
    const targetLes = savedLes && defaultLessons.includes(savedLes) ? savedLes : 'all'
    setLessonState(targetLes)
  }

  const setLesson = (newLesson: string) => {
    setLessonState(newLesson)
    localStorage.setItem(`riefy_curr_lesson_${mode}_${chapter}`, newLesson)
  }

  const setTranslationLang = (newLang: 'en' | 'ar') => {
    setTranslationLangState(newLang)
    localStorage.setItem('riefy_trans_lang', newLang)
  }

  // Ensure default state fits constraints on mode switch
  useEffect(() => {
    localStorage.setItem(`riefy_curr_chapter_${mode}`, chapter)
    localStorage.setItem(`riefy_curr_lesson_${mode}_${chapter}`, lesson)
  }, [mode, chapter, lesson])

  return (
    <LearningPathContext.Provider value={{
      mode,
      chapter,
      lesson,
      translationLang,
      setMode,
      setChapter,
      setLesson,
      setTranslationLang,
      chaptersList,
      lessonsList
    }}>
      {children}
    </LearningPathContext.Provider>
  )
}

export function useLearningPath() {
  const context = useContext(LearningPathContext)
  if (!context) {
    throw new Error('useLearningPath must be used within a LearningPathProvider')
  }
  return context
}
