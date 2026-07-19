import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Sentence, CEFRLevel } from '../types'
import { useAuth } from '../contexts/AuthContext'

export function useSentences(
  level: string | 'all',
  mode: 'language' | 'medical' = 'language',
  chapter?: string,
  lesson?: string
) {
  const [sentences, setSentences] = useState<Sentence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    let q = supabase
      .from('sentences')
      .select('*')
      .eq('mode', mode)
      .order('created_at', { ascending: true })
      
    if (level && level !== 'all') q = q.eq('level', level)
    
    if (chapter && chapter !== 'all') {
      if (mode === 'medical') {
        q = q.eq('chapter', chapter)
      } else {
        // In language mode, chapter matches the Level (e.g. A1, A2)
        q = q.eq('level', chapter)
      }
    }
    
    if (lesson && lesson !== 'all') {
      q = q.eq('lesson', lesson)
    }

    q.then(({ data, error }) => {
      if (ignore) return
      if (error) setError(error.message)
      else setSentences(data ?? [])
      setLoading(false)
    })

    return () => {
      ignore = true
    }
  }, [level, mode, chapter, lesson])

  return { sentences, loading, error }
}

export function useWords(
  level: string | 'all',
  mode: 'language' | 'medical' = 'language',
  chapter?: string,
  lesson?: string
) {
  const [words, setWords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    let q = supabase
      .from('words')
      .select('*')
      .eq('mode', mode)
      .order('created_at', { ascending: true })

    if (level && level !== 'all') q = q.eq('level', level)
    
    if (chapter && chapter !== 'all') {
      if (mode === 'medical') {
        q = q.eq('chapter', chapter)
      } else {
        q = q.eq('level', chapter)
      }
    }
    
    if (lesson && lesson !== 'all') {
      q = q.eq('lesson', lesson)
    }

    q.then(({ data }) => {
      if (ignore) return
      setWords(data ?? [])
      setLoading(false)
    })

    return () => {
      ignore = true
    }
  }, [level, mode, chapter, lesson])

  return { words, loading }
}

export function useDialogues(
  level: string | 'all',
  mode: 'language' | 'medical' = 'language',
  chapter?: string,
  lesson?: string
) {
  const [dialogues, setDialogues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    let q = supabase
      .from('dialogues')
      .select('*')
      .eq('mode', mode)
      .order('created_at', { ascending: true })

    if (level && level !== 'all') q = q.eq('level', level)
    
    if (chapter && chapter !== 'all') {
      if (mode === 'medical') {
        q = q.eq('chapter', chapter)
      } else {
        q = q.eq('level', chapter)
      }
    }
    
    if (lesson && lesson !== 'all') {
      q = q.eq('lesson', lesson)
    }

    q.then(({ data }) => {
      if (ignore) return
      setDialogues(data ?? [])
      setLoading(false)
    })

    return () => {
      ignore = true
    }
  }, [level, mode, chapter, lesson])

  return { dialogues, loading }
}

export function useLongTexts(
  level: string | 'all',
  mode: 'language' | 'medical' = 'language',
  chapter?: string,
  lesson?: string
) {
  const [texts, setTexts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    let q = supabase
      .from('long_texts')
      .select('*')
      .eq('mode', mode)
      .order('created_at', { ascending: true })

    if (level && level !== 'all') q = q.eq('level', level)
    
    if (chapter && chapter !== 'all') {
      if (mode === 'medical') {
        q = q.eq('chapter', chapter)
      } else {
        q = q.eq('level', chapter)
      }
    }
    
    if (lesson && lesson !== 'all') {
      q = q.eq('lesson', lesson)
    }

    q.then(({ data }) => {
      if (ignore) return
      setTexts(data ?? [])
      setLoading(false)
    })

    return () => {
      ignore = true
    }
  }, [level, mode, chapter, lesson])

  return { texts, loading }
}

export function useGrammarExercises(
  level: string | 'all',
  mode: 'language' | 'medical' = 'language',
  chapter?: string,
  lesson?: string
) {
  const [exercises, setExercises] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    let q = supabase
      .from('grammar_exercises')
      .select('*')
      .eq('mode', mode)
      .order('created_at', { ascending: true })

    if (level && level !== 'all') q = q.eq('level', level)
    
    if (chapter && chapter !== 'all') {
      if (mode === 'medical') {
        q = q.eq('chapter', chapter)
      } else {
        q = q.eq('level', chapter)
      }
    }
    
    if (lesson && lesson !== 'all') {
      q = q.eq('lesson', lesson)
    }

    q.then(({ data }) => {
      if (ignore) return
      setExercises(data ?? [])
      setLoading(false)
    })

    return () => {
      ignore = true
    }
  }, [level, mode, chapter, lesson])

  return { exercises, loading }
}

export function useVocabularyBank() {
  const { user } = useAuth()
  const [vocab, setVocab] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(() => {
    if (!user) { setVocab([]); setLoading(false); return }
    supabase
      .from('vocabulary_bank')
      .select('*')
      .eq('user_id', user.id)
      .order('last_seen_at', { ascending: false })
      .then(({ data }) => { setVocab(data ?? []); setLoading(false) })
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const saveWord = useCallback(async (entry: {
    source: string; term: string; translation: string; level: string; language?: string
  }) => {
    if (!user) return
    const { data: existingList } = await supabase
      .from('vocabulary_bank')
      .select('id, times_seen')
      .eq('user_id', user.id)
      .eq('term', entry.term)
      .limit(1)

    const existing = existingList && existingList.length > 0 ? existingList[0] : null

    if (existing) {
      await supabase.from('vocabulary_bank').update({
        times_seen: existing.times_seen + 1,
        last_seen_at: new Date().toISOString(),
      }).eq('id', existing.id)
    } else {
      await supabase.from('vocabulary_bank').insert({
        user_id: user.id,
        source: entry.source,
        term: entry.term,
        translation: entry.translation,
        level: entry.level,
        language: entry.language ?? 'de',
        times_seen: 1,
        last_seen_at: new Date().toISOString(),
        status: 'new',
      })
    }
    fetch()
  }, [user, fetch])

  return { vocab, loading, saveWord, refresh: fetch }
}

export function useUserProgress() {
  const { user } = useAuth()
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const completedIdsRef = useRef(completedIds)
  completedIdsRef.current = completedIds

  useEffect(() => {
    if (!user) return
    let ignore = false
    supabase
      .from('user_completed_sentences')
      .select('sentence_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (ignore) return
        setCompletedIds(new Set((data ?? []).map((r: any) => r.sentence_id)))
      })
    return () => {
      ignore = true
    }
  }, [user])

  const markComplete = useCallback(async (sentenceId: string) => {
    if (!user || completedIdsRef.current.has(sentenceId)) return
    await supabase.from('user_completed_sentences').insert({
      user_id: user.id,
      sentence_id: sentenceId,
      completed_at: new Date().toISOString(),
    })
    setCompletedIds(prev => new Set([...prev, sentenceId]))
  }, [user])

  return { completedIds, markComplete }
}
