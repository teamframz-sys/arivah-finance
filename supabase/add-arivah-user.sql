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

-- Insert Arivah user directly into the users table
-- Note: This bypasses auth.users since it's a system user, not a login account
INSERT INTO public.users (id, name, email, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Arivah',
  'system@arivah.com',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

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
