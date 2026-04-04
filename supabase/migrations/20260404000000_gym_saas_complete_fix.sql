
-- =============================================================
-- GYM SAAS COMPLETE FIX MIGRATION
-- Fixes: payments table, subscriptions table, status constraints,
--        admin RLS, profiles name/role columns, demo trainer data
-- =============================================================

-- -------------------------
-- 1. FIX PROFILES TABLE
-- -------------------------
-- Add name and role columns to profiles if not present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'trainer', 'admin'));

-- Allow admin to read all profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Admin full access profiles'
  ) THEN
    CREATE POLICY "Admin full access profiles"
      ON public.profiles FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::public.app_role))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- -------------------------
-- 2. FIX TRAINER_BOOKINGS STATUS CONSTRAINTS
-- -------------------------
-- Drop old constraints and recreate with 'pending' and 'approved'
ALTER TABLE public.trainer_bookings
  DROP CONSTRAINT IF EXISTS trainer_bookings_status_check;

ALTER TABLE public.trainer_bookings
  ADD CONSTRAINT trainer_bookings_status_check
  CHECK (status IN ('pending', 'approved', 'active', 'completed', 'cancelled'));

ALTER TABLE public.trainer_bookings
  DROP CONSTRAINT IF EXISTS trainer_bookings_payment_status_check;

ALTER TABLE public.trainer_bookings
  ADD CONSTRAINT trainer_bookings_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled'));

-- Allow trainers to update bookings they own (for accept/reject)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'trainer_bookings' AND policyname = 'Trainers can update their bookings'
  ) THEN
    CREATE POLICY "Trainers can update their bookings"
      ON public.trainer_bookings FOR UPDATE TO authenticated
      USING (
        trainer_id IN (SELECT id FROM public.trainer_profiles WHERE user_id = auth.uid())
      );
  END IF;
END $$;

-- Allow admin to read and delete all bookings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'trainer_bookings' AND policyname = 'Admin full access bookings'
  ) THEN
    CREATE POLICY "Admin full access bookings"
      ON public.trainer_bookings FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::public.app_role))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- -------------------------
-- 3. FIX TRAINER_PROFILES RLS
-- -------------------------
-- Allow admin full access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'trainer_profiles' AND policyname = 'Admin full access trainer_profiles'
  ) THEN
    CREATE POLICY "Admin full access trainer_profiles"
      ON public.trainer_profiles FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::public.app_role))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- Allow SELECT for all active trainers (already exists but make sure)
-- Allow authenticated users to see all trainer profiles (for booking)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'trainer_profiles' AND policyname = 'Authenticated can view all trainer profiles'
  ) THEN
    CREATE POLICY "Authenticated can view all trainer profiles"
      ON public.trainer_profiles FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

-- -------------------------
-- 4. CREATE PAYMENTS TABLE
-- -------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trainer_id UUID REFERENCES public.trainer_profiles(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'refunded')),
  type TEXT NOT NULL DEFAULT 'trainer' CHECK (type IN ('trainer', 'subscription')),
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users see own payments
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert own payments
CREATE POLICY "Users can insert own payments"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Trainers can view payments where trainer_id = their profile
CREATE POLICY "Trainers can view their payments"
  ON public.payments FOR SELECT TO authenticated
  USING (
    trainer_id IN (SELECT id FROM public.trainer_profiles WHERE user_id = auth.uid())
  );

-- Trainers can insert payments (when approving bookings)
CREATE POLICY "Trainers can insert payments"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (
    trainer_id IN (SELECT id FROM public.trainer_profiles WHERE user_id = auth.uid())
  );

-- Admin full access
CREATE POLICY "Admin full access payments"
  ON public.payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- -------------------------
-- 5. CREATE SUBSCRIPTIONS TABLE
-- -------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users see own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert own subscriptions
CREATE POLICY "Users can insert own subscriptions"
  ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin full access
