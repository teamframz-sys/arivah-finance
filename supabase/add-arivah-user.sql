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

-- Step 1: Drop the foreign key constraint
-- We remove this constraint to allow system users that don't have auth.users entries
-- Security is still maintained through RLS (Row Level Security) policies
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

-- Step 3: Create a trigger to enforce the constraint for non-system users
-- This allows Arivah to exist without auth.users entry, but validates other users
CREATE OR REPLACE FUNCTION check_user_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow the Arivah system user
  IF NEW.id = '00000000-0000-0000-0000-000000000001'::uuid THEN
    RETURN NEW;
  END IF;

  -- For all other users, check if they exist in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.id) THEN
    RAISE EXCEPTION 'User must exist in auth.users table';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and create new one
DROP TRIGGER IF EXISTS enforce_user_auth ON public.users;
CREATE TRIGGER enforce_user_auth
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION check_user_auth();

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
    RAISE NOTICE '📌 Trigger created to validate future user inserts';
  ELSE
    RAISE EXCEPTION '❌ ERROR: Arivah user was not created';
  END IF;
END $$;
