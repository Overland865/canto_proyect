-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  email text,
  full_name text,
  business_name text,
  role text check (role in ('consumer', 'provider')),
  is_verified boolean default false,

  constraint username_length check (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can check their own profile." on profiles
  for select using (auth.uid() = id);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup (Optional - if we want auto-creation, 
-- but we might handle it manually in the register form to include business_name etc. 
-- For this implementation, we will handle insertion manually in the register page code 
-- for more control, or use this trigger if we pass metadata correctly).
-- For now, let's keep it manual in the code to ensure we capture all fields correctly 
-- before the user is "fully" signed up, or use metadata. 
-- Actually, using metadata is cleaner. Let's rely on metadata passed to signUp.

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
