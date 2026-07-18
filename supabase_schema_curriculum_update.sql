-- ═══════════════════════════════════════════════════════════
--  Curriculum Track Update: Add Chapter and Lesson Columns
--  Run in Supabase SQL Editor → New Query → Run without RLS
-- ═══════════════════════════════════════════════════════════

-- 1. Alter all tables to add chapter and lesson columns if missing
ALTER TABLE public.sentences         ADD COLUMN IF NOT EXISTS chapter TEXT;
ALTER TABLE public.sentences         ADD COLUMN IF NOT EXISTS lesson  TEXT;

ALTER TABLE public.words             ADD COLUMN IF NOT EXISTS chapter TEXT;
ALTER TABLE public.words             ADD COLUMN IF NOT EXISTS lesson  TEXT;

ALTER TABLE public.dialogues         ADD COLUMN IF NOT EXISTS chapter TEXT;
ALTER TABLE public.dialogues         ADD COLUMN IF NOT EXISTS lesson  TEXT;

ALTER TABLE public.long_texts        ADD COLUMN IF NOT EXISTS chapter TEXT;
ALTER TABLE public.long_texts        ADD COLUMN IF NOT EXISTS lesson  TEXT;

ALTER TABLE public.grammar_exercises ADD COLUMN IF NOT EXISTS chapter TEXT;
ALTER TABLE public.grammar_exercises ADD COLUMN IF NOT EXISTS lesson  TEXT;


-- 2. Backfill existing language learning data (mode = 'language')
-- We map chapter to the CEFR level (A1, A2, etc.) and lesson to 'Lecture 1: Basics' by default
UPDATE public.sentences SET 
  chapter = COALESCE(chapter, level, 'A1'),
  lesson = COALESCE(lesson, 'Lecture 1: Basics')
  WHERE mode = 'language' OR mode IS NULL;

UPDATE public.words SET 
  chapter = COALESCE(chapter, level, 'A1'),
  lesson = COALESCE(lesson, 'Lecture 1: Basics')
  WHERE mode = 'language' OR mode IS NULL;

UPDATE public.dialogues SET 
  chapter = COALESCE(chapter, level, 'A1'),
  lesson = COALESCE(lesson, 'Lecture 1: Basics')
  WHERE mode = 'language' OR mode IS NULL;

UPDATE public.long_texts SET 
  chapter = COALESCE(chapter, level, 'A1'),
  lesson = COALESCE(lesson, 'Lecture 1: Basics')
  WHERE mode = 'language' OR mode IS NULL;

UPDATE public.grammar_exercises SET 
  chapter = COALESCE(chapter, level, 'A1'),
  lesson = COALESCE(lesson, 'Lecture 1: Basics')
  WHERE mode = 'language' OR mode IS NULL;


-- 3. Backfill existing medical data (mode = 'medical')
-- We map chapter to 'Cardiology' and lesson to 'IHD' by default
UPDATE public.sentences SET 
  chapter = COALESCE(chapter, 'Cardiology'),
  lesson = COALESCE(lesson, 'IHD')
  WHERE mode = 'medical';

UPDATE public.words SET 
  chapter = COALESCE(chapter, 'Cardiology'),
  lesson = COALESCE(lesson, 'IHD')
  WHERE mode = 'medical';

UPDATE public.dialogues SET 
  chapter = COALESCE(chapter, 'Cardiology'),
  lesson = COALESCE(lesson, 'IHD')
  WHERE mode = 'medical';

UPDATE public.long_texts SET 
  chapter = COALESCE(chapter, 'Cardiology'),
  lesson = COALESCE(lesson, 'IHD')
  WHERE mode = 'medical';

UPDATE public.grammar_exercises SET 
  chapter = COALESCE(chapter, 'Cardiology'),
  lesson = COALESCE(lesson, 'IHD')
  WHERE mode = 'medical';
