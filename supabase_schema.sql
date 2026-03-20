-- 1. Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('FOUNDER', 'INVESTOR', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create the Profiles table (links to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  role user_role NOT NULL DEFAULT 'FOUNDER',
  city TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create role-specific tables
CREATE TABLE IF NOT EXISTS public.founders (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  industry TEXT,
  bio TEXT
);

CREATE TABLE IF NOT EXISTS public.investors (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  investment_range TEXT,
  bio TEXT
);

-- 4. Create core functionality tables
CREATE TABLE IF NOT EXISTS public.startups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  founder_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  custom_id TEXT UNIQUE NOT NULL,
  industry TEXT NOT NULL,
  stage TEXT NOT NULL,
  location TEXT NOT NULL,
  funding_needed TEXT NOT NULL,
  pitch TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.access_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  investor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status request_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(startup_id, investor_id)
);

-- 5. Data Migration from OLD tables (optional, skip if tables don't exist yet)
-- This moves data from 'founder' (singular) to 'profiles' + 'founders' (plural)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'founder') THEN
        -- Link to dummy auth if needed or just prepare the profiles. 
        -- Note: Real users MUST sign up via Auth to appear in 'profiles' correctly.
        -- We will only migrate these if they have matching entries in auth.users.
        INSERT INTO public.profiles (id, email, role)
        SELECT id, email, 'FOUNDER' FROM public.founder
        ON CONFLICT (email) DO NOTHING;
        
        INSERT INTO public.founders (id)
        SELECT id FROM public.founder
        ON CONFLICT (id) DO NOTHING;
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'investor') THEN
        INSERT INTO public.profiles (id, email, role)
        SELECT id, email, 'INVESTOR' FROM public.investor
        ON CONFLICT (email) DO NOTHING;
        
        INSERT INTO public.investors (id)
        SELECT id FROM public.investor
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- 6. Trigger for Automatic Profile Creation on Signup (CRITICAL)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    CAST(COALESCE(new.raw_user_meta_data->>'role', 'FOUNDER') AS user_role)
  );

  IF new.raw_user_meta_data->>'role' = 'FOUNDER' THEN
    INSERT INTO public.founders (id, industry) VALUES (new.id, new.raw_user_meta_data->>'industry');
  ELSIF new.raw_user_meta_data->>'role' = 'INVESTOR' THEN
    INSERT INTO public.investors (id, investment_range) VALUES (new.id, new.raw_user_meta_data->>'investment_range');
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.profiles FOR ALL USING (auth.role() = 'authenticated');
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.founders FOR ALL USING (auth.role() = 'authenticated');
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.investors FOR ALL USING (auth.role() = 'authenticated');
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.startups FOR ALL USING (auth.role() = 'authenticated');
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for authenticated" ON public.access_requests FOR ALL USING (auth.role() = 'authenticated');
