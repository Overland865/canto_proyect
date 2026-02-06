
-- Services Table
create table services (
  id uuid default gen_random_uuid() primary key,
  provider_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text,
  price numeric,
  unit text, -- e.g., 'pp', 'por evento'
  image text,
  location text,
  verified boolean default false,
  rating numeric default 0,
  reviews_count integer default 0,
  created_at timestamp with time zone default now()
);

alter table services enable row level security;

create policy "Services are viewable by everyone." on services
  for select using (true);

create policy "Providers can insert their own services." on services
  for insert with check (auth.uid() = provider_id);

create policy "Providers can update their own services." on services
  for update using (auth.uid() = provider_id);

create policy "Providers can delete their own services." on services
  for delete using (auth.uid() = provider_id);


-- Bookings Table
create table bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  user_id uuid references profiles(id) on delete cascade not null,
  provider_id uuid references profiles(id) on delete cascade not null,
  service_id uuid references services(id) on delete cascade not null,
  date date not null, -- Storing as date for calendar
  time text not null, -- Keeping as text for ranges like "14:00 - 22:00"
  guests integer,
  specifications text,
  status text check (status in ('pending', 'confirmed', 'rejected', 'rescheduled', 'completed')) default 'pending',
  proposed_date date,      -- For rescheduling: The new date proposed by provider
  proposed_time text,      -- For rescheduling: The new time proposed
  price numeric            -- Snapshot of price at booking time
);

alter table bookings enable row level security;

-- Users can view their own bookings
create policy "Users can view their own bookings." on bookings
  for select using (auth.uid() = user_id);

-- Providers can view bookings for their services
create policy "Providers can view bookings assigned to them." on bookings
  for select using (auth.uid() = provider_id);

-- Users can create bookings
create policy "Users can create bookings." on bookings
  for insert with check (auth.uid() = user_id);

-- Providers can update bookings (Accept, Reject, Reschedule)
create policy "Providers can update bookings." on bookings
  for update using (auth.uid() = provider_id);

-- Users can update bookings (e.g. Accept Reschedule)
create policy "Users can update their bookings." on bookings
  for update using (auth.uid() = user_id);


-- Notifications Table (Simple)
create table notifications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  user_id uuid references profiles(id) on delete cascade, -- Receiver
  title text not null,
  message text not null,
  read boolean default false,
  booking_id uuid references bookings(id) on delete set null,
  type text -- 'booking_request', 'booking_accepted', 'booking_rescheduled', etc.
);

alter table notifications enable row level security;

create policy "Users view own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "System/functions insert notifications" on notifications
  for insert with check (true);
