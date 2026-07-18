-- ═══════════════════════════════════════════════
--  Denglisch — Sample Seed Data
--  Run in Supabase SQL Editor → New Query
-- ═══════════════════════════════════════════════

-- A1 Sentences (German + Arabic + English translations)
INSERT INTO public.sentences (german, translation, translation_en, level, language) VALUES
('Guten Morgen', 'صباح الخير', 'Good morning', 'A1', 'de'),
('Guten Tag', 'نهارك سعيد', 'Good afternoon', 'A1', 'de'),
('Guten Abend', 'مساء الخير', 'Good evening', 'A1', 'de'),
('Gute Nacht', 'تصبح على خير', 'Good night', 'A1', 'de'),
('Hallo', 'مرحبا', 'Hello', 'A1', 'de'),
('Danke', 'شكراً', 'Thank you', 'A1', 'de'),
('Bitte', 'من فضلك', 'Please', 'A1', 'de'),
('Auf Wiedersehen', 'إلى اللقاء', 'Goodbye', 'A1', 'de'),
('Tschüss', 'وداعاً', 'Bye', 'A1', 'de'),
('Wie heißt du?', 'ما اسمك؟', 'What is your name?', 'A1', 'de'),
('Ich verstehe nicht', 'أنا لا أفهم', 'I don''t understand', 'A1', 'de'),
('Kannst du mir helfen?', 'هل يمكنك مساعدتي؟', 'Can you help me?', 'A1', 'de'),
('Wie geht es Ihnen?', 'كيف حالك؟', 'How are you?', 'A1', 'de'),
('Mir geht es gut', 'أنا بخير', 'I am fine', 'A1', 'de'),
('Entschuldigung', 'عذراً', 'Excuse me', 'A1', 'de');

-- A2 Sentences
INSERT INTO public.sentences (german, translation, translation_en, level, language) VALUES
('Ich lerne Deutsch', 'أنا أتعلم الألمانية', 'I am learning German', 'A2', 'de'),
('Wo ist der Bahnhof?', 'أين المحطة؟', 'Where is the train station?', 'A2', 'de'),
('Wie viel kostet das?', 'كم يكلف هذا؟', 'How much does this cost?', 'A2', 'de'),
('Ich möchte ein Zimmer reservieren', 'أريد حجز غرفة', 'I would like to reserve a room', 'A2', 'de'),
('Können Sie das bitte wiederholen?', 'هل يمكنك تكرار ذلك من فضلك؟', 'Can you please repeat that?', 'A2', 'de');

-- A1 Words
INSERT INTO public.words (german, translation, translation_en, article, level) VALUES
('das Haus', 'البيت', 'house', 'das', 'A1'),
('die Schule', 'المدرسة', 'school', 'die', 'A1'),
('der Mann', 'الرجل', 'man', 'der', 'A1'),
('die Frau', 'المرأة', 'woman', 'die', 'A1'),
('das Kind', 'الطفل', 'child', 'das', 'A1'),
('das Wasser', 'الماء', 'water', 'das', 'A1'),
('das Brot', 'الخبز', 'bread', 'das', 'A1'),
('die Stadt', 'المدينة', 'city', 'die', 'A1'),
('der Arzt', 'الطبيب', 'doctor', 'der', 'A1'),
('die Arbeit', 'العمل', 'work', 'die', 'A1'),
('der Tag', 'اليوم', 'day', 'der', 'A1'),
('die Zeit', 'الوقت', 'time', 'die', 'A1');

-- A1 Grammar exercises
INSERT INTO public.grammar_exercises (question, options, correct_answer, explanation, topic, level) VALUES
('Was ist der Artikel für "Haus"?', '["der", "die", "das", "ein"]', 'das', 'Das Haus — Neutrum (sächlich)', 'Artikel', 'A1'),
('Welche Antwort ist richtig? Ich ___ müde.', '["bin", "bist", "ist", "sind"]', 'bin', '"Ich" verwendet immer "bin" (1. Person Singular)', 'Verb sein', 'A1'),
('Wie sagt man "Good morning" auf Deutsch?', '["Guten Abend", "Gute Nacht", "Guten Morgen", "Hallo"]', 'Guten Morgen', 'Guten Morgen = Good morning', 'Begrüßung', 'A1'),
('Was ist der Plural von "das Kind"?', '["die Kinder", "die Kinds", "die Kindes", "die Kind"]', 'die Kinder', 'Plural von Kind → Kinder (immer mit "die")', 'Plural', 'A1'),
('Ich ___ aus Deutschland.', '["komme", "kommt", "kommen", "kommst"]', 'komme', '"Ich" + Verb in der 1. Person: komme', 'Konjugation', 'A1');

