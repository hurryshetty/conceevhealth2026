
-- ─────────────────────────────────────────────────────────────────────────────
-- Comprehensive Geography Seed: Countries → States → Cities → Areas
-- Safe to run multiple times (ON CONFLICT DO NOTHING)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. COUNTRIES ─────────────────────────────────────────────────────────────
INSERT INTO public.countries (name, code) VALUES
  ('India',                 'IN'),
  ('United Arab Emirates',  'AE'),
  ('United States',         'US'),
  ('United Kingdom',        'GB'),
  ('Singapore',             'SG'),
  ('Canada',                'CA'),
  ('Australia',             'AU'),
  ('Germany',               'DE'),
  ('Saudi Arabia',          'SA'),
  ('Qatar',                 'QA'),
  ('Kuwait',                'KW'),
  ('Bahrain',               'BH'),
  ('Oman',                  'OM'),
  ('Malaysia',              'MY'),
  ('Thailand',              'TH')
ON CONFLICT (name) DO NOTHING;

-- ─── 2. STATES / REGIONS ──────────────────────────────────────────────────────

-- India — all states & union territories
INSERT INTO public.states (country_id, name)
SELECT c.id, s FROM public.countries c,
  unnest(ARRAY[
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
    'Andaman & Nicobar Islands', 'Dadra & Nagar Haveli', 'Lakshadweep'
  ]) AS s
WHERE c.code = 'IN'
ON CONFLICT (country_id, name) DO NOTHING;

-- UAE — emirates
INSERT INTO public.states (country_id, name)
SELECT c.id, s FROM public.countries c,
  unnest(ARRAY[
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman',
    'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'
  ]) AS s
WHERE c.code = 'AE'
ON CONFLICT (country_id, name) DO NOTHING;

-- United States — top states
INSERT INTO public.states (country_id, name)
SELECT c.id, s FROM public.countries c,
  unnest(ARRAY[
    'California', 'New York', 'Texas', 'Florida', 'Illinois',
    'New Jersey', 'Massachusetts', 'Georgia', 'Washington', 'Pennsylvania',
    'Ohio', 'Michigan', 'Arizona', 'North Carolina', 'Virginia',
    'Colorado', 'Maryland', 'Nevada', 'Indiana', 'Tennessee'
  ]) AS s
WHERE c.code = 'US'
ON CONFLICT (country_id, name) DO NOTHING;

-- United Kingdom — countries/regions
INSERT INTO public.states (country_id, name)
SELECT c.id, s FROM public.countries c,
  unnest(ARRAY[
    'England', 'Scotland', 'Wales', 'Northern Ireland'
  ]) AS s
WHERE c.code = 'GB'
ON CONFLICT (country_id, name) DO NOTHING;

-- Canada — provinces
INSERT INTO public.states (country_id, name)
SELECT c.id, s FROM public.countries c,
  unnest(ARRAY[
    'Ontario', 'British Columbia', 'Quebec', 'Alberta',
    'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick',
    'Newfoundland and Labrador', 'Prince Edward Island'
  ]) AS s
WHERE c.code = 'CA'
ON CONFLICT (country_id, name) DO NOTHING;

-- Australia — states & territories
INSERT INTO public.states (country_id, name)
SELECT c.id, s FROM public.countries c,
  unnest(ARRAY[
    'New South Wales', 'Victoria', 'Queensland',
    'South Australia', 'Western Australia', 'Tasmania',
    'Australian Capital Territory', 'Northern Territory'
  ]) AS s
WHERE c.code = 'AU'
ON CONFLICT (country_id, name) DO NOTHING;

-- Singapore — regions
INSERT INTO public.states (country_id, name)
SELECT c.id, s FROM public.countries c,
  unnest(ARRAY[
    'Central Region', 'East Region', 'North Region',
    'North-East Region', 'West Region'
  ]) AS s
WHERE c.code = 'SG'
ON CONFLICT (country_id, name) DO NOTHING;

