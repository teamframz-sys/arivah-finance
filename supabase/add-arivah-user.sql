-- ============================================================================
-- ADD ARIVAH DEFAULT SYSTEM USER
-- ============================================================================
-- This script creates the "Arivah" system user which serves as the default
-- user for investments, personal expenses, and other company-level operations.
--
-- IMPORTANT: Run this script in your Supabase SQL Editor AFTER running schema.sql
--
-- The Arivah user uses a fixed UUID for consistency across environments:
-- ID: 00000000-0000-0000-0000-000000000001
-- ============================================================================

-- Step 1: Drop the foreign key constraint temporarily
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Step 2: Insert Arivah system user
INSERT INTO public.users (id, name, email, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Arivah',
  'system@arivah.com',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Add a new foreign key constraint that excludes the system user
-- This allows the Arivah user to exist without an auth.users entry
-- but requires all other users to have one
ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey
  CHECK (
    id = '00000000-0000-0000-0000-000000000001'::uuid OR
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = users.id)
  );

-- Verify the user was created successfully
SELECT
  id,
  name,
  email,
  created_at
FROM public.users
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Expected output:
-- id: 00000000-0000-0000-0000-000000000001
-- name: Arivah
-- email: system@arivah.com
-- created_at: (current timestamp)

-- Success message
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.users WHERE id = '00000000-0000-0000-0000-000000000001') THEN
    RAISE NOTICE '✅ SUCCESS: Arivah user created successfully!';
  ELSE
    RAISE EXCEPTION '❌ ERROR: Arivah user was not created';
  END IF;
END $$;
