-- ═══════════════════════════════════════════════════════════
--  Medical Mode — IHD Content Seed
--  Run in Supabase SQL Editor → New Query → Run without RLS
-- ═══════════════════════════════════════════════════════════
-- First: add a mode column to sentences to separate medical from language content
ALTER TABLE public.sentences ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'language';
ALTER TABLE public.words    ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'language';
-- Create medical_cards table for the Medical Mode typing/reading cards
CREATE TABLE IF NOT EXISTS public.medical_cards (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic       TEXT NOT NULL,          -- e.g. "Coronary Anatomy"
  subtopic    TEXT,                   -- e.g. "Left Coronary Artery"
  card_type   TEXT NOT NULL DEFAULT 'fact',  -- fact | definition | complication | drug | ecg
  front       TEXT NOT NULL,          -- The statement/question to type or read
  back        TEXT,                   -- Explanation / detail shown after
  source      TEXT DEFAULT 'IHD',     -- which text file this came from
  difficulty  TEXT NOT NULL DEFAULT 'core',  -- core | advanced | expert
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- RLS for medical_cards: public read
ALTER TABLE public.medical_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read medical_cards" ON public.medical_cards;
CREATE POLICY "Public read medical_cards" ON public.medical_cards FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth insert medical_cards" ON public.medical_cards;
CREATE POLICY "Auth insert medical_cards" ON public.medical_cards FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- ═══════════════════════════════════════════════════════════
--  IHD CONTENT — Coronary Anatomy
-- ═══════════════════════════════════════════════════════════
INSERT INTO public.medical_cards (topic, subtopic, card_type, front, back, difficulty) VALUES
('Coronary Anatomy', 'Left Coronary Artery', 'fact',
'The LAD supplies the anterior two-thirds of the interventricular septum, the anterolateral papillary muscle, and the anterior surface of the left ventricle.',
'The Left Anterior Descending (LAD) arises from the left main coronary artery. It runs down the anterior interventricular groove. Loss of LAD flow → anterior MI (V1–V4 changes on ECG).', 'core'),
('Coronary Anatomy', 'Left Circumflex Artery', 'fact',
'The LCx travels in the left atrioventricular groove, supplying the lateral and posterolateral walls of the left ventricle, and variable portions of the inferior territory.',
'The LCx is the other major branch of the left main. In left-dominant systems, it also gives off the posterior descending artery (PDA).', 'core'),
('Coronary Anatomy', 'Right Coronary Artery', 'fact',
'The RCA supplies the right ventricle, right atrium, inferior LV wall, posterior third of the interventricular septum, posteromedial papillary muscle, and the SA and AV nodes.',
'Because the RCA feeds the AV node in right-dominant systems (≈85% of people), a proximal RCA occlusion can cause heart block in addition to inferior MI.', 'core'),
('Coronary Anatomy', 'Coronary Dominance', 'definition',
'Coronary dominance is defined by which artery gives rise to the posterior descending artery (PDA). Right dominance is present in the majority of individuals.',
'Right dominant: PDA from RCA (~85%). Left dominant: PDA from LCx (~8%). Codominant: PDA from both (~7%). Dominance dictates which territory is threatened by a given occlusion.', 'core'),
('Coronary Anatomy', 'Perfusion Physiology', 'fact',
'Left ventricular coronary perfusion occurs predominantly during diastole because systolic myocardial contraction physically compresses intramyocardial vessels.',
'This is why tachycardia is dangerous in IHD — it shortens diastole, reducing LV perfusion time. RV perfusion is more continuous because RV systolic pressures are lower.', 'advanced'),
-- ═══════════════════════════════════════════════════════════
--  Oxygen Supply & Demand
-- ═══════════════════════════════════════════════════════════
('O₂ Supply & Demand', 'Supply Reduction', 'fact',
'Myocardial oxygen supply is reduced by coronary obstruction, tachycardia (shortens diastole), hypotension (reduces perfusion pressure), microvascular dysfunction, and severe anemia or hypoxemia.',
'A clinically important pearl: severe anemia can cause ischemia even with normal coronary arteries, because the oxygen content of blood itself is inadequate.', 'core'),
('O₂ Supply & Demand', 'Demand Determinants', 'fact',
'Myocardial oxygen consumption is driven by three main factors: heart rate, myocardial contractility, and ventricular wall stress (afterload).',
'Laplace''s Law: Wall stress = (Pressure × Radius) / (2 × Wall Thickness). Hypertension, aortic stenosis, and dilated ventricles all markedly increase wall stress and thus oxygen demand.', 'core'),
('O₂ Supply & Demand', 'Tachycardia as Double Threat', 'fact',
'Tachycardia acts as a double-edged sword: it simultaneously spikes myocardial oxygen demand (more contractions per minute) while reducing supply (shortened diastolic perfusion time).',
'This is the physiological basis for beta-blockers as anti-anginal agents — slowing heart rate reduces demand AND lengthens diastole for better perfusion.', 'advanced'),
-- ═══════════════════════════════════════════════════════════
--  Atherosclerosis
-- ═══════════════════════════════════════════════════════════
('Atherosclerosis', 'Plaque Formation', 'fact',
'LDL particles penetrate the endothelium, undergo oxidation, and trigger monocyte recruitment. Macrophages consume modified lipids via scavenger receptors, forming lipid-laden foam cells — the hallmark of early atherosclerosis.',
'Smooth muscle cells then migrate from the tunica media to the intima, depositing collagen and elastin, forming a fibrous cap over a growing necrotic core.', 'core'),
('Atherosclerosis', 'Vulnerable Plaque', 'definition',
'A vulnerable plaque has a massive necrotic core, intense macrophage-driven inflammation, decreased smooth muscle cells, and a dangerously thin fibrous cap — making it prone to rupture or erosion.',
'Contrast with a stable plaque: thick fibrous cap, small lipid core, more smooth muscle → causes predictable exertional angina but is unlikely to rupture acutely.', 'core'),
('Atherosclerosis', 'Plaque Rupture vs Erosion', 'fact',
'Plaque rupture: the fibrous cap tears at its shoulder, exposing the necrotic core and tissue factor, triggering the coagulation cascade. Plaque erosion: endothelium sloughs off exposing the subendothelial matrix, provoking a platelet-rich thrombus.',
'Both mechanisms can cause ACS. Erosion is more common in younger women and smokers. Rupture is more common overall and classically causes STEMI.', 'advanced'),
-- ═══════════════════════════════════════════════════════════
--  MI Histological Evolution
-- ═══════════════════════════════════════════════════════════
('MI Evolution', '0–24 Hours', 'fact',
'From 0–4 hours: wavy myocardial fibers appear. From 4–24 hours: early coagulative necrosis begins with edema, hemorrhage, and release of cellular contents into the bloodstream.',
'Reperfusion at this stage causes contraction band necrosis — calcium influx and free radicals hypercontract the myofibrils, visible as dark eosinophilic bands. This paradoxical injury is why rapid reperfusion is still preferred despite this risk.', 'advanced'),
('MI Evolution', '1–3 Days', 'complication',
'At 1–3 days post-MI: extensive coagulative necrosis occurs. Heavy neutrophil infiltration marks an acute inflammatory response. Macroscopically the tissue is overtly hyperemic.',
'Key complication at this stage: peri-infarction fibrinous pericarditis — the patient develops pleuritic chest pain and a friction rub. Generally self-limited.', 'core'),
('MI Evolution', '3–14 Days — Peak Mechanical Vulnerability', 'complication',
'At 3–14 days: macrophages degrade necrotic tissue before a firm scar forms. This is the peak window for free-wall rupture (→ tamponade), papillary muscle rupture (→ acute MR), and septal rupture (→ VSD).',
'The ventricular wall is at its weakest during this macrophage-mediated debridement phase. Any new hemodynamic deterioration in this window demands urgent evaluation for mechanical complications.', 'core'),
('MI Evolution', 'Papillary Muscle Rupture', 'complication',
'Papillary muscle rupture occurs 2–7 days post-MI. The posteromedial papillary muscle is overwhelmingly affected because it has a single blood supply from the PDA (unlike the anterolateral, which has dual supply from LAD and LCx).',
'Presents with sudden acute mitral regurgitation, flash pulmonary edema, and cardiogenic shock. Requires urgent surgical repair.', 'core'),
('MI Evolution', 'Weeks to Months — Late Complications', 'complication',
'Late post-MI complications include Dressler syndrome (autoimmune pericarditis 2–10 weeks post-MI), true ventricular aneurysm (thinned fibrotic scar bulges outward → risk of mural thrombus, persistent ST elevation, late arrhythmias), and chronic heart failure.',
'Dressler syndrome is caused by antibodies against released myocardial antigens. Treat with aspirin or NSAIDs; avoid anticoagulation if concurrent pericarditis with effusion is present.', 'advanced'),
-- ═══════════════════════════════════════════════════════════
--  Chronic Coronary Syndromes (CCS/Stable Angina)
-- ═══════════════════════════════════════════════════════════
('Chronic Coronary Syndromes', 'Typical vs Atypical Angina', 'definition',
'Typical angina meets all 3 criteria: (1) Retrosternal pressure/squeezing, (2) Provoked by exertion or emotional stress, (3) Relieved by rest or nitrates within minutes. Atypical angina meets 2 of 3.',
'Atypical presentations — isolated dyspnea, fatigue, nausea, epigastric discomfort — are particularly common in women, older adults, and diabetics due to autonomic neuropathy blunting pain perception.', 'core'),
('Chronic Coronary Syndromes', 'CCS Grading (Canadian Cardiovascular Society)', 'definition',
'Class I: Angina only with rapid/strenuous exertion. Class II: Slight limitation — angina climbing stairs or walking rapidly. Class III: Marked limitation — angina after 1–2 blocks or one flight of stairs. Class IV: Angina at rest or with minimal activity.',
'CCS grading guides both medical and revascularization decisions. Class III–IV despite optimal medical therapy is a strong indication for coronary angiography.', 'core'),
('Chronic Coronary Syndromes', 'Coronary Steal Physiology', 'fact',
'Distal to a significant stenosis, microvascular resistance vessels are maximally dilated at baseline. Pharmacological vasodilators (adenosine, dipyridamole) dilate normal vessels, creating a path of least resistance that "steals" blood away from the already-maximally-dilated diseased bed, provoking ischemia.',
'This is the basis of pharmacological stress testing. Dipyridamole and adenosine are contraindicated in active asthma, significant bradycardia/heart block, and hypotension.', 'advanced'),
('Chronic Coronary Syndromes', 'Prinzmetal (Variant) Angina', 'definition',
'Prinzmetal angina is caused by transient epicardial coronary vasospasm, occurring at rest or at night. ECG shows transient ST-segment elevation. Common in young smokers without major atherosclerotic risk factors.',
'Triggers: cocaine, alcohol, triptans. Treatment: CCBs and nitrates. Beta-blockers are CONTRAINDICATED — they leave alpha-adrenergic vasoconstriction unopposed, worsening spasm. Aspirin is also avoided as it can aggravate attacks.', 'advanced'),
-- ═══════════════════════════════════════════════════════════
--  ACS
-- ═══════════════════════════════════════════════════════════
('Acute Coronary Syndromes', 'UA vs NSTEMI vs STEMI', 'definition',
'UA: ischemic symptoms + no biomarker rise (troponin negative). NSTEMI: ischemia + troponin positive rise/fall, but NO persistent ST elevation. STEMI: ischemia + persistent ST-segment elevation (complete/near-complete epicardial occlusion).',
'The troponin distinguishes UA from NSTEMI. The ECG (persistent STE) distinguishes STEMI. Crucially: STEMI reperfusion must NEVER be delayed waiting for a troponin result.', 'core'),
('Acute Coronary Syndromes', 'High-Sensitivity Troponin Logic', 'fact',
'ACS diagnosis requires a dynamic acute rise and/or fall in troponin, with at least one value above the 99th percentile, in the clinical context of ischemia. A stable chronic elevation suggests background structural disease, not acute plaque rupture.',
'An acute elevation without ischemia = acute myocardial injury (sepsis, myocarditis, PE, etc.) — not necessarily ACS. The rise-and-fall pattern is essential.', 'advanced'),
('Acute Coronary Syndromes', 'STEMI Reperfusion Strategy', 'drug',
'Primary PCI is preferred for STEMI if door-to-balloon time <90 minutes. If PCI cannot be performed within 120 minutes, fibrinolytic therapy (alteplase, tenecteplase) is indicated for eligible patients with symptom onset <12 hours.',
'Absolute contraindications to fibrinolytics: previous intracranial hemorrhage, recent major surgery or trauma, suspected aortic dissection, uncontrolled severe hypertension. Always respect contraindications before thrombolyzing.', 'core'),
('Acute Coronary Syndromes', 'NSTE-ACS Invasive Timing', 'fact',
'Immediate invasive (<2h): cardiogenic shock, hemodynamic instability, refractory chest pain, life-threatening arrhythmias, or mechanical complications. Early invasive (<24h): confirmed NSTEMI (troponin positive) or significant ST changes. Selective: lower-risk patients managed medically first.',
'The key concept: NSTE-ACS is a spectrum. Unlike STEMI, not all NSTE-ACS patients require immediate angiography — timing is risk-stratified.', 'core'),
-- ═══════════════════════════════════════════════════════════
--  ECG Localization
-- ═══════════════════════════════════════════════════════════
('ECG Localization', 'Anterior Territories', 'ecg',
'Anteroseptal infarction (LAD): changes in leads V1–V2. Anteroapical/distal LAD: V3–V4. Anterolateral (LAD or LCx): V5–V6.',
'The LAD is the most commonly culprit artery in STEMI. Proximal LAD occlusion (before first septal branch) is particularly devastating, causing large anterior MI.', 'core'),
('ECG Localization', 'Inferior and Posterior Territories', 'ecg',
'Inferior MI (RCA > LCx): leads II, III, aVF. Always obtain right-sided leads (V4R) to assess for concurrent right ventricular infarction — common with proximal RCA occlusion. Posterior MI (PDA): ST depression + tall R waves in V1–V3; confirm with posterior leads V7–V9 showing direct ST elevation.',
'Right ventricular infarction is critical to recognize: these patients are preload-dependent. Nitrates and diuretics are CONTRAINDICATED as they cause precipitous hypotension.', 'core'),
('ECG Localization', 'Biomarker Kinetics', 'fact',
'Troponin: rises at 4 hours, peaks 24–48 hours, stays elevated 7–10 days. Excellent for diagnosis but poor for detecting reinfarction. CK-MB: rises 6–12 hours, peaks 16–24 hours, normalizes within 48 hours — the preferred marker for diagnosing REINFARCTION.',
'Remember: in a patient who has already had a recent MI (troponin still elevated), a reinfarction is best detected by a new rise in CK-MB, not troponin.', 'advanced'),
-- ═══════════════════════════════════════════════════════════
--  Pharmacology
-- ═══════════════════════════════════════════════════════════
('Pharmacology', 'Antiplatelet Strategy', 'drug',
'All ACS patients receive immediate Aspirin loading. Add a P2Y12 inhibitor (ticagrelor or prasugrel preferred over clopidogrel for PCI patients) for Dual Antiplatelet Therapy (DAPT). Standard DAPT duration: 12 months.',
'Ticagrelor and prasugrel have more potent and predictable platelet inhibition than clopidogrel. Prasugrel is CONTRAINDICATED in prior stroke/TIA and used cautiously in patients ≥75 years or <60 kg.', 'core'),
('Pharmacology', 'Beta-Blockers in IHD', 'drug',
'Beta-blockers reduce myocardial oxygen demand by lowering heart rate, contractility, and blood pressure. They prolong diastole, improving coronary perfusion. They are first-line anti-anginal agents and reduce mortality post-MI.',
'CONTRAINDICATED in: Prinzmetal angina (worsen spasm), acute decompensated heart failure, severe bradycardia/heart block, and cardiogenic shock. Use with caution in reactive airway disease.', 'core'),
('Pharmacology', 'Nitrates — Mechanism and Contraindications', 'drug',
'Nitrates relieve angina primarily by dilating capacitance veins → decreased venous return (preload) → reduced ventricular wall stress → lower oxygen demand. They also have modest coronary vasodilator effects.',
'CONTRAINDICATED in: Right ventricular infarction (preload-dependent), hypotension, and within 24–48 hours of PDE-5 inhibitor use (sildenafil, tadalafil) — combination causes severe refractory hypotension.', 'core'),
('Pharmacology', 'Statins in Secondary Prevention', 'drug',
'High-intensity statins lower LDL, reduce vascular inflammation, improve endothelial function, and promote plaque stabilization. They are foundational secondary prevention. If LDL ≥70 mg/dL on max-tolerated statin: add ezetimibe (↓ intestinal absorption) or a PCSK9 inhibitor (profound additional LDL reduction).',
'Statins have beneficial effects beyond LDL lowering (pleotropic effects): anti-inflammatory, antithrombotic, and endothelial-stabilizing. These contribute significantly to outcome improvement.', 'core'),
('Pharmacology', 'ACE Inhibitors / ARBs', 'drug',
'ACE inhibitors (or ARBs if ACE-intolerant) reduce vasoconstriction, sodium retention, and maladaptive ventricular remodeling. Strongly indicated in IHD patients who also have reduced EF, anterior MI, hypertension, diabetes, or chronic kidney disease.',
'The mechanism: ACEi blocks conversion of angiotensin I → angiotensin II, reducing aldosterone release, lowering blood pressure, and preventing pathological cardiac remodeling post-MI.', 'core'),
-- ═══════════════════════════════════════════════════════════
--  Device Therapy & Rehabilitation
-- ═══════════════════════════════════════════════════════════
('Device Therapy', 'ICD Implantation Criteria', 'fact',
'Primary prevention ICD: EF <35% with NYHA class II–III symptoms (or EF <30% with NYHA I), at least 40 days post-MI and 3 months post-revascularization. Secondary prevention: survivors of cardiac arrest or sustained hemodynamically significant VT without a reversible cause.',
'The post-MI waiting period before ICD implantation is critical: stunned or hibernating myocardium may recover function with revascularization and medical therapy, potentially raising EF above the threshold.', 'advanced'),
('Lifestyle & Rehab', 'Cardiac Rehabilitation', 'fact',
'Cardiac rehabilitation after ACS or revascularization provides supervised exercise, risk-factor management, nutritional counseling, psychological care, and return-to-work planning. It improves functional capacity, endothelial function, autonomic balance, and quality of life.',
'Cardiac rehab is one of the most evidence-based interventions in cardiology with consistent mortality benefit, yet remains chronically underutilized. It should be actively offered to every eligible patient.', 'core'),
('Lifestyle & Rehab', 'MI Types 1–5', 'definition',
'Type 1: Atherothrombotic (plaque rupture/erosion). Type 2: Supply-demand mismatch without thrombosis (anemia, spasm, tachyarrhythmia, hypotension). Type 3: Cardiac death before biomarkers can be measured. Type 4: PCI-associated. Type 5: CABG-associated.',
'Type 2 MI is critically important — it does NOT require the same aggressive antiplatelet strategy as Type 1. Treatment targets the underlying cause (e.g., transfuse for severe anemia, rate-control for tachyarrhythmia).', 'advanced');