-- Saudi Arabia — regions
INSERT INTO public.states (country_id, name)
SELECT c.id, s FROM public.countries c,
  unnest(ARRAY[
    'Riyadh Region', 'Makkah Region', 'Madinah Region', 'Eastern Province',
    'Asir Region', 'Tabuk Region', 'Qassim Region', 'Ha''il Region',
    'Jazan Region', 'Najran Region', 'Al Bahah Region', 'Al Jawf Region',
    'Northern Borders Region'
  ]) AS s
WHERE c.code = 'SA'
ON CONFLICT (country_id, name) DO NOTHING;

-- ─── 3. CITIES ────────────────────────────────────────────────────────────────

-- Karnataka
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Bangalore',   'bangalore'),
    ('Mysore',      'mysore'),
    ('Hubli',       'hubli'),
    ('Mangalore',   'mangalore'),
    ('Belgaum',     'belgaum'),
    ('Davangere',   'davangere'),
    ('Shimoga',     'shimoga'),
    ('Tumkur',      'tumkur'),
    ('Gulbarga',    'gulbarga'),
    ('Bidar',       'bidar')
  ) AS v(name, slug)
WHERE s.name = 'Karnataka'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Telangana
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Hyderabad',    'hyderabad'),
    ('Warangal',     'warangal'),
    ('Karimnagar',   'karimnagar'),
    ('Nizamabad',    'nizamabad'),
    ('Khammam',      'khammam'),
    ('Nalgonda',     'nalgonda'),
    ('Adilabad',     'adilabad'),
    ('Suryapet',     'suryapet')
  ) AS v(name, slug)
WHERE s.name = 'Telangana'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Maharashtra
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Mumbai',       'mumbai'),
    ('Pune',         'pune'),
    ('Nagpur',       'nagpur'),
    ('Nashik',       'nashik'),
    ('Aurangabad',   'aurangabad'),
    ('Solapur',      'solapur'),
    ('Kolhapur',     'kolhapur'),
    ('Thane',        'thane'),
    ('Navi Mumbai',  'navi-mumbai'),
    ('Amravati',     'amravati')
  ) AS v(name, slug)
WHERE s.name = 'Maharashtra'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Tamil Nadu
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Chennai',          'chennai'),
    ('Coimbatore',       'coimbatore'),
    ('Madurai',          'madurai'),
    ('Salem',            'salem'),
    ('Tiruchirappalli',  'trichy'),
    ('Tirunelveli',      'tirunelveli'),
    ('Erode',            'erode'),
    ('Vellore',          'vellore'),
    ('Thanjavur',        'thanjavur'),
    ('Tirupur',          'tirupur')
  ) AS v(name, slug)
WHERE s.name = 'Tamil Nadu'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Delhi
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('New Delhi',        'new-delhi'),
    ('Delhi',            'delhi'),
    ('Noida',            'noida'),
    ('Dwarka',           'dwarka'),
    ('Rohini',           'rohini')
  ) AS v(name, slug)
WHERE s.name = 'Delhi'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Gujarat
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Ahmedabad',  'ahmedabad'),
    ('Surat',      'surat'),
    ('Vadodara',   'vadodara'),
    ('Rajkot',     'rajkot'),
    ('Bhavnagar',  'bhavnagar'),
    ('Jamnagar',   'jamnagar'),
    ('Junagadh',   'junagadh'),
    ('Anand',      'anand')
  ) AS v(name, slug)
WHERE s.name = 'Gujarat'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Rajasthan
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Jaipur',     'jaipur'),
    ('Jodhpur',    'jodhpur'),
    ('Udaipur',    'udaipur'),
    ('Kota',       'kota'),
    ('Bikaner',    'bikaner'),
    ('Ajmer',      'ajmer'),
    ('Sikar',      'sikar'),
    ('Alwar',      'alwar')
  ) AS v(name, slug)
WHERE s.name = 'Rajasthan'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- West Bengal
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Kolkata',      'kolkata'),
    ('Howrah',       'howrah'),
    ('Durgapur',     'durgapur'),
    ('Asansol',      'asansol'),
    ('Siliguri',     'siliguri'),
    ('Bardhaman',    'bardhaman')
  ) AS v(name, slug)
