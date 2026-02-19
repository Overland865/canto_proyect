-- ============================================
-- SCRIPT DE MIGRACIÓN CORREGIDO (FIX ERROR 42710)
-- Objetivo: Actualizar DB existente manejando objetos duplicados
-- ============================================

BEGIN;

-- 1. ACTUALIZAR TABLA PROFILES
-- --------------------------------------------
-- Eliminar check existente si existe
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Migrar datos existentes (sin fallar si ya se corrió antes)
UPDATE public.profiles SET role = 'consumer' WHERE role = 'cliente';
UPDATE public.profiles SET role = 'provider' WHERE role = 'proveedor';

-- Aplicar nuevo Check
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('guest', 'consumer', 'provider', 'admin'));

ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'guest';

-- 2. ACTUALIZAR SERVICES
-- --------------------------------------------
-- Renombrar 'name' a 'title' de forma segura
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'name')
  THEN
      ALTER TABLE public.services RENAME COLUMN "name" TO "title";
  END IF;
END $$;

-- Agregar columnas nuevas si faltan
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS gallery text[];
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS provider_id uuid REFERENCES public.provider_profiles(id) ON DELETE CASCADE;


-- 3. TABLAS Y POLÍTICAS (CORRECCIÓN DE ERROR 42710: DROP BEFORE CREATE)
-- --------------------------------------------

-- A) PROVIDER_PROFILES
CREATE TABLE IF NOT EXISTS public.provider_profiles (
  id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  business_name text NOT NULL,
  contact_phone text,
  categories text[],
  status text CHECK (status IN ('pending', 'approved', 'rejected', 'disabled')) DEFAULT 'pending',
  description text,
  logo_url text,
  social_media jsonb DEFAULT '{}'::jsonb,
  views integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;

-- ELIMINAR POLÍTICAS ANTIGUAS SI EXISTEN (Para evitar error "Policy already exists")
DROP POLICY IF EXISTS "Public provider profiles are viewable by everyone" ON public.provider_profiles;
DROP POLICY IF EXISTS "Providers can update own profile" ON public.provider_profiles;

-- CREAR POLÍTICAS
CREATE POLICY "Public provider profiles are viewable by everyone" ON public.provider_profiles FOR SELECT USING (true);
CREATE POLICY "Providers can update own profile" ON public.provider_profiles FOR UPDATE USING (auth.uid() = id);


-- B) BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id uuid REFERENCES public.provider_profiles(id) ON DELETE CASCADE NOT NULL,
  service_id bigint REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  date timestamp with time zone NOT NULL,
  status text CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  total_price numeric NOT NULL CHECK (total_price >= 0),
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Asegurar que las columnas existen (en caso de que la tabla Booking existiera de otra versión)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS provider_id uuid REFERENCES public.provider_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS service_id bigint REFERENCES public.services(id) ON DELETE CASCADE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending';

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ELIMINAR POLÍTICAS ANTIGUAS
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Providers can view bookings for them" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Providers can update bookings" ON public.bookings;

-- CREAR POLÍTICAS
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Providers can view bookings for them" ON public.bookings FOR SELECT USING (auth.uid() = provider_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Providers can update bookings" ON public.bookings FOR UPDATE USING (auth.uid() = provider_id);


-- C) NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);


-- D) PROVIDER_AVAILABILITY
CREATE TABLE IF NOT EXISTS public.provider_availability (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  provider_id uuid REFERENCES public.provider_profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  status text CHECK (status IN ('blocked', 'available')) DEFAULT 'blocked',
  CONSTRAINT unique_provider_date UNIQUE (provider_id, date)
);
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Providers can manage availability" ON public.provider_availability;
CREATE POLICY "Providers can manage availability" ON public.provider_availability FOR ALL USING (auth.uid() = provider_id);

DROP POLICY IF EXISTS "Anyone can view provider availability" ON public.provider_availability;
CREATE POLICY "Anyone can view provider availability" ON public.provider_availability FOR SELECT USING (true);


-- 4. FUNCIONES RPC
-- --------------------------------------------
CREATE OR REPLACE FUNCTION create_booking(
  p_provider_id uuid,
  p_service_id bigint,
  p_date timestamp with time zone,
  p_total_price numeric,
  p_notes text
) RETURNS bigint AS $$
DECLARE
  v_booking_id bigint;
BEGIN
  -- Insert Booking
  INSERT INTO public.bookings (user_id, provider_id, service_id, date, total_price, notes, status)
  VALUES (auth.uid(), p_provider_id, p_service_id, p_date, p_total_price, p_notes, 'pending')
  RETURNING id INTO v_booking_id;

  -- Insert Notification for Provider
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (p_provider_id, 'booking_request', 'Nueva Solicitud', 'Tienes una nueva solicitud de reserva.');

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
