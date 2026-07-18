// ─────────────────────────────────────────────
//  Shared TypeScript types for the whole app
// ─────────────────────────────────────────────

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export interface Sentence {
  id: string
  german: string
  translation: string        // Arabic
  translation_en: string | null
  translation_uk: string | null
  translation_de: string | null
  level: CEFRLevel
  audio_url: string | null
  language: string
  created_at: string
}

export interface Word {
  id: string
  german: string
  translation: string        // Arabic
  translation_en: string | null
  level: CEFRLevel
  article?: string | null    // der/die/das
  plural?: string | null
  audio_url?: string | null
  category?: string | null
}

export interface Dialogue {
  id: string
  title_de: string
  title_ar?: string | null
  title_en?: string | null
  level: CEFRLevel
  lines: DialogueLine[]
  created_at: string
}

export interface DialogueLine {
  speaker: string
  german: string
  translation_ar?: string | null
  translation_en?: string | null
}

export interface GrammarExercise {
  id: string
  question: string
  options: string[]
  correct_answer: string
  explanation?: string | null
  level: CEFRLevel
  topic: string
}

export interface LongText {
  id: string
  title_de: string
  title_ar?: string | null
  title_en?: string | null
  body_de: string
  translation_ar?: string | null
  translation_en?: string | null
  level: CEFRLevel
  created_at: string
}

export interface VocabularyEntry {
  id: string
  user_id: string
  source: 'sentences' | 'words' | 'dialogues'
  term: string
  translation: string
  level: CEFRLevel
  times_seen: number
  last_seen_at: string
  status: 'new' | 'learning' | 'known'
  language: string
}

export interface UserProgress {
  id: string
  user_id: string
  sentence_id: string
  completed_at: string
}

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  ui_language: 'ar' | 'en' | 'de'
  native_language: string | null
}

export type TranslationLang = 'ar' | 'en'
