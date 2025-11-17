# Arivah Finance Manager - Setup Guide

## Quick Setup Steps

### 1. Database Setup (Run in Supabase SQL Editor)

Execute these SQL scripts **in order**:

#### Step 1: Main Schema
```sql
-- Copy and run: supabase/schema.sql
```
This creates all base tables, indexes, RLS policies, and seeds default businesses/partners.

#### Step 2: Add Arivah System User ⭐ **IMPORTANT**
```sql
-- Copy and run: supabase/add-arivah-user.sql
```
This creates the default "Arivah" user (ID: `00000000-0000-0000-0000-000000000001`) which is used as the default user for:
- Investments
- Personal Expenses
- Company-level operations

**Why this is important:** The application expects this user to exist. Without it, you'll see errors when creating investments or personal expenses.

#### Step 3: Personal Expenses Feature
```sql
-- Copy and run: supabase/personal-expenses.sql
```
Adds the personal expenses tracking feature.

#### Step 4: Investments Feature
```sql
-- Copy and run: supabase/investments.sql
```
Adds investment tracking and settlement features.

#### Step 5: Additional Features
```sql
-- Copy and run: supabase/new-features.sql
```
Adds activity logging and other enhancements.

---

## Verification

After running all scripts, verify the setup:

### Check Arivah User
```sql
SELECT id, name, email FROM public.users WHERE name = 'Arivah';
```
**Expected:** One row with ID `00000000-0000-0000-0000-000000000001`

### Check Tables
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```
**Expected tables:**
- users
- businesses
- partners
- business_partners
- transactions
- inter_business_transfers
- profit_sharing_logs
- tasks
- activity_logs
- personal_expenses
- investments
- investment_settlements

### Check Businesses
```sql
SELECT id, name, type FROM public.businesses;
```
**Expected:** Two businesses (Arivah Web Dev, Arivah Jewels)

---

## Environment Variables

Create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_NAME=Arivah Finance Manager
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## First Login

1. Run `npm run dev`
2. Navigate to `/auth/signup`
3. Create your admin account
4. Start using the application!

---

## Troubleshooting

### "User not found" errors when creating investments
**Solution:** Run `supabase/add-arivah-user.sql`

### Tables don't exist
**Solution:** Run `supabase/schema.sql` first

### RLS policy errors
**Solution:** Make sure you're logged in and RLS policies are enabled in Supabase

---

## What is the Arivah User?

The "Arivah" user is a **system user** (not a login account) that represents the company itself. It's used for:

- **Default User**: When creating investments or personal expenses, "Arivah" is pre-selected
- **Company Operations**: Expenses and investments that belong to the company rather than individual users
- **Consistency**: Using a fixed UUID ensures the same behavior across all environments

Think of it as the "house account" for the business.
