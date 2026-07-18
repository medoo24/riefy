-- ═══════════════════════════════════════════════
--  Denglisch — Sample Seed Data (Updated)
--  Run in Supabase SQL Editor → New Query
-- ═══════════════════════════════════════════════

-- Ensure table structure matches latest updates (adds mode, chapter, and lesson columns)
ALTER TABLE public.sentences         ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'language';
ALTER TABLE public.sentences         ADD COLUMN IF NOT EXISTS chapter TEXT;
ALTER TABLE public.sentences         ADD COLUMN IF NOT EXISTS lesson  TEXT;

ALTER TABLE public.words             ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'language';
ALTER TABLE public.words             ADD COLUMN IF NOT EXISTS chapter TEXT;
ALTER TABLE public.words             ADD COLUMN IF NOT EXISTS lesson  TEXT;

ALTER TABLE public.dialogues         ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'language';
ALTER TABLE public.dialogues         ADD COLUMN IF NOT EXISTS chapter TEXT;
ALTER TABLE public.dialogues         ADD COLUMN IF NOT EXISTS lesson  TEXT;

ALTER TABLE public.long_texts        ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'language';
ALTER TABLE public.long_texts        ADD COLUMN IF NOT EXISTS chapter TEXT;
ALTER TABLE public.long_texts        ADD COLUMN IF NOT EXISTS lesson  TEXT;

ALTER TABLE public.grammar_exercises ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'language';
ALTER TABLE public.grammar_exercises ADD COLUMN IF NOT EXISTS chapter TEXT;
ALTER TABLE public.grammar_exercises ADD COLUMN IF NOT EXISTS lesson  TEXT;

-- Clean up any previous language content to prevent duplicates
DELETE FROM public.sentences         WHERE mode = 'language';
DELETE FROM public.words             WHERE mode = 'language';
DELETE FROM public.dialogues         WHERE mode = 'language';
DELETE FROM public.long_texts        WHERE mode = 'language';
DELETE FROM public.grammar_exercises WHERE mode = 'language';

-- A1 Sentences (German + Arabic + English translations)
INSERT INTO public.sentences (german, translation, translation_en, level, language, mode, chapter, lesson) VALUES
('Guten Morgen', 'صباح الخير', 'Good morning', 'A1', 'de', 'language', 'A1', 'Lecture 1: Basics'),
('Guten Tag', 'نهارك سعيد', 'Good afternoon', 'A1', 'de', 'language', 'A1', 'Lecture 1: Basics'),
('Guten Abend', 'مساء الخير', 'Good evening', 'A1', 'de', 'language', 'A1', 'Lecture 1: Basics'),
('Gute Nacht', 'تصبح على خير', 'Good night', 'A1', 'de', 'language', 'A1', 'Lecture 1: Basics'),
('Hallo', 'مرحبا', 'Hello', 'A1', 'de', 'language', 'A1', 'Lecture 1: Basics'),
('Danke', 'شكراً', 'Thank you', 'A1', 'de', 'language', 'A1', 'Lecture 1: Basics'),
('Bitte', 'من فضلك', 'Please', 'A1', 'de', 'language', 'A1', 'Lecture 1: Basics'),
('Auf Wiedersehen', 'إلى اللقاء', 'Goodbye', 'A1', 'de', 'language', 'A1', 'Lecture 1: Basics'),
('Tschüss', 'وداعاً', 'Bye', 'A1', 'de', 'language', 'A1', 'Lecture 1: Basics'),
('Wie heißt du?', 'ما اسمك؟', 'What is your name?', 'A1', 'de', 'language', 'A1', 'Lecture 1: Basics'),
('Ich verstehe nicht', 'أنا لا أفهم', 'I don''t understand', 'A1', 'de', 'language', 'A1', 'Lecture 1: Basics'),
('Kannst du mir helfen?', 'هل يمكنك مساعدتي؟', 'Can you help me?', 'A1', 'de', 'language', 'A1', 'Lecture 1: Basics'),
('Wie geht es Ihnen?', 'كيف حالك؟', 'How are you?', 'A1', 'de', 'language', 'A1', 'Lecture 1: Basics'),
('Mir geht es gut', 'أنا بخير', 'I am fine', 'A1', 'de', 'language', 'A1', 'Lecture 1: Basics'),
('Entschuldigung', 'عذراً', 'Excuse me', 'A1', 'de', 'language', 'A1', 'Lecture 1: Basics');

