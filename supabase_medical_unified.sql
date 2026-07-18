-- ═══════════════════════════════════════════════════════════
--  Medical Mode — Unified IHD Content & MCQ Database Seed
--  Run in Supabase SQL Editor → New Query → Run without RLS
-- ═══════════════════════════════════════════════════════════

-- 1. Ensure columns exist on all tables
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

-- Clean up any previous medical content to prevent duplicates
DELETE FROM public.sentences         WHERE mode = 'medical';
DELETE FROM public.words             WHERE mode = 'medical';
DELETE FROM public.dialogues         WHERE mode = 'medical';
DELETE FROM public.long_texts        WHERE mode = 'medical';
DELETE FROM public.grammar_exercises WHERE mode = 'medical';


-- ═══════════════════════════════════════════════════════════
--  SECTION 1: EXERCISES (sentences table)
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.sentences (german, translation_en, level, mode, language, chapter, lesson) VALUES

('The Left Anterior Descending artery supplies the anterior septum, the anterolateral papillary muscle, and the apex of the left ventricle.',
 'Occlusion leads to anterior wall myocardial infarction, presenting with ST elevation in V1–V4.',
 'core', 'medical', 'en', 'Cardiology', 'IHD'),

('Left ventricular coronary blood flow occurs almost entirely during diastole due to compression of subendocardial vessels during systole.',
 'This highlights why tachycardia is dangerous in IHD: it shortens diastolic perfusion time.',
 'advanced', 'medical', 'en', 'Cardiology', 'IHD'),

('A vulnerable atherosclerotic plaque is characterized by a thin fibrous cap, a large necrotic lipid core, and high macrophage activity.',
 'Contrast with stable plaque (thick cap, low lipid core), which causes predictable exertional angina.',
 'core', 'medical', 'en', 'Cardiology', 'IHD'),

('At three to fourteen days post-myocardial infarction, macrophages degrade necrotic tissue, making this the peak window for myocardial free-wall rupture.',
 'Other mechanical complications in this window include papillary muscle rupture and ventricular septal defect.',
 'advanced', 'medical', 'en', 'Cardiology', 'IHD'),

('Posteromedial papillary muscle rupture occurs more frequently than anterolateral rupture because it is supplied solely by the posterior descending artery.',
 'Anterolateral papillary muscle has dual blood supply from both the LAD and Left Circumflex arteries.',
 'expert', 'medical', 'en', 'Cardiology', 'IHD'),

('Nitrates alleviate anginal pain primarily by dilating systemic capacitance veins, reducing preload, ventricular volume, and myocardial wall stress.',
 'This reduces myocardial oxygen consumption (demand). Note: they are contraindicated with phosphodiesterase-5 inhibitors.',
 'core', 'medical', 'en', 'Cardiology', 'IHD');


-- ═══════════════════════════════════════════════════════════
--  SECTION 2: TERMINOLOGY (words table)
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.words (german, translation, level, mode, category, chapter, lesson) VALUES

('Atherosclerosis', 'Inflammatory disease of arteries characterized by lipid deposition and plaque formation in the tunica intima.', 'core', 'medical', 'Anatomy', 'Cardiology', 'IHD'),
('Diastole', 'The phase of the cardiac cycle when the heart muscle relaxes, allowing chambers to fill and coronary vessels to perfuse.', 'core', 'medical', 'Physiology', 'Cardiology', 'IHD'),
('ST-Elevation', 'An ECG finding indicating acute transmural myocardial injury and near-total occlusion of a major epicardial coronary artery.', 'core', 'medical', 'Diagnostics', 'Cardiology', 'IHD'),
('Troponin', 'A highly specific cardiac regulatory protein biomarker released into the circulation following myocardial necrosis.', 'core', 'medical', 'Diagnostics', 'Cardiology', 'IHD'),
('Coronary Steal', 'Physiological diversion of blood away from stenotic, maximally-dilated vascular beds toward normal dilated beds under vasodilator stress.', 'advanced', 'medical', 'Physiology', 'Cardiology', 'IHD'),
('Prinzmetal Angina', 'Transient coronary vasospasm causing rest ischemia and ST elevation, treated with calcium channel blockers.', 'advanced', 'medical', 'Pathology', 'Cardiology', 'IHD'),
('Dressler Syndrome', 'Late post-myocardial infarction autoimmune pericarditis presenting with pleuritic chest pain and friction rub.', 'advanced', 'medical', 'Complications', 'Cardiology', 'IHD'),
('Ranolazine', 'An anti-anginal drug that selectively inhibits the late inward sodium current, reducing diastolic wall stress.', 'expert', 'medical', 'Pharmacology', 'Cardiology', 'IHD'),
('Alteplase', 'A recombinant tissue plasminogen activator (tPA) used for fibrinolytic therapy in acute STEMI when PCI is delayed.', 'advanced', 'medical', 'Pharmacology', 'Cardiology', 'IHD'),
('Cardiogenic Shock', 'A state of critical organ hypoperfusion due to primary cardiac failure, characterized by low cardiac index and high filling pressures.', 'expert', 'medical', 'Complications', 'Cardiology', 'IHD');


