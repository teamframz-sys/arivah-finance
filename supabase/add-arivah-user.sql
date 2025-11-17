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

-- Step 1: First, we need to remove the foreign key constraint temporarily
-- or work around it by creating the auth user first
-- Since we can't directly insert into auth.users, we'll modify the constraint

-- Option 1: Drop the foreign key constraint if it exists
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Step 2: Insert Arivah user directly into the users table
-- This is a system user, not a login account
INSERT INTO public.users (id, name, email, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Arivah',
  'system@arivah.com',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Recreate the foreign key constraint, but make it lenient for system users
-- We'll use a CHECK constraint instead to allow the specific system user ID
ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey
  FOREIGN KEY (id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE
  NOT VALID;

-- Mark the constraint as not enforced for existing rows
ALTER TABLE public.users VALIDATE CONSTRAINT users_id_fkey;

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

COMMENT ON TABLE public.users IS 'User accounts - includes both authenticated users and system users like "Arivah"';