WHERE s.name = 'West Bengal'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Kerala
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Kochi',              'kochi'),
    ('Thiruvananthapuram', 'thiruvananthapuram'),
    ('Kozhikode',          'kozhikode'),
    ('Thrissur',           'thrissur'),
    ('Kollam',             'kollam'),
    ('Kannur',             'kannur'),
    ('Alappuzha',          'alappuzha'),
    ('Palakkad',           'palakkad')
  ) AS v(name, slug)
WHERE s.name = 'Kerala'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Punjab
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Amritsar',    'amritsar'),
    ('Ludhiana',    'ludhiana'),
    ('Jalandhar',   'jalandhar'),
    ('Patiala',     'patiala'),
    ('Bathinda',    'bathinda'),
    ('Mohali',      'mohali')
  ) AS v(name, slug)
WHERE s.name = 'Punjab'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Haryana
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Gurugram',    'gurugram'),
    ('Faridabad',   'faridabad'),
    ('Panipat',     'panipat'),
    ('Ambala',      'ambala'),
    ('Rohtak',      'rohtak'),
    ('Hisar',       'hisar')
  ) AS v(name, slug)
WHERE s.name = 'Haryana'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Uttar Pradesh
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Lucknow',      'lucknow'),
    ('Agra',         'agra'),
    ('Varanasi',     'varanasi'),
    ('Kanpur',       'kanpur'),
    ('Allahabad',    'allahabad'),
    ('Meerut',       'meerut'),
    ('Ghaziabad',    'ghaziabad'),
    ('Mathura',      'mathura'),
    ('Bareilly',     'bareilly'),
    ('Gorakhpur',    'gorakhpur')
  ) AS v(name, slug)
WHERE s.name = 'Uttar Pradesh'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Madhya Pradesh
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Bhopal',     'bhopal'),
    ('Indore',     'indore'),
    ('Gwalior',    'gwalior'),
    ('Jabalpur',   'jabalpur'),
    ('Ujjain',     'ujjain'),
    ('Rewa',       'rewa')
  ) AS v(name, slug)
WHERE s.name = 'Madhya Pradesh'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Andhra Pradesh
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Visakhapatnam', 'visakhapatnam'),
    ('Vijayawada',    'vijayawada'),
    ('Guntur',        'guntur'),
    ('Nellore',       'nellore'),
    ('Kurnool',       'kurnool'),
    ('Rajahmundry',   'rajahmundry'),
    ('Tirupati',      'tirupati')
  ) AS v(name, slug)
WHERE s.name = 'Andhra Pradesh'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Bihar
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Patna',      'patna'),
    ('Gaya',       'gaya'),
    ('Muzaffarpur','muzaffarpur'),
    ('Bhagalpur',  'bhagalpur')
  ) AS v(name, slug)
WHERE s.name = 'Bihar'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Odisha
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Bhubaneswar', 'bhubaneswar'),
    ('Cuttack',     'cuttack'),
    ('Rourkela',    'rourkela'),
    ('Sambalpur',   'sambalpur')
  ) AS v(name, slug)
WHERE s.name = 'Odisha'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Chhattisgarh
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Raipur',     'raipur'),
    ('Bhilai',     'bhilai'),
    ('Bilaspur',   'bilaspur')
  ) AS v(name, slug)
WHERE s.name = 'Chhattisgarh'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Jharkhand
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Ranchi',   'ranchi'),
    ('Jamshedpur','jamshedpur'),
    ('Dhanbad',  'dhanbad')
  ) AS v(name, slug)
WHERE s.name = 'Jharkhand'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Goa
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Panaji',      'panaji'),
    ('Margao',      'margao'),
    ('Vasco da Gama','vasco-da-gama')
  ) AS v(name, slug)
WHERE s.name = 'Goa'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Uttarakhand
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Dehradun',   'dehradun'),
    ('Haridwar',   'haridwar'),
    ('Rishikesh',  'rishikesh'),
    ('Roorkee',    'roorkee')
  ) AS v(name, slug)
WHERE s.name = 'Uttarakhand'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Himachal Pradesh
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Shimla',     'shimla'),
    ('Manali',     'manali'),
    ('Dharamshala','dharamshala'),
    ('Solan',      'solan')
  ) AS v(name, slug)
