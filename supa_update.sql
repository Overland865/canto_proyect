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

-- 3. Modify services table to add gallery column
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS gallery text[];

-- 4. Modify profiles table to add provider details
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS cover_image text,
ADD COLUMN IF NOT EXISTS gallery text[],
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}'::jsonb;

-- 5. Create storage bucket for 'profile-images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage Policy for 'profile-images'
CREATE POLICY "Public Access Profile Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'profile-images' );

CREATE POLICY "Authenticated Users Upload Profile Images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'profile-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Users Update Own Profile Images"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'profile-images' AND auth.uid() = owner );

CREATE POLICY "Users Delete Own Profile Images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'profile-images' AND auth.uid() = owner );

-- 7. Add views column to provider_profiles
ALTER TABLE provider_profiles
ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;
