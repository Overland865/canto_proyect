-- ============================================
-- ESQUEMA DEFINITIVO: LOCALSPACE (WEB & MOBILE)
-- Fuente de Verdad: MANUAL_MAESTRO_WEB.md
-- ============================================

-- 1. TABLA PROFILES (Base)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role text check (role in ('guest', 'consumer', 'provider', 'admin')) default 'guest',
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TABLA PROVIDER_PROFILES (Extensión)
create table if not exists public.provider_profiles (
  id uuid references public.profiles(id) on delete cascade primary key,
  business_name text not null,
  contact_phone text,
  categories text[], -- Array de categorías
  status text check (status in ('pending', 'approved', 'rejected', 'disabled')) default 'pending',
  description text,
  logo_url text,
  social_media jsonb default '{}'::jsonb,
  views integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TABLA SERVICES
create table if not exists public.services (
  id bigint generated always as identity primary key,
  provider_id uuid references public.provider_profiles(id) on delete cascade not null,
  title text not null,
  description text,
  price numeric not null check (price >= 0),
  category text not null,
  image_url text,
  gallery text[],
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABLA BOOKINGS
create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  provider_id uuid references public.provider_profiles(id) on delete cascade not null,
  service_id bigint references public.services(id) on delete cascade not null,
  date timestamp with time zone not null,
  status text check (status in ('pending', 'confirmed', 'cancelled', 'completed')) default 'pending',
  total_price numeric not null check (total_price >= 0),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TABLA PROVIDER_AVAILABILITY
create table if not exists public.provider_availability (
  id bigint generated always as identity primary key,
  provider_id uuid references public.provider_profiles(id) on delete cascade not null,
  date date not null,
  status text check (status in ('blocked', 'available')) default 'blocked',
  constraint unique_provider_date unique (provider_id, date)
);

-- 6. TABLA NOTIFICATIONS
create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null, -- 'booking_request', 'booking_confirmed', etc.
  title text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS) - BÁSICAS
-- ============================================

alter table public.profiles enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.provider_availability enable row level security;
alter table public.notifications enable row level security;

-- PROFILES
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- PROVIDER_PROFILES
create policy "Public provider profiles are viewable by everyone" on public.provider_profiles for select using (true);
create policy "Providers can update own profile" on public.provider_profiles for update using (auth.uid() = id);

-- SERVICES
create policy "Services are viewable by everyone" on public.services for select using (true);
create policy "Providers can manage own services" on public.services for all using (auth.uid() = provider_id);

-- BOOKINGS
create policy "Users can view own bookings" on public.bookings for select using (auth.uid() = user_id);
create policy "Providers can view bookings for them" on public.bookings for select using (auth.uid() = provider_id);
create policy "Users can create bookings" on public.bookings for insert with check (auth.uid() = user_id);
create policy "Providers can limit bookings" on public.bookings for update using (auth.uid() = provider_id);

-- NOTIFICATIONS
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);

-- ============================================
-- FUNCIONES RPC (BACKEND LOGIC)
-- ============================================

-- 1. Create Booking (Transaction)
convert 'create function' to 'create or replace function'
create or replace function create_booking(
  p_provider_id uuid,
  p_service_id bigint,
  p_date timestamp with time zone,
  p_total_price numeric,
  p_notes text
) returns bigint as $$
declare
  v_booking_id bigint;
begin
  -- Insert Booking
  insert into public.bookings (user_id, provider_id, service_id, date, total_price, notes, status)
  values (auth.uid(), p_provider_id, p_service_id, p_date, p_total_price, p_notes, 'pending')
  returning id into v_booking_id;

  -- Insert Notification for Provider
  insert into public.notifications (user_id, type, title, message)
  values (p_provider_id, 'booking_request', 'Nueva Solicitud', 'Tienes una nueva solicitud de reserva.');

  return v_booking_id;
end;
$$ language plpgsql security definer;

-- 2. Check Availability (Optional Helper)
create or replace function check_availability(
  p_provider_id uuid,
  p_date date
) returns boolean as $$
begin
  if exists (
    select 1 from public.provider_availability 
    where provider_id = p_provider_id and date = p_date and status = 'blocked'
  ) then
    return false;
  else
    return true;
  end if;
end;
$$ language plpgsql security definer;
