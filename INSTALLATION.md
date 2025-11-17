# Installation Instructions

Complete step-by-step guide to install and run the Arivah Finance Manager.

## System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (comes with Node.js)
- **RAM**: Minimum 4GB
- **Disk Space**: 500MB free space
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## Check Prerequisites

Open a terminal/command prompt and run:

```bash
node --version
# Should show v18.0.0 or higher

npm --version
# Should show 9.0.0 or higher
```

If not installed, download from [nodejs.org](https://nodejs.org)

## Installation Steps

### 1. Navigate to Project Directory

```bash
cd "D:/Arivah/finance maneger"
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages (may take 2-3 minutes):
- Next.js
- React
- Supabase client
- Tailwind CSS
- Recharts
- TypeScript
- And all their dependencies

**Troubleshooting:**
- If you get permission errors on Windows, run Command Prompt as Administrator
- If you get network errors, check your internet connection
- If installation fails, delete `node_modules` folder and try again

### 3. Set Up Supabase Project

#### 3.1 Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email

#### 3.2 Create New Project

1. Click "New Project"
2. Choose your organization (create one if needed)
3. Fill in project details:
   - **Name**: arivah-finance (or any name)
   - **Database Password**: Create a strong password (save it somewhere safe!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is perfect
4. Click "Create new project"
5. Wait 2-3 minutes for setup

#### 3.3 Run Database Schema

1. In Supabase dashboard, click "SQL Editor" (left sidebar)
2. Click "+ New query"
3. Open the file `supabase/schema.sql` from this project
4. Copy ALL the contents (Ctrl+A, Ctrl+C)
5. Paste into the Supabase SQL editor (Ctrl+V)
6. Click "Run" button (bottom right)
7. You should see "Success. No rows returned"

This creates all tables, indexes, security policies, and seeds initial data.

#### 3.4 Get Your API Credentials

1. In Supabase, click Settings (⚙️ icon)
2. Click "API" in the left menu
3. Find and copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

Keep this tab open for the next step.

### 4. Configure Environment Variables

#### 4.1 Create .env.local File

In the project root directory (`D:/Arivah/finance maneger`):

1. Find the file `.env.local.example`
2. Copy it and rename the copy to `.env.local`
3. Open `.env.local` in a text editor (Notepad, VS Code, etc.)

#### 4.2 Add Your Credentials

Replace the placeholder values with your actual Supabase credentials:

```env
# Replace with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# These can stay as-is for local development
NEXT_PUBLIC_APP_NAME=Arivah Finance Manager
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:**
- Don't include quotes around the values
- Don't commit this file to git (it's in .gitignore)
- Don't share these credentials publicly

#### 4.3 Save the File

Save `.env.local` - the app will read these values on startup.

### 5. Start the Development Server

In your terminal, run:

```bash
npm run dev
```

You should see output like:

```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.3s
```

### 6. Access the Application

1. Open your web browser
2. Navigate to: `http://localhost:3000`
3. You should see the login page

### 7. Create Your First Account

1. Click "Sign up" link
2. Fill in:
   - **Full Name**: Your name
   - **Email**: Your email address
   - **Password**: At least 6 characters
   - **Confirm Password**: Same as above
3. Click "Sign Up"
4. You'll be automatically logged in

### 8. Verify Installation

Check that everything works:

1. ✅ You can see the dashboard
2. ✅ Dashboard shows "Arivah Web Dev" and "Arivah Jewels"
3. ✅ You can click on each business
4. ✅ You can click "Add Transaction"
5. ✅ Forms open and close properly

## Post-Installation Setup

### Customize Partner Information

1. Click "Settings" in the sidebar
2. Under "Partners", update:
   - Partner 1 name to your actual name
   - Partner 2 name to your partner's name
   - Add email addresses (optional)
3. Changes save automatically

### Add Sample Data (Optional)

To test the app with sample data:

1. Go to "Arivah Web Dev"
2. Add a revenue transaction:
   - Date: Today
   - Type: Revenue
   - Category: Client Payment
   - Amount: 50000
3. Go to Dashboard to see it reflected
4. Create a transfer to see how it works

### Invite Your Partner

1. Have your partner go to the login page
2. They click "Sign up"
3. They create their own account
4. Now both of you can access the same data

## Troubleshooting

### Port Already in Use

If port 3000 is taken:

```bash
npm run dev -- -p 3001
```

Then access at `http://localhost:3001`

### "Failed to load data" Error

**Cause**: Environment variables not set or Supabase not configured

**Solution**:
1. Check `.env.local` exists and has correct values
2. Verify Supabase URL and key are correct
3. Ensure database schema was run successfully
4. Try restarting the dev server (Ctrl+C, then `npm run dev`)

### "Module not found" Errors

**Cause**: Dependencies not installed or corrupted

**Solution**:
```bash
# Delete node_modules
rm -rf node_modules

# Delete package-lock.json
rm package-lock.json

# Reinstall
npm install
```

### Database Connection Issues

**Cause**: Supabase project not set up or credentials wrong

**Solution**:
1. Go to Supabase dashboard
2. Check project status (should be "Active")
3. Verify API credentials are correct
4. Try regenerating the anon key if needed

### TypeScript Errors on Start

**Cause**: TypeScript compilation issues

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Browser Shows Blank Page

**Cause**: JavaScript error or build issue

**Solution**:
1. Open browser dev tools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Report specific error messages

## Uninstallation

To completely remove the application:

```bash
# Stop the dev server (Ctrl+C)

# Remove node_modules
rm -rf node_modules

# Remove Next.js cache
rm -rf .next

# Optionally delete the entire project folder
```

To remove Supabase project:
1. Go to Supabase dashboard
2. Select your project
3. Settings > General
4. Scroll to "Danger Zone"
5. Click "Delete project"

## Next Steps

After successful installation:

1. Read [QUICKSTART.md](QUICKSTART.md) for a guided tour
2. Read [README.md](README.md) for full documentation
3. Start logging your real business transactions
4. When ready for production, follow [DEPLOYMENT.md](DEPLOYMENT.md)

## Getting Help

If you encounter issues:

1. Check this troubleshooting section
2. Review the error message carefully
3. Search for the error online
4. Check Supabase status page
5. Check Next.js documentation

## Success Checklist

- [ ] Node.js 18+ installed
- [ ] npm install completed successfully
- [ ] Supabase project created
- [ ] Database schema executed
- [ ] .env.local configured with correct credentials
- [ ] Dev server starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can sign up and login
- [ ] Can see dashboard
- [ ] Can add a transaction
- [ ] Partner names updated in settings

If all checkboxes are checked, you're ready to go! 🎉

---

**Need more help?** Review the [README.md](README.md) or check Supabase documentation.