WHERE s.name = 'Himachal Pradesh'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Assam
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Guwahati',  'guwahati'),
    ('Silchar',   'silchar'),
    ('Dibrugarh', 'dibrugarh')
  ) AS v(name, slug)
WHERE s.name = 'Assam'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Chandigarh
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES ('Chandigarh', 'chandigarh')) AS v(name, slug)
WHERE s.name = 'Chandigarh'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- Puducherry
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES ('Puducherry', 'puducherry')) AS v(name, slug)
WHERE s.name = 'Puducherry'
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'IN')
ON CONFLICT (slug) DO NOTHING;

-- UAE cities
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Dubai City',       'dubai-city'),
    ('Abu Dhabi City',   'abu-dhabi-city'),
    ('Sharjah City',     'sharjah-city'),
    ('Ajman City',       'ajman-city'),
    ('Ras Al Khaimah City','ras-al-khaimah-city'),
    ('Fujairah City',    'fujairah-city'),
    ('Al Ain',           'al-ain')
  ) AS v(name, slug)
WHERE (
  (s.name = 'Dubai'         AND v.name = 'Dubai City')        OR
  (s.name = 'Abu Dhabi'     AND v.name = 'Abu Dhabi City')    OR
  (s.name = 'Abu Dhabi'     AND v.name = 'Al Ain')            OR
  (s.name = 'Sharjah'       AND v.name = 'Sharjah City')      OR
  (s.name = 'Ajman'         AND v.name = 'Ajman City')        OR
  (s.name = 'Ras Al Khaimah' AND v.name = 'Ras Al Khaimah City') OR
  (s.name = 'Fujairah'      AND v.name = 'Fujairah City')
)
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'AE')
ON CONFLICT (slug) DO NOTHING;

-- Singapore cities (by region)
INSERT INTO public.cities (name, slug, state_id, country_id)
SELECT v.name, v.slug, s.id, s.country_id
FROM public.states s,
  (VALUES
    ('Orchard',       'singapore-orchard'),
    ('Marina Bay',    'singapore-marina-bay'),
    ('Raffles Place', 'singapore-raffles-place'),
    ('Buona Vista',   'singapore-buona-vista'),
    ('Tampines',      'singapore-tampines'),
    ('Jurong East',   'singapore-jurong-east'),
    ('Woodlands',     'singapore-woodlands')
  ) AS v(name, slug)
WHERE (
  (s.name = 'Central Region'  AND v.slug IN ('singapore-orchard','singapore-marina-bay','singapore-raffles-place')) OR
  (s.name = 'West Region'     AND v.slug IN ('singapore-buona-vista','singapore-jurong-east')) OR
  (s.name = 'East Region'     AND v.slug = 'singapore-tampines') OR
  (s.name = 'North Region'    AND v.slug = 'singapore-woodlands')
)
  AND EXISTS (SELECT 1 FROM public.countries c WHERE c.id = s.country_id AND c.code = 'SG')
ON CONFLICT (slug) DO NOTHING;

-- ─── 4. AREAS ─────────────────────────────────────────────────────────────────

-- Bangalore (already seeded, adding more)
INSERT INTO public.areas (city_id, name)
SELECT c.id, a FROM public.cities c,
  unnest(ARRAY[
    'Koramangala','Indiranagar','Whitefield','Electronic City','Jayanagar','JP Nagar',
    'HSR Layout','Marathahalli','Hebbal','Bannerghatta Road','Sarjapur Road','BTM Layout',
    'Malleswaram','Rajajinagar','Yelahanka','Banashankari','Bellandur','Domlur',
    'MG Road','Sadashivanagar','RT Nagar','Vijayanagar','Nagarbhavi','Kengeri',
    'CV Raman Nagar','KR Puram','Banaswadi','Bommanahalli','Hennur','Thanisandra',
    'Yeshwanthpur','Peenya','Tumkur Road','Jalahalli','Mathikere','Sanjay Nagar',
    'HBR Layout','Horamavu','Rammurthy Nagar','Medahalli','Brookefield','Mahadevapura',
    'Kadugodi','Varthur','Harlur','Haralur Road','Devanahalli','Anekal',
    'Electronic City Phase 1','Electronic City Phase 2','Bommasandra','Begur',
    'Hulimavu','Gottigere','Bilekahalli','Arekere','Mico Layout','Akshayanagar'
  ]) AS a