-- A1 Dialogue
INSERT INTO public.dialogues (title_de, title_ar, title_en, level, lines) VALUES
('Sich vorstellen', 'التعريف بالنفس', 'Introducing yourself', 'A1',
'[
  {"speaker": "Anna", "german": "Hallo! Ich heiße Anna. Wie heißt du?", "translation_ar": "مرحبا! اسمي آنا. ما اسمك؟", "translation_en": "Hello! My name is Anna. What is your name?"},
  {"speaker": "Omar", "german": "Hallo Anna! Ich heiße Omar. Woher kommst du?", "translation_ar": "مرحبا آنا! اسمي عمر. من أين أنتِ؟", "translation_en": "Hello Anna! My name is Omar. Where are you from?"},
  {"speaker": "Anna", "german": "Ich komme aus Deutschland. Und du?", "translation_ar": "أنا من ألمانيا. وأنت؟", "translation_en": "I am from Germany. And you?"},
  {"speaker": "Omar", "german": "Ich komme aus Syrien. Ich lerne Deutsch.", "translation_ar": "أنا من سوريا. أنا أتعلم الألمانية.", "translation_en": "I am from Syria. I am learning German."},
  {"speaker": "Anna", "german": "Das ist toll! Viel Erfolg!", "translation_ar": "هذا رائع! حظاً موفقاً!", "translation_en": "That is great! Good luck!"}
]'::jsonb),

('Im Supermarkt', 'في السوبرماركت', 'At the supermarket', 'A1',
'[
  {"speaker": "Kunde", "german": "Guten Tag! Wo finde ich das Brot?", "translation_ar": "نهارك سعيد! أين أجد الخبز؟", "translation_en": "Good afternoon! Where can I find the bread?"},
  {"speaker": "Verkäufer", "german": "Guten Tag! Das Brot ist in Gang drei.", "translation_ar": "نهارك سعيد! الخبز في الممر الثالث.", "translation_en": "Good afternoon! The bread is in aisle three."},
  {"speaker": "Kunde", "german": "Danke schön!", "translation_ar": "شكراً جزيلاً!", "translation_en": "Thank you very much!"},
  {"speaker": "Verkäufer", "german": "Bitte sehr! Kann ich noch helfen?", "translation_ar": "عفواً! هل يمكنني المساعدة أكثر؟", "translation_en": "You are welcome! Can I help further?"}
]'::jsonb);

-- A1 Long text
INSERT INTO public.long_texts (title_de, title_ar, title_en, body_de, translation_ar, level) VALUES
('Mein Tag', 'يومي', 'My Day', 
'Ich heiße Omar. Ich wohne in Berlin. Jeden Morgen stehe ich um 7 Uhr auf. Dann trinke ich Kaffee und esse Brot. Um 9 Uhr gehe ich zur Deutschklasse. In der Klasse lerne ich neue Wörter und Grammatik. Meine Lehrerin heißt Frau Müller. Sie ist sehr nett. Am Nachmittag lese ich Bücher und höre Musik. Abends koche ich und schaue fern. Um 22 Uhr schlafe ich.',
'اسمي عمر. أنا أسكن في برلين. كل صباح أستيقظ في الساعة السابعة. ثم أشرب القهوة وآكل الخبز. في الساعة التاسعة أذهب إلى درس اللغة الألمانية. في الصف أتعلم كلمات جديدة وقواعد اللغة. معلمتي اسمها الآنسة مولر. هي طيبة جداً. بعد الظهر أقرأ الكتب وأستمع إلى الموسيقى. في المساء أطبخ وأشاهد التلفزيون. في الساعة العاشرة مساءً أنام.',
'A1');
