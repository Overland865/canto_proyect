-- ============================================
-- TABLA REVIEWS (Reseñas y Calificaciones)
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Borrar tabla anterior si existe
drop table if exists public.reviews cascade;

-- Crear la tabla de reseñas
-- NOTA: booking_id es uuid porque bookings.id es uuid en tu BD
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null,
  service_id uuid references public.services(id) on delete cascade not null,
  client_id uuid references public.profiles(id) on delete cascade not null,
  provider_id uuid references public.provider_profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_review_per_booking unique (booking_id)
);

-- Habilitar RLS
alter table public.reviews enable row level security;

-- Políticas de seguridad
create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);

create policy "Clients can create reviews for their bookings"
  on public.reviews for insert
  with check (auth.uid() = client_id);

create policy "Clients can update their own reviews"
  on public.reviews for update
  using (auth.uid() = client_id);