-- ═══════════════════════════════════════════════════════════
--  SECTION 3: CLINICAL CASES (dialogues table)
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.dialogues (title_de, title_en, level, mode, lines, chapter, lesson) VALUES

('Chest Pain in the Emergency Department',
 'Initial evaluation of acute coronary syndrome.',
 'core', 'medical',
 '[
   {"speaker": "Attending", "german": "Describe the patient''s presentation and vital signs."},
   {"speaker": "Resident", "german": "Sixty-two-year-old male with severe crushing retrosternal pressure radiating to the left arm and jaw."},
   {"speaker": "Attending", "german": "What does the initial electrocardiogram reveal?"},
   {"speaker": "Resident", "german": "Three millimeter ST-segment elevation in leads V1 through V4 with reciprocal depression in leads II, III, and aVF."},
   {"speaker": "Attending", "german": "This is an acute anterior STEMI. Contact the cath lab for emergency PCI immediately."}
 ]', 'Cardiology', 'IHD'),

('Managing Right Ventricular Infarction',
 'Preload-dependent hemodynamics.',
 'advanced', 'medical',
 '[
   {"speaker": "Fellow", "german": "The patient with inferior STEMI has developed severe hypotension following one sublingual nitroglycerin."},
   {"speaker": "Attending", "german": "Did you obtain a right-sided ECG?"},
   {"speaker": "Fellow", "german": "Yes, lead V4R shows two millimeters of ST-segment elevation, confirming right ventricular involvement."},
   {"speaker": "Attending", "german": "Avoid further nitrates or diuretics. Give a rapid intravenous normal saline fluid bolus to restore right ventricular preload."}
 ]', 'Cardiology', 'IHD');


-- ═══════════════════════════════════════════════════════════
--  SECTION 4: CASE STUDIES (long_texts table)
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.long_texts (title_de, title_en, body_de, translation_en, level, mode, chapter, lesson) VALUES

('Case Study: Post-Infarction Septal Rupture',
 'Clinical presentation and hemodynamic step-up in ventricular septal rupture.',
 'A 74-year-old female presents to the emergency department five days after experiencing an untreated inferior wall myocardial infarction. On examination, she is in mild respiratory distress with a blood pressure of 90/55 mmHg. Cardiovascular examination reveals a new, harsh 4/6 holosystolic murmur heard loudest at the lower left sternal border, accompanied by a palpable parasternal thrill.

An echocardiogram is performed immediately, revealing a defect in the muscular interventricular septum with a large left-to-right shunt. Right heart catheterization confirms the diagnosis by showing a significant hemodynamic oxygen saturation step-up from the right atrium (64%) to the right ventricle (82%). The patient is started on an intra-aortic balloon pump (IABP) for afterload reduction and scheduled for urgent surgical septal repair.',
 'Key Takeaways: Ventricular septal rupture classically occurs 3–14 days post-MI during macrophage-mediated debridement of necrotic myocardium. It presents with a harsh holosystolic murmur at the left sternal border and an oxygen saturation step-up in the right ventricle.',
 'advanced', 'medical', 'Cardiology', 'IHD'),

