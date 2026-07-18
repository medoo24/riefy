import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface MedicalCard {
  id: string
  topic: string
  subtopic: string | null
  card_type: 'fact' | 'definition' | 'complication' | 'drug' | 'ecg'
  front: string
  back: string | null
  source: string
  difficulty: 'core' | 'advanced' | 'expert'
  created_at: string
}

export const ALL_TOPICS = [
  'All Topics',
  'Coronary Anatomy',
  'O₂ Supply & Demand',
  'Atherosclerosis',
  'MI Evolution',
  'Chronic Coronary Syndromes',
  'Acute Coronary Syndromes',
  'ECG Localization',
  'Pharmacology',
  'Device Therapy',
  'Lifestyle & Rehab',
]

export const CARD_TYPE_COLORS: Record<string, string> = {
  fact:         'var(--a2)',
  definition:   'var(--accent-light)',
  complication: 'var(--red)',
  drug:         'var(--green)',
  ecg:          'var(--gold)',
}

export const CARD_TYPE_LABELS: Record<string, string> = {
  fact:         'Fact',
  definition:   'Definition',
  complication: 'Complication',
  drug:         'Drug',
  ecg:          'ECG',
}

export function useMedicalCards(topic: string, difficulty: string) {
  const [cards, setCards] = useState<MedicalCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    let q = supabase.from('medical_cards').select('*').order('topic').order('created_at')
    if (topic !== 'All Topics') q = q.eq('topic', topic)
    if (difficulty !== 'all') q = q.eq('difficulty', difficulty)

    q.then(({ data, error }) => {
      if (error) setError(error.message)
      else setCards(data ?? [])
      setLoading(false)
    })
  }, [topic, difficulty])

  return { cards, loading, error }
}
