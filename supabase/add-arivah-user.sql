-- Add "Arivah" as a system user for company-level personal expenses
-- This is a special user account that doesn't require authentication
-- Run this SQL in Supabase SQL Editor

-- Create a special UUID for the Arivah user (fixed UUID for consistency)
-- Using a deterministic UUID: 00000000-0000-0000-0000-000000000001

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

-- Verify the user was created
SELECT id, name, email FROM public.users WHERE name = 'Arivah';

COMMENT ON TABLE public.users IS 'User accounts - includes both authenticated users and system users like "Arivah"';