WHERE c.slug = 'bangalore'
ON CONFLICT (city_id, name) DO NOTHING;

-- Hyderabad
INSERT INTO public.areas (city_id, name)
SELECT c.id, a FROM public.cities c,
  unnest(ARRAY[
    'Banjara Hills','Jubilee Hills','Hitech City','Gachibowli','Madhapur','Kondapur',
    'Kukatpally','Secunderabad','Ameerpet','Begumpet','Abids','Nampally',
    'Dilsukhnagar','LB Nagar','Uppal','Nacharam','Miyapur','Bachupally',
    'Kompally','Alwal','AS Rao Nagar','Malkajgiri','Trimulgherry','Bowenpally',
    'Tolichowki','Mehdipatnam','Attapur','Masab Tank','Somajiguda','Panjagutta',
    'SR Nagar','Ameerpet','Vidyanagar','Musheerabad','Kachiguda','Malakpet',
    'Vanasthalipuram','Hayathnagar','Nagole','Boduppal','Ghatkesar','Cherlapally',
    'Yapral','Moulali','Tarnaka','Sainikpuri','ECIL','Neredmet',
    'Suchitra','Quthbullapur','Medchal','Shamirpet','Patancheru','Lingampally',
    'Hitec City Phase 1','Hitec City Phase 2','Financial District','Nanakramguda'
  ]) AS a
WHERE c.slug = 'hyderabad'
ON CONFLICT (city_id, name) DO NOTHING;

-- Mumbai
INSERT INTO public.areas (city_id, name)
SELECT c.id, a FROM public.cities c,
  unnest(ARRAY[
    'Andheri East','Andheri West','Bandra East','Bandra West','Borivali East',
    'Borivali West','Churchgate','Colaba','Chembur','Dadar','Dharavi',
    'Fort','Ghatkopar','Goregaon','Juhu','Kandivali','Kurla','Khar',
    'Lower Parel','Matunga','Malad','Mira Road','Mulund','Nariman Point',
    'Powai','Santacruz','Vile Parle','Versova','Worli','Vikhroli',
    'Wadala','Sion','Sewri','Parel','Lalbaug','Byculla','Grant Road',
    'Marine Lines','Charni Road','Mahim','Jogeshwari','Dahisar','Malabar Hill',
    'Pedder Road','Cuffe Parade','Mahalaxmi','Tardeo','Nana Chowk','Bhuleshwar',
    'Ghatkopar East','Ghatkopar West','Tilak Nagar','Sakinaka','Asalpha','Powai Lake'
  ]) AS a
WHERE c.slug = 'mumbai'
ON CONFLICT (city_id, name) DO NOTHING;

-- Pune
INSERT INTO public.areas (city_id, name)
SELECT c.id, a FROM public.cities c,
  unnest(ARRAY[
    'Aundh','Baner','Balewadi','Bund Garden','Camp','Deccan','Erandwane',
    'Hadapsar','Hinjewadi','Kalyani Nagar','Kharadi','Koregaon Park','Katraj',
    'Kothrud','Magarpatta','Model Colony','Mundhwa','Nagar Road','Pashan',
    'Pimpri','Chinchwad','Pimpri-Chinchwad','Sinhagad Road','Shivajinagar',
    'Swargate','Tilak Road','Viman Nagar','Wakad','Warje','Yerwada',
    'Ambegaon','Dhayari','Bibwewadi','Sadashiv Peth','Narayan Peth','Laxmi Road',
    'Fatima Nagar','Yerawada','Nanded City','Sus','Bavdhan','Marunji',
    'Sopan Baug','Pune Cantonment','Wanawadi','Kondhwa','Undri','Ambegaon Budruk'
  ]) AS a
WHERE c.slug = 'pune'
ON CONFLICT (city_id, name) DO NOTHING;

