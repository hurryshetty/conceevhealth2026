-- ============================================================
-- SEED: 6 Doctor Profiles — Vriksh Fertility Hospital
-- Run in Supabase SQL Editor for project: rjmuhomeqydszmerlqrh
-- ============================================================

-- Ensure is_published and status columns exist on doctors table
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status       text    NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS user_id      uuid    REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── Resolve exact Vriksh Fertility location name ─────────────────────────────
-- (We store the location name string in the hospitals[] array)
DO $$
DECLARE
  v_hospital_name text;
BEGIN
  SELECT name INTO v_hospital_name
  FROM public.locations
  WHERE name ILIKE '%vriksh%'
  ORDER BY name
  LIMIT 1;

  IF v_hospital_name IS NULL THEN
    v_hospital_name := 'Vriksh Fertility Hospital';
    RAISE NOTICE 'No Vriksh location found — defaulting to "Vriksh Fertility Hospital". Update manually if needed.';
  ELSE
    RAISE NOTICE 'Using hospital name: %', v_hospital_name;
  END IF;

  -- ─────────────────────────────────────────────────────────────────────────
  -- 1. Dr. Minal Kumbhalwar
  -- ─────────────────────────────────────────────────────────────────────────
  INSERT INTO public.doctors (
    slug, name, designation, experience, bio,
    qualifications, specializations, surgeries,
    hospitals, cities, languages, consultation_fee,
    is_published, status
  ) VALUES (
    'dr-minal-kumbhalwar',
    'Dr. Minal Kumbhalwar',
    'Fertility Specialist',
    '12 Years',
    'Dr. Minal Kumbhalwar is a highly experienced Obstetrician and Gynaecologist with over 11+ years of clinical expertise in women''s health. She specializes in infertility treatment, high-risk pregnancy care, and advanced laparoscopic surgeries. Dr. Minal Kumbhalwar is known for her compassionate care, precision in diagnosis, and commitment to delivering evidence-based solutions for complex gynaecological and reproductive concerns.

Currently practicing as an IVF Consultant at Vriksh Fertility, Dr. Minal Kumbhalwar brings a rich blend of clinical acumen and surgical skills to help couples achieve their dream of parenthood.

Honors & Awards:
- Dr. N.A. Purandare Award – Best Paper in Pelvic Mass Gynaecology – 47th MOGS Conference
- Paper presentations at AMOGS and POGS annual conferences
- Winner and participant in academic quizzes and scientific paper presentations
- Published as First Author in "Prevalence of uterine lesions with leiomyomas" (IJRCG)
- Co-authored 18 chapters in "Operations in Obstetrics and Gynecology Text and Atlas"
- Co-authored research on "Laparoscopic Management of Adnexal Masses"',
    ARRAY[
      'MBBS – IGGMC, Nagpur',
      'DGO (Obstetrics & Gynaecology) – B.J. Medical College, Pune',
      'DNB (Obstetrics & Gynaecology) – Central Railway Hospital, Mumbai',
      'Fellowship in IVF and Reproductive Medicine – Iswarya Fertility',
      'Fellowship in Minimal Invasive Surgery (FMIS) – RGUHS, Karnataka'
    ],
    ARRAY[
      'Obstetrics & High-Risk Pregnancy Care',
      'Female Infertility Management',
      'Laparoscopic and Hysteroscopic Surgeries',
      'Endometriosis, Fibroids, and PCOS Management',
      'Fertility Preservation & Counselling',
      'Diagnostic & Operative Gynaecology'
    ],
    ARRAY[
      'IVF',
      'Laparoscopic Myomectomy',
      'Hysteroscopy',
      'Diagnostic Laparoscopy',
      'Hysteroscopic Polypectomy'
    ],
    ARRAY[v_hospital_name],
    ARRAY['Bengaluru'],
    ARRAY['English', 'Hindi', 'Marathi'],
    '₹800',
    true,
    'APPROVED'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name           = EXCLUDED.name,
    designation    = EXCLUDED.designation,
    experience     = EXCLUDED.experience,
    bio            = EXCLUDED.bio,
    qualifications = EXCLUDED.qualifications,
    specializations= EXCLUDED.specializations,
    surgeries      = EXCLUDED.surgeries,
    hospitals      = EXCLUDED.hospitals,
    cities         = EXCLUDED.cities,
    languages      = EXCLUDED.languages,
    consultation_fee = EXCLUDED.consultation_fee,
    is_published   = EXCLUDED.is_published,
    status         = EXCLUDED.status;

  -- ─────────────────────────────────────────────────────────────────────────
  -- 2. Dr. Naga Tejaswi Tummala
  -- ─────────────────────────────────────────────────────────────────────────
  INSERT INTO public.doctors (
    slug, name, designation, experience, bio,
    qualifications, specializations, surgeries,
    hospitals, cities, languages, consultation_fee,
    is_published, status
  ) VALUES (
    'dr-naga-tejaswi-tummala',
    'Dr. Naga Tejaswi Tummala',
    'Fertility Specialist',
    '5 Years',
    'Dr. Naga Tejaswi Tummala is a compassionate and dedicated Obstetrician & Gynaecologist with over 5 years of clinical experience in women''s health and reproductive medicine.

She specializes in pregnancy care, infertility management, and gynecological wellness, providing personalized treatment and empathetic support to women through every stage of their reproductive journey. Currently practicing as a Consultant in Obstetrics, Gynaecology & Fertility, Dr. Naga Tejaswi is known for her evidence-based approach, attention to detail, and commitment to helping couples achieve their dream of parenthood.

Professional Affiliations: Federation of Obstetric and Gynecological Societies of India (FOGSI), Indian Society of Assisted Reproduction (ISAR).

Publications:
- "Evaluation of Infertile Women by Diagnostic Hysterolaparoscopy", The New Indian Journal of OBGYN (2021)
- "Serum Lipid Profile in Pregnancy and Its Correlation with Preeclampsia", Nepal Journal of Obstetrics and Gynaecology (2023)
- Paper on "Role of DHL in Female Infertility" at FEM 3.0 Conference, Mumbai (2020)',
    ARRAY[
      'MBBS – Sri Devaraj Urs Medical College, Kolar (2011–2017)',
      'MS – Obstetrics and Gynaecology – Vydehi Institute of Medical Sciences, Bangalore (2018–2021)',
      'FRM – Fellowship in Reproductive Medicine (RGUHS), Bangalore (2021–2023)',
      'MSc – Clinical Embryology (Ongoing) – JIARTC, University of Mysore (2024–Current)'
    ],
    ARRAY[
      'Infertility & Assisted Reproductive Techniques (IVF, IUI, Ovulation Induction)',
      'Management of PCOS, Endometriosis, Adenomyosis & Recurrent Pregnancy Loss',
      'Advanced Ultrasonography & Follicular Monitoring',
      'Diagnostic & Operative Hysteroscopy and Laparoscopy',
      'Pregnancy & High-Risk Obstetric Care',
      'Colposcopy, Cryotherapy & Gynaecological Procedures'
    ],
    ARRAY[
      'IVF',
      'IUI',
      'Diagnostic Hysteroscopy',
      'Operative Laparoscopy',
      'Colposcopy'
    ],
    ARRAY[v_hospital_name],
    ARRAY['Bengaluru'],
    ARRAY['English', 'Telugu', 'Kannada', 'Hindi'],
    '₹700',
    true,
    'APPROVED'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name           = EXCLUDED.name,
    designation    = EXCLUDED.designation,
    experience     = EXCLUDED.experience,
    bio            = EXCLUDED.bio,
    qualifications = EXCLUDED.qualifications,
    specializations= EXCLUDED.specializations,
    surgeries      = EXCLUDED.surgeries,
    hospitals      = EXCLUDED.hospitals,
    cities         = EXCLUDED.cities,
    languages      = EXCLUDED.languages,
    consultation_fee = EXCLUDED.consultation_fee,
    is_published   = EXCLUDED.is_published,
    status         = EXCLUDED.status;

  -- ─────────────────────────────────────────────────────────────────────────
  -- 3. Dr. Prathik R
  -- ─────────────────────────────────────────────────────────────────────────
  INSERT INTO public.doctors (
    slug, name, designation, experience, bio,
    qualifications, specializations, surgeries,
    hospitals, cities, languages, consultation_fee,
    is_published, status
  ) VALUES (
    'dr-prathik-r',
    'Dr. Prathik R',
    'Urologist',
    '7 Years',
    'Dr. Prathik R is an eminent urologist with keen interest in endourology, laparoscopy, andrology, female urology, and urethral reconstruction. He completed his MBBS from MS Ramaiah Medical College, Bengaluru in 2013, MS - General Surgery from PESIMSR, Kuppam in 2016, and DNB Urology from Sri Sathya Sai Institute of Higher Medical Sciences, Puttaparthi in 2019.

During his DNB, he was awarded a scholarship to attend the 17th European Urology Residents Programme at Prague, where he completed his Olympus training course in laparoscopy.

Honors & Awards:
- Certified course in Stress Urinary Incontinence and Urodynamics – Royal College of Surgeons of England, Mumbai (2021)
- Certified course in Retrograde Intrarenal Surgery (RIRS) – Royal College of Surgeons of England, Mumbai (2021)
- Basic Laparoscopy Training Programme – JIPAC, MPUH Nadiad (2021)
- Awarded MNAMS – National Academy of Medical Sciences, Delhi (2021)
- Scholarship – 17th European Urology Residents Programme, Prague (2019)
- 2nd Prize – National Talent Quiz in Plastic Surgery, Ganga Hospital, Coimbatore (2014)
- Certified course in Clinical Research Methods – Indian Institute of Public Health, Delhi (2019)
- Published in IJUrology, Int J Res Med Sci, Int J Sci Res, and other national/international journals',
    ARRAY[
      'MBBS – MS Ramaiah Medical College, Bengaluru (2013)',
      'MS General Surgery – PESIMSR, Kuppam (2016)',
      'DNB Urology – Sri Sathya Sai Institute of Higher Medical Sciences, Puttaparthi (2019)',
      'MNAMS – National Academy of Medical Sciences (2021)',
      'Laparoscopy Fellowship – European Urology Residents Programme, Prague (2019)'
    ],
    ARRAY[
      'Endourology',
      'Laparoscopic Urology',
      'Andrology & Male Fertility',
      'Female Urology',
      'Urethral Reconstruction',
      'Infertility Treatment (TESA/PESA/Microscopic Varicocelectomy)',
      'Renal Transplant'
    ],
    ARRAY[
      'RIRS (Retrograde Intrarenal Surgery)',
      'HoLEP (Holmium Laser Enucleation of Prostate)',
      'Mini PCNL',
      'TOT/TVT (Stress Urinary Incontinence)',
      'TESA / PESA',
      'Microscopic Varicocelectomy',
      'Laparoscopic Donor Nephrectomy',
      'Urethral Reconstruction'
    ],
    ARRAY[v_hospital_name],
    ARRAY['Bengaluru'],
    ARRAY['English', 'Kannada', 'Telugu', 'Hindi'],
    '₹800',
    true,
    'APPROVED'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name           = EXCLUDED.name,
    designation    = EXCLUDED.designation,
    experience     = EXCLUDED.experience,
    bio            = EXCLUDED.bio,
    qualifications = EXCLUDED.qualifications,
    specializations= EXCLUDED.specializations,
    surgeries      = EXCLUDED.surgeries,
    hospitals      = EXCLUDED.hospitals,
    cities         = EXCLUDED.cities,
    languages      = EXCLUDED.languages,
    consultation_fee = EXCLUDED.consultation_fee,
    is_published   = EXCLUDED.is_published,
    status         = EXCLUDED.status;

  -- ─────────────────────────────────────────────────────────────────────────
  -- 4. Dr. Brijesh G C
  -- ─────────────────────────────────────────────────────────────────────────
  INSERT INTO public.doctors (
    slug, name, designation, experience, bio,
    qualifications, specializations, surgeries,
    hospitals, cities, languages, consultation_fee,
    is_published, status
  ) VALUES (
    'dr-brijesh-g-c',
    'Dr. Brijesh G C',
    'Senior Consultant',
    '20+ Years',
    'Dr. Brijesh G C is a well-known Anaesthesiologist currently associated with Vriksh Fertility in Bengaluru. He has 20+ years of experience in Anaesthesiology and has worked as an expert Anaesthesiologist in different cities across India.

Dr. Brijesh G C has contributed to handling numerous complex medical cases in several hospitals. He is known for his attention to accurate diagnosis and for treating patients empathetically. His specialty interests include Anaesthesiology and Critical Care.

He has participated in research work and various workshops under the anaesthesiology department and published many papers.',
    ARRAY[
      'MBBS',
      'MD in Anaesthesia'
    ],
    ARRAY[
      'Anaesthesiology',
      'Critical Care',
      'Pain Management',
      'Perioperative Medicine'
    ],
    ARRAY[]::text[],
    ARRAY[v_hospital_name],
    ARRAY['Bengaluru'],
    ARRAY['English', 'Kannada', 'Hindi'],
    '₹600',
    true,
    'APPROVED'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name           = EXCLUDED.name,
    designation    = EXCLUDED.designation,
    experience     = EXCLUDED.experience,
    bio            = EXCLUDED.bio,
    qualifications = EXCLUDED.qualifications,
    specializations= EXCLUDED.specializations,
    surgeries      = EXCLUDED.surgeries,
    hospitals      = EXCLUDED.hospitals,
    cities         = EXCLUDED.cities,
    languages      = EXCLUDED.languages,
    consultation_fee = EXCLUDED.consultation_fee,
    is_published   = EXCLUDED.is_published,
    status         = EXCLUDED.status;

  -- ─────────────────────────────────────────────────────────────────────────
  -- 5. Dr. Reshma M.A
  -- ─────────────────────────────────────────────────────────────────────────
  INSERT INTO public.doctors (
    slug, name, designation, experience, bio,
    qualifications, specializations, surgeries,
    hospitals, cities, languages, consultation_fee,
    is_published, status
  ) VALUES (
    'dr-reshma-ma',
    'Dr. Reshma M.A',
    'Senior Consultant',
    '12 Years',
    'Dr. Reshma M.A is a highly accomplished Ayurvedic physician specializing in women''s health, particularly in Prasooti Tantra evam Stree Roga — the Ayurvedic science of obstetrics and gynaecology. With a deep-rooted passion for holistic wellness, she seamlessly blends traditional Ayurvedic practices with modern clinical nutrition and therapeutic yoga to offer integrated care for women across all life stages.

With over a decade of experience, Dr. Reshma has guided countless women in managing menstrual disorders, infertility, pregnancy care, menopausal issues, and overall reproductive health using time-tested Ayurvedic therapies and dietary interventions.

Honors & Awards:
- Best Outgoing Student (Snathaka 2008) – SDM College of Ayurveda, Hassan
- 2nd Prize – Paper Presentation at Samavartana 2012 National Seminar, Kerala | "Effect of Phalagritha Yoni Pichu in Stress Incontinence"
- 3rd Rank Holder – Final Year BAMS, RGUHS, Bengaluru',
    ARRAY[
      'BAMS – SDM College of Ayurveda, Hassan (RGUHS, Bangalore) – 2009',
      'MS (Ayu) – Prasooti Tantra evam Stree Roga – SKAMC, Bangalore (RGUHS) – 2013',
      'MSc (Clinical Nutrition & Dietetics) – Karnataka State Open University, Mysore – 2015',
      'Yoga Instructor''s Course (YIC) – S-VYASA University, Bangalore – 2010',
      'PG Diploma in Garbha Sanskar – National Institute of Ayurveda (NIA), Jaipur – 2021'
    ],
    ARRAY[
      'Ayurvedic Gynaecology & Obstetrics',
      'Holistic Fertility Management',
      'Garbha Sanskar (Antenatal Ayurvedic Wellness)',
      'Menstrual & Hormonal Health',
      'Ayurvedic Postnatal Care',
      'Clinical Nutrition for Women''s Health',
      'Stress Incontinence & Reproductive Wellness',
      'Ayurvedic Support in PCOS, Endometriosis, and Menopause'
    ],
    ARRAY[]::text[],
    ARRAY[v_hospital_name],
    ARRAY['Bengaluru'],
    ARRAY['English', 'Kannada', 'Hindi', 'Malayalam'],
    '₹600',
    true,
    'APPROVED'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name           = EXCLUDED.name,
    designation    = EXCLUDED.designation,
    experience     = EXCLUDED.experience,
    bio            = EXCLUDED.bio,
    qualifications = EXCLUDED.qualifications,
    specializations= EXCLUDED.specializations,
    surgeries      = EXCLUDED.surgeries,
    hospitals      = EXCLUDED.hospitals,
    cities         = EXCLUDED.cities,
    languages      = EXCLUDED.languages,
    consultation_fee = EXCLUDED.consultation_fee,
    is_published   = EXCLUDED.is_published,
    status         = EXCLUDED.status;

  -- ─────────────────────────────────────────────────────────────────────────
  -- 6. Dr. Suman Choudhary
  -- ─────────────────────────────────────────────────────────────────────────
  INSERT INTO public.doctors (
    slug, name, designation, experience, bio,
    qualifications, specializations, surgeries,
    hospitals, cities, languages, consultation_fee,
    is_published, status
  ) VALUES (
    'dr-suman-choudhary',
    'Dr. Suman Choudhary',
    'Senior Consultant',
    '4 Years',
    'Dr. Suman Choudhary is a dedicated Acupuncturist who prioritizes the restoration of her patients'' health to help them achieve their full potential in life. With fluency in Kannada, Hindi, and English, she ensures that each patient feels comfortable and well-understood.

Having practiced Acupuncture in Karnataka for a considerable amount of time, Dr. Suman Choudhary is highly respected among her peers and is recognized as one of the top 10 Acupuncturists in Bangalore, Karnataka, India.

At Vriksh Fertility, you will experience a calm, friendly, and approachable atmosphere. Dr. Suman Choudhary offers comprehensive acupuncture services with a proactive approach to the health and well-being of patients seeking Acupuncture services.

She specializes in treating various conditions including Intractable Pain Syndromes, Intervertebral Disc Disease, Radiculitis, Chronic Pelvic Pain, Chronic Neck Pain, Osteoarthritis, Autoimmune Diseases, and Bursitis. Her expertise covers Headache Management, Physical Medicine & Rehabilitation, Massage Therapy, Acute Pain Medicine, Sports Medicine Pain Management, and Physical Therapy.',
    ARRAY[
      'B.Ac. (Bachelor of Acupuncture)'
    ],
    ARRAY[
      'Acupuncture',
      'Intractable Pain Syndromes',
      'Headache Management',
      'Physical Medicine & Rehabilitation',
      'Chronic Pelvic Pain',
      'Sports Medicine Pain Management',
      'Autoimmune Disease Support',
      'Osteoarthritis Management'
    ],
    ARRAY[
      'Third Occipital Nerve Block',
      'Trigger Point Therapy',
      'Epidural Injection',
      'Thoracic Epidural Steroid Injection',
      'Lumbar Selective Nerve Root Block',
      'Intrathecal Drug Delivery System Insertion',
      'Conscious Sedation',
      'Discography'
    ],
    ARRAY[v_hospital_name],
    ARRAY['Bengaluru'],
    ARRAY['English', 'Kannada', 'Hindi'],
    '₹500',
    true,
    'APPROVED'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name           = EXCLUDED.name,
    designation    = EXCLUDED.designation,
    experience     = EXCLUDED.experience,
    bio            = EXCLUDED.bio,
    qualifications = EXCLUDED.qualifications,
    specializations= EXCLUDED.specializations,
    surgeries      = EXCLUDED.surgeries,
    hospitals      = EXCLUDED.hospitals,
    cities         = EXCLUDED.cities,
    languages      = EXCLUDED.languages,
    consultation_fee = EXCLUDED.consultation_fee,
    is_published   = EXCLUDED.is_published,
    status         = EXCLUDED.status;

  RAISE NOTICE 'Done — 6 Vriksh Fertility doctors inserted/updated successfully.';
END $$;

-- Verify
SELECT name, designation, experience, cities, hospitals, is_published, status
FROM public.doctors
WHERE 'Vriksh Fertility Hospital' = ANY(hospitals)
   OR hospitals && ARRAY(SELECT name FROM public.locations WHERE name ILIKE '%vriksh%')
ORDER BY name;

NOTIFY pgrst, 'reload schema';
