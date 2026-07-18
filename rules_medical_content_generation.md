# AI Content Generation Rules: Medical Clinical Content

Use these instructions to guide an AI in generating clinical medical content (based on provided documents like "IHD.txt") for the application database.

## Objective
You are an expert Medical Educator. Your task is to extract high-yield clinical pearls, vocabulary, clinical scenarios, case studies, and board-style multiple-choice questions from a provided source text. You will format these into 5 categories: **Sentences (Clinical Pearls), Words (Terminology), Dialogues (Clinical Cases), Long Texts (Case Studies), and Grammar Exercises (MCQs)**.
You must output the result as a raw SQL `INSERT` script compatible with PostgreSQL/Supabase.

## Global Requirements
- **Mode:** Always use `mode = 'medical'`.
- **Language Code:** Always use `language = 'en'`.
- **Translations/Explanations:** Medical content is primarily in English. Use the `translation_en`, `title_en`, and `content_en` (or equivalent translation) columns to provide explanations, takeaways, or context in English.
- **Curriculum Tracking:** Every item must include a `chapter` (the medical specialty, e.g., 'Cardiology') and a `lesson` (the specific topic, e.g., 'IHD'). You must extract these from the context or prompt.
- **Level:** Provide the difficulty level (`core`, `advanced`, `expert`) in the `level` column.

## SQL Formatting Rules
Generate 5 separate `INSERT INTO` statements. Ensure all strings are properly escaped (use double single quotes `''` for apostrophes inside SQL strings).

### 1. Sentences (Clinical Pearls) -> `public.sentences`
Provide high-yield medical facts. The `german` column holds the primary fact (in English), and `translation_en` holds the clinical implication/explanation.
Columns: `german`, `translation_en`, `level`, `mode`, `language`, `chapter`, `lesson`.
Example:
```sql
INSERT INTO public.sentences (german, translation_en, level, mode, language, chapter, lesson) VALUES
('The LAD artery supplies the anterior septum and apex.', 'Occlusion leads to anterior MI with ST elevation in V1–V4.', 'core', 'medical', 'en', 'Cardiology', 'IHD');
```

### 2. Words (Terminology) -> `public.words`
Provide key medical vocabulary. `german` holds the term (in English), `translation` holds the definition (in English).
Columns: `german`, `translation`, `level`, `mode`, `category`, `chapter`, `lesson`.
Example:
```sql
INSERT INTO public.words (german, translation, level, mode, category, chapter, lesson) VALUES
('Atherosclerosis', 'Inflammatory disease of arteries characterized by lipid deposition.', 'core', 'medical', 'Pathology', 'Cardiology', 'IHD');
```

### 3. Dialogues (Clinical Scenarios) -> `public.dialogues`
Provide a clinical scenario (e.g., Attending and Resident discussing a case). The `lines` column must be a valid JSONB array. 
Columns: `title_de`, `title_en`, `level`, `mode`, `lines`, `chapter`, `lesson`.
Example:
```sql
INSERT INTO public.dialogues (title_de, title_en, level, mode, lines, chapter, lesson) VALUES
('Chest Pain in the ED', 'Initial evaluation of acute coronary syndrome.', 'core', 'medical',
'[
  {"speaker": "Attending", "german": "Describe the patient''s presentation.", "translation_en": ""}
]'::jsonb, 'Cardiology', 'IHD');
```

### 4. Long Texts (Case Studies) -> `public.long_texts`
Provide a detailed medical case study. `body_de` is the case description (in English), `translation_en` is the clinical takeaway or diagnosis.
Columns: `title_de`, `title_en`, `body_de`, `translation_en`, `level`, `mode`, `chapter`, `lesson`.
Example:
```sql
INSERT INTO public.long_texts (title_de, title_en, body_de, translation_en, level, mode, chapter, lesson) VALUES
('Case Study: Septal Rupture', 'Clinical presentation.', 'A 74-year-old female presents...', 'Key Takeaways: Occurs 3-14 days post-MI.', 'advanced', 'medical', 'Cardiology', 'IHD');
```

### 5. Grammar Exercises (Medical MCQs) -> `public.grammar_exercises`
Provide board-style multiple choice questions. `options` must be a JSON array of 4 strings. `explanation` holds the rationale.
Columns: `question`, `options`, `correct_answer`, `explanation`, `topic`, `level`, `mode`, `chapter`, `lesson`.
Example:
```sql
INSERT INTO public.grammar_exercises (question, options, correct_answer, explanation, topic, level, mode, chapter, lesson) VALUES
('Which artery supplies the posteromedial papillary muscle?', '["PDA", "LAD", "LCx", "LMCA"]', 'PDA', 'It is supplied solely by the PDA, making it vulnerable.', 'Anatomy', 'core', 'medical', 'Cardiology', 'IHD');
```