-- Chennai
INSERT INTO public.areas (city_id, name)
SELECT c.id, a FROM public.cities c,
  unnest(ARRAY[
    'Adyar','Alwarpet','Anna Nagar','Ashok Nagar','Aminjikarai','Besant Nagar',
    'Chromepet','Chetpet','Egmore','RA Puram','T Nagar','Velachery',
    'Nungambakkam','Mylapore','Perambur','Virugambakkam','Kodambakkam',
    'Kilpauk','Saidapet','West Mambalam','Teynampet','Mandaveli','Thiruvanmiyur',
    'Tambaram','Pallavaram','Perungudi','Sholinganallur','Karapakkam','Thoraipakkam',
    'Porur','Maduravoyil','Valasaravakkam','Ambattur','Korattur','Mogappair',
    'Avadi','Padi','Kolathur','Villivakkam','Arumbakkam','Choolaimedu',
    'Vadapalani','Koyambedu','Nerkundram','Poonamallee','Maduravoyal',
    'Guindy','St Thomas Mount','Alandur','Nanganallur','Madipakkam','Perungalathur'
  ]) AS a
WHERE c.slug = 'chennai'
ON CONFLICT (city_id, name) DO NOTHING;

-- Delhi / New Delhi
INSERT INTO public.areas (city_id, name)
SELECT c.id, a FROM public.cities c,
  unnest(ARRAY[
    'Connaught Place','Karol Bagh','Paharganj','Chandni Chowk','Lajpat Nagar',
    'Nehru Place','Saket','Vasant Kunj','Dwarka','Janakpuri','Pitampura',
    'Rohini','Preet Vihar','Mayur Vihar','Noida Extension','Greater Kailash',
    'South Extension','Hauz Khas','Malviya Nagar','Panchsheel Park','Green Park',
    'Safdarjung','RK Puram','Munirka','Vasant Vihar','Chanakyapuri','Dhaula Kuan',
    'Rajouri Garden','Punjabi Bagh','Shalimar Bagh','Ashok Vihar','Wazirpur',
    'GTB Nagar','Mukherjee Nagar','Civil Lines','Kamla Nagar','Maurice Nagar',
    'Saraswati Vihar','Rani Bagh','Shakti Nagar','Patel Nagar','Rajendra Nagar',
    'Jhandewalan','Ramesh Nagar','Tagore Garden','Uttam Nagar','Nawada',
    'Bindapur','Vikaspuri','Tilak Nagar','Subhash Nagar','Moti Nagar'
  ]) AS a
WHERE c.slug IN ('delhi', 'new-delhi')
ON CONFLICT (city_id, name) DO NOTHING;

-- Kolkata
INSERT INTO public.areas (city_id, name)
SELECT c.id, a FROM public.cities c,
  unnest(ARRAY[
    'Park Street','Esplanade','New Market','Salt Lake','Rajarhat','Newtown',
    'Dumdum','Behala','Tollygunge','Jadavpur','Ballygunge','Alipore',
    'Howrah Bridge','Shyambazar','Ultadanga','Maniktala','Phoolbagan',
    'Kasba','Santoshpur','Dhakuria','Lake Town','VIP Road','Baguiati',
    'Teghoria','Belgharia','Sodepur','Baranagar','Kamarhati','Serampore',
    'Garia','Sonarpur','Rajpur','Bansdroni','Regent Park','Dum Dum Park'
  ]) AS a
WHERE c.slug = 'kolkata'
ON CONFLICT (city_id, name) DO NOTHING;

-- Ahmedabad
INSERT INTO public.areas (city_id, name)
SELECT c.id, a FROM public.cities c,
  unnest(ARRAY[
    'Navrangpura','Maninagar','Satellite','Vastrapur','Bodakdev','Prahlad Nagar',
    'Gota','Chandkheda','Bopal','South Bopal','Shela','Ambli',
    'Thaltej','SG Highway','Drive In Road','CG Road','Ashram Road',
    'Paldi','Ellisbridge','Law Garden','Mithakhali','Usmanpura','Memnagar',
    'Nikol','Naroda','Vastral','Isanpur','Vatva','Odhav',
    'Rakhial','Amraiwadi','Bapunagar','Ghodasar','Juhapura','Vejalpur'
  ]) AS a
WHERE c.slug = 'ahmedabad'
ON CONFLICT (city_id, name) DO NOTHING;