-- A2 Sentences
INSERT INTO public.sentences (german, translation, translation_en, level, language, mode, chapter, lesson) VALUES
('Ich lerne Deutsch', 'أنا أتعلم الألمانية', 'I am learning German', 'A2', 'de', 'language', 'A2', 'Lecture 1: Basics'),
('Wo ist der Bahnhof?', 'أين المحطة؟', 'Where is the train station?', 'A2', 'de', 'language', 'A2', 'Lecture 1: Basics'),
('Wie viel kostet das?', 'كم يكلف هذا؟', 'How much does this cost?', 'A2', 'de', 'language', 'A2', 'Lecture 1: Basics'),
('Ich möchte ein Zimmer reservieren', 'أريد حجز غرفة', 'I would like to reserve a room', 'A2', 'de', 'language', 'A2', 'Lecture 1: Basics'),
('Können Sie das bitte wiederholen?', 'هل يمكنك تكرار ذلك من فضلك؟', 'Can you please repeat that?', 'A2', 'de', 'language', 'A2', 'Lecture 1: Basics');

-- A1 Words
INSERT INTO public.words (german, translation, translation_en, article, level, mode, chapter, lesson) VALUES
('das Haus', 'البيت', 'house', 'das', 'A1', 'language', 'A1', 'Lecture 1: Basics'),
('die Schule', 'المدرسة', 'school', 'die', 'A1', 'language', 'A1', 'Lecture 1: Basics'),
('der Mann', 'الرجل', 'man', 'der', 'A1', 'language', 'A1', 'Lecture 1: Basics'),
('die Frau', 'المرأة', 'woman', 'die', 'A1', 'language', 'A1', 'Lecture 1: Basics'),
('das Kind', 'الطفل', 'child', 'das', 'A1', 'language', 'A1', 'Lecture 1: Basics'),
('das Wasser', 'الماء', 'water', 'das', 'A1', 'language', 'A1', 'Lecture 1: Basics'),
('das Brot', 'الخبز', 'bread', 'das', 'A1', 'language', 'A1', 'Lecture 1: Basics'),
('die Stadt', 'المدينة', 'city', 'die', 'A1', 'language', 'A1', 'Lecture 1: Basics'),
('der Arzt', 'الطبيب', 'doctor', 'der', 'A1', 'language', 'A1', 'Lecture 1: Basics'),
('die Arbeit', 'العمل', 'work', 'die', 'A1', 'language', 'A1', 'Lecture 1: Basics'),
('der Tag', 'اليوم', 'day', 'der', 'A1', 'language', 'A1', 'Lecture 1: Basics'),
('die Zeit', 'الوقت', 'time', 'die', 'A1', 'language', 'A1', 'Lecture 1: Basics');

-- A1 Grammar exercises
INSERT INTO public.grammar_exercises (question, options, correct_answer, explanation, topic, level, mode, chapter, lesson) VALUES
('Was ist der Artikel für "Haus"?', '["der", "die", "das", "ein"]', 'das', 'Das Haus — Neutrum (sächlich)', 'Artikel', 'A1', 'language', 'A1', 'Lecture 1: Basics'),
('Welche Antwort ist richtig? Ich ___ müde.', '["bin", "bist", "ist", "sind"]', 'bin', '"Ich" verwendet immer "bin" (1. Person Singular)', 'Verb sein', 'A1', 'language', 'A1', 'Lecture 1: Basics'),
('Wie sagt man "Good morning" auf Deutsch?', '["Guten Abend", "Gute Nacht", "Guten Morgen", "Hallo"]', 'Guten Morgen', 'Guten Morgen = Good morning', 'Begrüßung', 'A1', 'language', 'A1', 'Lecture 1: Basics'),
('Was ist der Plural von "das Kind"?', '["die Kinder", "die Kinds", "die Kindes", "die Kind"]', 'die Kinder', 'Plural von Kind → Kinder (immer mit "die")', 'Plural', 'A1', 'language', 'A1', 'Lecture 1: Basics'),
('Ich ___ aus Deutschland.', '["komme", "kommt", "kommen", "kommst"]', 'komme', '"Ich" + Verb in der 1. Person: komme', 'Konjugation', 'A1', 'language', 'A1', 'Lecture 1: Basics');

