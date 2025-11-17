# Quick Start Guide

Get the Arivah Finance Manager up and running in 10 minutes.

## Prerequisites

- Node.js 18 or higher ([Download here](https://nodejs.org))
- A Supabase account (sign up at [supabase.com](https://supabase.com) - it's free!)

## Step 1: Create a Supabase Project (3 minutes)

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: Arivah Finance
   - **Database Password**: (create a strong password and save it)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for the database to provision

## Step 2: Set Up the Database (2 minutes)

1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase/schema.sql` from this project
4. Copy ALL the SQL code
5. Paste it into the Supabase SQL Editor
6. Click **"Run"** (bottom right)
7. You should see "Success. No rows returned" - this is good!

## Step 3: Get Your Supabase Credentials (1 minute)

1. In Supabase, click **Settings** (⚙️ icon) in the left sidebar
2. Click **API**
3. You'll see two important values - keep this tab open:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 4: Install the Application (2 minutes)

1. Open a terminal/command prompt
2. Navigate to the project folder:
   ```bash
   cd "D:/Arivah/finance maneger"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   (This will take 1-2 minutes)

## Step 5: Configure Environment Variables (1 minute)

1. In the project folder, find `.env.local.example`
2. Make a copy and name it `.env.local`
3. Open `.env.local` in a text editor
4. Replace the values with your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_APP_NAME=Arivah Finance Manager
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. Save the file

## Step 6: Start the App (1 minute)

In your terminal, run:

```bash
npm run dev
```

You should see:
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

## Step 7: Create Your Account

1. Open your browser and go to: **http://localhost:3000**
2. You'll be redirected to the login page
3. Click **"Sign up"**
4. Fill in:
   - **Full Name**: Your name
   - **Email**: Your email
   - **Password**: At least 6 characters
5. Click **"Sign Up"**
6. You're in! 🎉

## Step 8: Take a Tour

### Add Your First Transaction

1. Click **"Arivah Web Dev"** in the sidebar
2. Click **"Add Transaction"** (blue button)
3. Fill in:
   - **Date**: Today's date
   - **Type**: Revenue
   - **Category**: Client Payment
   - **Amount**: 50000
   - **Description**: Sample project payment
4. Click **"Create"**

### View the Dashboard

1. Click **"Dashboard"** in the sidebar
2. You'll see your transaction reflected in the metrics
3. The chart will show your first data point!

### Create a Transfer

1. Click **"Transfers"** in the sidebar
2. Click **"Create Transfer"**
3. Fill in:
   - **From**: Arivah Web Dev
   - **To**: Arivah Jewels
   - **Amount**: 25000
   - **Purpose**: Reinvestment from Web Dev profit to Jewels
4. Click **"Create Transfer"**

### Calculate Partner Share

1. Click **"Partner Share"** in the sidebar
2. Select:
   - **Business**: Arivah Web Dev
   - **From/To Date**: This month
3. Click **"Calculate"**
4. You'll see the profit split between partners (50/50 by default)

### Customize Settings

1. Click **"Settings"** in the sidebar
2. Update partner names to match you and your partner's real names
3. Changes save automatically

## What's Next?

Now that you're set up, you can:

1. **Add Real Transactions**: Start logging your actual business transactions
2. **Customize Partner Info**: Update partner names and percentages in Settings
3. **Set Up Your Partner**: Have your partner create their own account
4. **Deploy to Production**: When ready, follow the [DEPLOYMENT.md](DEPLOYMENT.md) guide

## Common Issues

### "npm: command not found"
- You need to install Node.js first: [nodejs.org](https://nodejs.org)

### "Failed to load data"
- Check that you copied the Supabase URL and key correctly
- Make sure you ran the database schema SQL
- Verify `.env.local` file exists and has the right values

### "Module not found" errors
- Run `npm install` again
- Delete `node_modules` folder and run `npm install` again

### Port 3000 already in use
- Stop any other apps running on port 3000
- Or run on a different port: `npm run dev -- -p 3001`

## Tips for Success

1. **Log Transactions Regularly**: Make it a habit to log transactions daily
2. **Use Clear Categories**: Be consistent with category names (e.g., "Marketing", not "marketing" or "Mktg")
3. **Add Descriptions**: Future you will thank you for detailed notes
4. **Monthly Reviews**: Calculate partner shares at the end of each month
5. **Backup Your Data**: Keep your Supabase project safe (it has daily backups)

## Need Help?

- Review the full [README.md](README.md) for detailed documentation
- Check the [DEPLOYMENT.md](DEPLOYMENT.md) for going live
- Look at the code in `/lib/api/` to understand how data flows

---

Happy finance tracking! 💰
