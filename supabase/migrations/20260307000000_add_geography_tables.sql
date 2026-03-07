
-- 1. Countries table
CREATE TABLE public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Admin write countries" ON public.countries FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update countries" ON public.countries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete countries" ON public.countries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed India
INSERT INTO public.countries (name, code) VALUES ('India', 'IN');

-- 2. States table
CREATE TABLE public.states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(country_id, name)
);
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read states" ON public.states FOR SELECT USING (true);
CREATE POLICY "Admin write states" ON public.states FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update states" ON public.states FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete states" ON public.states FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed common Indian states
INSERT INTO public.states (country_id, name)
SELECT c.id, s FROM public.countries c,
  unnest(ARRAY[
    'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
    'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
    'Maharashtra','Manipur','Meghalaya','Odisha','Punjab','Rajasthan',
    'Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'
  ]) AS s
WHERE c.code = 'IN';

-- 3. Add state_id to cities
ALTER TABLE public.cities ADD COLUMN state_id UUID REFERENCES public.states(id) ON DELETE SET NULL;
ALTER TABLE public.cities ADD COLUMN country_id UUID REFERENCES public.countries(id) ON DELETE SET NULL;

-- Update Bangalore
UPDATE public.cities SET
  state_id = (SELECT s.id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE c.code='IN' AND s.name='Karnataka'),
  country_id = (SELECT id FROM public.countries WHERE code='IN')
WHERE slug = 'bangalore';

-- Update Hyderabad
UPDATE public.cities SET
  state_id = (SELECT s.id FROM public.states s JOIN public.countries c ON s.country_id = c.id WHERE c.code='IN' AND s.name='Telangana'),
  country_id = (SELECT id FROM public.countries WHERE code='IN')
WHERE slug = 'hyderabad';

-- Update any remaining cities to default India/Karnataka (adjust manually)
UPDATE public.cities SET
  country_id = (SELECT id FROM public.countries WHERE code='IN')
WHERE country_id IS NULL;

-- 4. Areas table
CREATE TABLE public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(city_id, name)
);
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read areas" ON public.areas FOR SELECT USING (true);
CREATE POLICY "Admin write areas" ON public.areas FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update areas" ON public.areas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete areas" ON public.areas FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed Bangalore areas
INSERT INTO public.areas (city_id, name)
SELECT c.id, a FROM public.cities c,
  unnest(ARRAY[
    'Koramangala','Indiranagar','Whitefield','Electronic City','Jayanagar','JP Nagar',
    'HSR Layout','Marathahalli','Hebbal','Bannerghatta Road','Sarjapur Road','BTM Layout',
    'Malleswaram','Rajajinagar','Yelahanka','Banashankari','Bellandur','Domlur',
    'MG Road','Sadashivanagar','RT Nagar','Vijayanagar','Nagarbhavi','Kengeri',
    'CV Raman Nagar','KR Puram','Banaswadi','Bommanahalli','Hennur','Thanisandra'
  ]) AS a
WHERE c.slug = 'bangalore';

-- Seed Hyderabad areas
INSERT INTO public.areas (city_id, name)
SELECT c.id, a FROM public.cities c,
  unnest(ARRAY[
    'Banjara Hills','Jubilee Hills','Hitech City','Gachibowli','Madhapur','Kondapur',
    'Kukatpally','Secunderabad','Ameerpet','Begumpet','Abids','Nampally',
    'Dilsukhnagar','LB Nagar','Uppal','Nacharam','Miyapur','Bachupally',
    'Kompally','Alwal','AS Rao Nagar','Malkajgiri','Trimulgherry','Bowenpally',
    'Tolichowki','Mehdipatnam','Attapur','Masab Tank','Somajiguda','Panjagutta'
  ]) AS a
WHERE c.slug = 'hyderabad';

-- 5. Change locations.area (TEXT) to locations.areas (TEXT[])
ALTER TABLE public.locations ADD COLUMN areas TEXT[] NOT NULL DEFAULT '{}';
UPDATE public.locations SET areas = ARRAY[area] WHERE area IS NOT NULL AND area <> '';
ALTER TABLE public.locations DROP COLUMN area;