('Cardiology Literature: Coronary Perfusion and Autoregulation',
 'Physiological mechanisms regulating myocardial blood flow.',
 'Under physiological conditions, myocardial oxygen extraction is near-maximal at rest (approximately 70% to 80%). Consequently, any increase in myocardial oxygen demand must be met by a proportional increase in coronary blood flow. Coronary blood flow is tightly regulated by local metabolic factors, primarily adenosine, nitric oxide, and interstitial oxygen levels.

Autoregulation maintains constant coronary blood flow over a wide range of perfusion pressures (60 to 140 mmHg). In the presence of a hemodynamically significant epicardial coronary artery stenosis, distal arteriolar vessels undergo maximal compensatory vasodilation to maintain resting flow. Under these conditions, the administration of pharmacological vasodilators (such as adenosine or dipyridamole) will selectively dilate normal vessels, stealing blood flow away from the stenotic territory and causing transient subendocardial ischemia.',
 'Key Takeaways: Because resting oxygen extraction is maximal, oxygen delivery depends strictly on flow. Vasodilator-induced coronary steal is the primary pathophysiological basis for stress perfusion imaging.',
 'expert', 'medical', 'Cardiology', 'IHD');


-- ═══════════════════════════════════════════════════════════
--  SECTION 5: QUIZZES & MCQs (grammar_exercises table)
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.grammar_exercises (question, options, correct_answer, explanation, topic, level, mode, chapter, lesson) VALUES

('Which coronary artery branch supplies the posteromedial papillary muscle of the mitral valve?',
 '["Posterior descending artery", "Left anterior descending artery", "Left circumflex artery", "Left main coronary artery"]',
 'Posterior descending artery',
 'The posteromedial papillary muscle is supplied solely by the posterior descending artery (PDA), making it highly vulnerable to rupture during inferior infarctions. The anterolateral papillary muscle has dual supply from LAD and LCx.',
 'Anatomy', 'core', 'medical', 'Cardiology', 'IHD'),

('Why are beta-blockers contraindicated in patients presenting with Prinzmetal (variant) angina?',
 '["They leave alpha-adrenergic receptors unopposed, worsening coronary vasospasm", "They cause excessive dilation of capacitance veins", "They decrease diastolic perfusion time of the left ventricle", "They increase ventricular wall stress"]',
 'They leave alpha-adrenergic receptors unopposed, worsening coronary vasospasm',
 'Beta-blockers block beta-2 mediated vasodilation, leaving alpha-1 mediated vasoconstriction unopposed. This can cause or exacerbate severe coronary artery spasm in variant angina.',
 'Pharmacology', 'advanced', 'medical', 'Cardiology', 'IHD'),

('A patient has new ST-segment elevation in leads II, III, and aVF. Which coronary territory is infarcted?',
 '["Inferior wall", "Anterior septal wall", "Lateral wall", "Posterior wall"]',
 'Inferior wall',
 'Leads II, III, and aVF view the inferior surface of the heart, which is supplied by the Right Coronary Artery (RCA) in approximately 85% of individuals (right dominant systems).',
 'Diagnostics', 'core', 'medical', 'Cardiology', 'IHD'),

('What is the preferred drug for secondary prevention in a patient with coronary artery disease who has an LDL of 85 mg/dL despite max-tolerated high-intensity statin therapy?',
 '["Ezetimibe", "Gemfibrozil", "Niacin", "Colesevelam"]',
 'Ezetimibe',
 'According to guidelines, if a patient does not reach the LDL target on a maximum tolerated dose of a high-intensity statin, ezetimibe (which blocks cholesterol absorption at the brush border) is the first-line add-on agent.',
 'Pharmacology', 'advanced', 'medical', 'Cardiology', 'IHD'),

('Which cardiac biomarker normalizes within 48 hours and is preferred for diagnosing acute reinfarction?',
 '["CK-MB", "Cardiac Troponin I", "Myoglobin", "Lactate Dehydrogenase"]',
 'CK-MB',
 'CK-MB rises within 6 hours, peaks at 24 hours, and normalizes within 48 to 72 hours. Cardiac troponin stays elevated for up to 10 days, making it less useful for diagnosing a new reinfarction.',
 'Diagnostics', 'advanced', 'medical', 'Cardiology', 'IHD'),

('Which mechanical complication post-myocardial infarction is typically associated with a clinical step-up in oxygen saturation between the right atrium and the right ventricle?',
 '["Ventricular septal rupture", "Papillary muscle rupture", "Left ventricular free-wall rupture", "Pseudoaneurysm formation"]',
 'Ventricular septal rupture',
 'Ventricular septal rupture creates an interventricular shunt, mixing oxygenated blood from the left ventricle into the right ventricle, which shows up as a step-up in oxygen saturation during right heart catheterization.',
 'Complications', 'expert', 'medical', 'Cardiology', 'IHD');