-- Kochi
INSERT INTO public.areas (city_id, name)
SELECT c.id, a FROM public.cities c,
  unnest(ARRAY[
    'Ernakulam','Fort Kochi','Mattancherry','Edappally','Kakkanad','Kalamassery',
    'Aluva','Perumbavoor','Angamaly','Tripunithura','Thripunithura','Vytila',
    'Palarivattom','Vyttila','Thevara','Cheranalloor','Maradu','Thrikkakara',
    'Elamakkara','Pachalam','Vallarpadam','Willingdon Island','Pizhala'
  ]) AS a
WHERE c.slug = 'kochi'
ON CONFLICT (city_id, name) DO NOTHING;

-- Jaipur
INSERT INTO public.areas (city_id, name)
SELECT c.id, a FROM public.cities c,
  unnest(ARRAY[
    'Malviya Nagar','Vaishali Nagar','Mansarovar','Jagatpura','Tonk Road',
    'Pratap Nagar','Sanganer','Vidhyadhar Nagar','Sikar Road','Ajmer Road',
    'Civil Lines','Raja Park','Gopalpura','C-Scheme','Bani Park',
    'Shyam Nagar','Chitrakoot','Kalwar Road','Kanota','Bindayaka',
    'Nirman Nagar','Adarsh Nagar','Jhotwara','Khatipura','New Sanganer Road'
  ]) AS a
WHERE c.slug = 'jaipur'
ON CONFLICT (city_id, name) DO NOTHING;

-- Dubai
INSERT INTO public.areas (city_id, name)
SELECT c.id, a FROM public.cities c,
  unnest(ARRAY[
    'Downtown Dubai','Dubai Marina','JBR (Jumeirah Beach Residence)','Palm Jumeirah',
    'Business Bay','DIFC','Jumeirah','Jumeirah Lake Towers (JLT)','Discovery Gardens',
    'Dubai Silicon Oasis','Dubai Sports City','Dubai Investment Park','Al Barsha',
    'Motor City','Arabian Ranches','The Greens','The Views','Al Quoz',
    'Deira','Bur Dubai','Karama','Satwa','Oud Metha','Garhoud','Festival City',
    'Mirdif','Academic City','International City','Al Muhaisnah','Muhaisnah',
    'Al Nahda','Al Qusais','Al Twar','Rashidiya','Al Warqa','Hor Al Anz'
  ]) AS a
WHERE c.slug = 'dubai-city'
ON CONFLICT (city_id, name) DO NOTHING;

-- Lucknow
INSERT INTO public.areas (city_id, name)
SELECT c.id, a FROM public.cities c,
  unnest(ARRAY[
    'Gomti Nagar','Hazratganj','Alambagh','Aminabad','Aliganj','Indira Nagar',
    'Vikas Nagar','Rajajipuram','Chinhat','Kanpur Road','Faizabad Road',
    'Sitapur Road','Shaheed Path','Sultanpur Road','Raebareli Road',
    'Mahanagar','Kapoorthala','Jankipuram','Kursi Road','Sector-H'
  ]) AS a
WHERE c.slug = 'lucknow'
ON CONFLICT (city_id, name) DO NOTHING;

-- Chandigarh
INSERT INTO public.areas (city_id, name)
SELECT c.id, a FROM public.cities c,
  unnest(ARRAY[
    'Sector 1','Sector 2','Sector 3','Sector 7','Sector 8','Sector 9','Sector 10',
    'Sector 11','Sector 14','Sector 15','Sector 16','Sector 17','Sector 18',
    'Sector 19','Sector 20','Sector 21','Sector 22','Sector 23','Sector 26',
    'Sector 27','Sector 28','Sector 29','Sector 30','Sector 32','Sector 33',
    'Sector 34','Sector 35','Sector 36','Sector 37','Sector 38','Sector 40',
    'Sector 41','Sector 43','Sector 44','Sector 45','Sector 46','Sector 47',
    'Manimajra','Panchkula','Mohali Phase 1','Mohali Phase 2','Mohali Phase 3'
  ]) AS a
WHERE c.slug = 'chandigarh'
ON CONFLICT (city_id, name) DO NOTHING;
