-- ═══════════════════════════════════════════════════
--  Denglisch — Supabase Database Schema
--  Run this in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── profiles ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT,
  avatar_url      TEXT,
  ui_language     TEXT NOT NULL DEFAULT 'ar',
  native_language TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── sentences ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sentences (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  german         TEXT NOT NULL,
  translation    TEXT,                         -- Arabic
  translation_en TEXT,                         -- English
  translation_uk TEXT,                         -- Ukrainian
  translation_de TEXT,                         -- German hint/paraphrase
  level          TEXT NOT NULL DEFAULT 'A1',   -- A1..C2
  audio_url      TEXT,
  language       TEXT NOT NULL DEFAULT 'de',
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── words ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.words (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  german         TEXT NOT NULL,
  translation    TEXT,                         -- Arabic
  translation_en TEXT,
  article        TEXT,                         -- der / die / das
  plural         TEXT,
  level          TEXT NOT NULL DEFAULT 'A1',
  audio_url      TEXT,
  category       TEXT,
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── dialogues ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dialogues (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_de   TEXT NOT NULL,
  title_ar   TEXT,
  title_en   TEXT,
  level      TEXT NOT NULL DEFAULT 'A1',
  lines      JSONB DEFAULT '[]'::JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── grammar_exercises ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.grammar_exercises (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question       TEXT NOT NULL,
  options        JSONB DEFAULT '[]'::JSONB,
  correct_answer TEXT NOT NULL,
  explanation    TEXT,
  topic          TEXT,
  level          TEXT NOT NULL DEFAULT 'A1',
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── long_texts ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.long_texts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_de       TEXT NOT NULL,
  title_ar       TEXT,
  title_en       TEXT,
  body_de        TEXT,
  translation_ar TEXT,
  translation_en TEXT,
  level          TEXT NOT NULL DEFAULT 'B1',
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── user_progress ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_progress (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sentence_id  UUID NOT NULL REFERENCES public.sentences(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, sentence_id)
);

-- ─── vocabulary_bank ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.vocabulary_bank (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source       TEXT NOT NULL DEFAULT 'sentences',
  term         TEXT NOT NULL,
  translation  TEXT NOT NULL,
  level        TEXT NOT NULL DEFAULT 'A1',
  language     TEXT NOT NULL DEFAULT 'de',
  times_seen   INT NOT NULL DEFAULT 1,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status       TEXT NOT NULL DEFAULT 'new',   -- new / learning / known
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── user_roles ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_roles (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role    TEXT NOT NULL DEFAULT 'user',       -- user / admin
  UNIQUE(user_id)
);

-- ─── app_settings ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_settings (
  key   TEXT PRIMARY KEY,
  value JSONB
);

-- ═══════════════════════════════════════════════════
--  Row Level Security
-- ═══════════════════════════════════════════════════

-- sentences — public read, admin write
ALTER TABLE public.sentences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read sentences"  ON public.sentences FOR SELECT USING (true);
CREATE POLICY "Auth insert sentences"  ON public.sentences FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update sentences"  ON public.sentences FOR UPDATE USING (auth.uid() = created_by);

-- words — public read
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read words"     ON public.words FOR SELECT USING (true);
CREATE POLICY "Auth insert words"     ON public.words FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- dialogues — public read
ALTER TABLE public.dialogues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read dialogues" ON public.dialogues FOR SELECT USING (true);
CREATE POLICY "Auth insert dialogues" ON public.dialogues FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- grammar_exercises — public read
ALTER TABLE public.grammar_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read grammar"   ON public.grammar_exercises FOR SELECT USING (true);
CREATE POLICY "Auth insert grammar"   ON public.grammar_exercises FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- long_texts — public read
ALTER TABLE public.long_texts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read texts"     ON public.long_texts FOR SELECT USING (true);
CREATE POLICY "Auth insert texts"     ON public.long_texts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- profiles — own row only
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile read"     ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Own profile write"    ON public.profiles FOR ALL   USING (auth.uid() = id);

-- user_progress — own rows only
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own progress read"    ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own progress insert"  ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- vocabulary_bank — own rows only
ALTER TABLE public.vocabulary_bank ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own vocab read"       ON public.vocabulary_bank FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own vocab insert"     ON public.vocabulary_bank FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own vocab update"     ON public.vocabulary_bank FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own vocab delete"     ON public.vocabulary_bank FOR DELETE USING (auth.uid() = user_id);

-- app_settings — public read
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings"  ON public.app_settings FOR SELECT USING (true);