CREATE POLICY "Admin full access subscriptions"
  ON public.subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- -------------------------
-- 6. USER_ROLES ADMIN ACCESS
-- -------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_roles' AND policyname = 'Admin full access user_roles'
  ) THEN
    CREATE POLICY "Admin full access user_roles"
      ON public.user_roles FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::public.app_role))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- -------------------------
-- 7. DEMO TRAINER DATA
-- -------------------------
-- Make user_id nullable so demo trainers can exist without an auth account
ALTER TABLE public.trainer_profiles ALTER COLUMN user_id DROP NOT NULL;

-- Create a special system user for demo trainers
-- We use a DO block to insert only if no trainers exist
DO $$
DECLARE
  v_system_user_id UUID;
  seed1 UUID := gen_random_uuid();
  seed2 UUID := gen_random_uuid();
  seed3 UUID := gen_random_uuid();
  seed4 UUID := gen_random_uuid();
  seed5 UUID := gen_random_uuid();
BEGIN
  -- Only seed if trainer_profiles is empty
  IF NOT EXISTS (SELECT 1 FROM public.trainer_profiles LIMIT 1) THEN
    -- Insert demo trainer profiles with NULL user_id (we'll make it nullable)
    -- First we need to make user_id nullable temporarily
    INSERT INTO public.trainer_profiles (id, user_id, name, specialty, experience, price_per_session, is_active, bio, certifications, specializations, availability, emoji, rating, reviews_count)
    VALUES
      (seed1, NULL, 'Rahul', 'Strength & HIIT', '12 years', 500, true, 'Certified strength coach with over a decade of experience. Specializes in powerlifting and HIIT circuits.', ARRAY['NSCA-CSCS', 'ACE Certified', 'CrossFit L2'], ARRAY['Weight Loss', 'Muscle Gain', 'Strength'], ARRAY['Mon-Fri: 6AM-12PM', 'Sat: 8AM-2PM'], '💪', 4.9, 284),
      (seed2, NULL, 'Muskan', 'Yoga & Flexibility', '8 years', 400, true, 'Hatha and Vinyasa yoga instructor focused on mind-body balance.', ARRAY['RYT-500', 'Yoga Alliance', 'Sports Mobility Cert'], ARRAY['Yoga', 'Flexibility', 'Recovery'], ARRAY['Mon-Sat: 5AM-10AM', 'Mon-Fri: 5PM-8PM'], '🧘', 4.8, 192),
      (seed3, NULL, 'Arjun', 'CrossFit & Nutrition', '10 years', 700, true, 'Nutrition expert and CrossFit coach who combines dietary planning with high-intensity training.', ARRAY['Precision Nutrition L2', 'CrossFit L3', 'ISSA CPT'], ARRAY['CrossFit', 'Nutrition', 'Cardio'], ARRAY['Mon-Fri: 7AM-3PM', 'Sun: 9AM-1PM'], '🏋️', 4.9, 347),
      (seed4, NULL, 'Priya', 'Cardio & Dance Fitness', '6 years', 450, true, 'Energetic dance fitness instructor who makes cardio fun and effective.', ARRAY['Zumba Licensed', 'ACE GFI', 'First Aid CPR'], ARRAY['Cardio', 'Dance Fitness', 'Weight Loss'], ARRAY['Mon-Fri: 4PM-9PM', 'Sat-Sun: 7AM-12PM'], '💃', 4.8, 211),
      (seed5, NULL, 'Vikram', 'Bodybuilding & Posing', '15 years', 800, true, 'Former competitive bodybuilder with 15 years of coaching experience.', ARRAY['IFBB Pro Card', 'NASM-CPT', 'Sports Nutrition'], ARRAY['Bodybuilding', 'Competition Prep', 'Muscle Gain'], ARRAY['Mon-Sat: 8AM-6PM'], '🏆', 4.7, 156);
  END IF;
END $$;