-- A1 Dialogues
INSERT INTO public.dialogues (title_de, title_ar, title_en, level, lines, mode, chapter, lesson) VALUES
('Sich vorstellen', 'التعريف بالنفس', 'Introducing yourself', 'A1',
'[
  {"speaker": "Anna", "german": "Hallo! Ich heiße Anna. Wie heißt du?", "translation_ar": "مرحبا! اسمي آنا. ما اسمك؟", "translation_en": "Hello! My name is Anna. What is your name?"},
  {"speaker": "Omar", "german": "Hallo Anna! Ich heiße Omar. Woher kommst du?", "translation_ar": "مرحبا آنا! اسمي عمر. من أين أنتِ؟", "translation_en": "Hello Anna! My name is Omar. Where are you from?"},
  {"speaker": "Anna", "german": "Ich komme aus Deutschland. Und du?", "translation_ar": "أنا من ألمانيا. وأنت؟", "translation_en": "I am from Germany. And you?"},
  {"speaker": "Omar", "german": "Ich komme aus Syrien. Ich lerne Deutsch.", "translation_ar": "أنا من سوريا. أنا أتعلم الألمانية.", "translation_en": "I am from Syria. I am learning German."},
  {"speaker": "Anna", "german": "Das ist toll! Viel Erfolg!", "translation_ar": "هذا رائع! حظاً موفقاً!", "translation_en": "That is great! Good luck!"}
]'::jsonb, 'language', 'A1', 'Lecture 1: Basics'),
('Im Supermarkt', 'في السوبرماركت', 'At the supermarket', 'A1',
'[
  {"speaker": "Kunde", "german": "Guten Tag! Wo finde ich das Brot?", "translation_ar": "نهارك سعيد! أين أجد الخبز؟", "translation_en": "Good afternoon! Where can I find the bread?"},
  {"speaker": "Verkäufer", "german": "Guten Tag! Das Brot ist in Gang drei.", "translation_ar": "نهارك سعيد! الخبز في الممر الثالث.", "translation_en": "Good afternoon! The bread is in aisle three."},
  {"speaker": "Kunde", "german": "Danke schön!", "translation_ar": "شكراً جزيلاً!", "translation_en": "Thank you very much!"},
  {"speaker": "Verkäufer", "german": "Bitte sehr! Kann ich noch helfen?", "translation_ar": "عفواً! هل يمكنني المساعدة أكثر؟", "translation_en": "You are welcome! Can I help further?"}
]'::jsonb, 'language', 'A1', 'Lecture 1: Basics');

-- A1 Long texts
INSERT INTO public.long_texts (title_de, title_ar, title_en, body_de, translation_ar, level, mode, chapter, lesson) VALUES
('Mein Tag', 'يومي', 'My Day', 
'Ich heiße Omar. Ich wohne in Berlin. Jeden Morgen stehe ich um 7 Uhr auf. Dann trinke ich Kaffee und esse Brot. Um 9 Uhr gehe ich zur Deutschklasse. In der Klasse lerne ich neue Wörter und Grammatik. Meine Lehrerin heißt Frau Müller. Sie ist sehr nett. Am Nachmittag lese ich Bücher und höre Musik. Abends koche ich und schaue fern. Um 22 Uhr schlafe ich.',
'اسمي عمر. أنا أسكن في برلين. كل صباح أستيقظ في الساعة السابعة. ثم أشرب القهوة وآكل الخبز. في الساعة التاسعة أذهب إلى درس اللغة الألمانية. في الصف أتعلم كلمات جديدة وقواعد اللغة. معلمتي اسمها الآنسة مولر. هي طيبة جداً. بعد الظهر أقرأ الكتب وأستمع إلى الموسيقى. في المساء أطبخ وأشاهد التلفزيون. في الساعة العاشرة مساءً أنام.',
'A1', 'language', 'A1', 'Lecture 1: Basics');
