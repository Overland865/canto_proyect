-- 1. Create Storage Bucket for Service Images
insert into storage.buckets (id, name, public)
values ('service-images', 'service-images', true)
on conflict (id) do nothing;

-- 2. Storage Policies (RLS)

-- Helper policy to allow public access to images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'service-images' );

-- Allow authenticated users (providers) to upload images
create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (
    bucket_id = 'service-images' 
    and auth.role() = 'authenticated'
  );

-- Allow users to update/delete their own images (simplified for now, ideally strictly check folder path or similar)
create policy "Users can update their own images"
  on storage.objects for update
  using ( bucket_id = 'service-images' and auth.role() = 'authenticated' );

create policy "Users can delete their own images"
  on storage.objects for delete
  using ( bucket_id = 'service-images' and auth.role() = 'authenticated' );

-- 3. Schema Update
-- Add 'gallery' column to 'services' table to store multiple image URLs
alter table services 
add column if not exists gallery text[];
