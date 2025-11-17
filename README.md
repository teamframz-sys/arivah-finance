# Arivah Finance Manager

A comprehensive finance management web application built for managing two businesses under the Arivah umbrella: **Arivah Web Dev** (service-based) and **Arivah Jewels** (e-commerce).

## Features

- **Multi-Business Management**: Track finances for two separate businesses with consolidated views
- **Transaction Management**: Add, edit, and delete transactions with detailed categorization
- **Inter-Business Transfers**: Track profit reinvestment from Web Dev to Jewels
- **Partner Profit Sharing**: Calculate and record partner profit distributions based on equity
- **Real-time Metrics**: View revenue, expenses, profit, and cash balance for each business
- **Visual Analytics**: Charts showing revenue vs expenses trends and expense breakdowns
- **Secure Authentication**: Email/password authentication with password reset
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Deployment**: Vercel (recommended)

## Database Schema

The application uses the following main tables:

- `users` - User profiles linked to Supabase auth
- `businesses` - Business entities (Arivah Web Dev, Arivah Jewels)
- `partners` - Business partners with equity percentages
- `business_partners` - Junction table for business-partner relationships
- `transactions` - All financial transactions
- `inter_business_transfers` - Transfers between businesses
- `profit_sharing_logs` - Record of profit distributions

See [supabase/schema.sql](supabase/schema.sql) for the complete schema.

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- Git

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
cd "D:/Arivah/finance maneger"
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Go to **Settings** > **API** and copy:
   - Project URL
   - Anon/Public API Key

### 3. Run Database Migrations

1. In your Supabase project dashboard, go to **SQL Editor**
2. Create a new query
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and run the SQL

This will create all tables, indexes, RLS policies, and seed the default businesses and partners.

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_NAME=Arivah Finance Manager
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your First Account

1. Navigate to `/auth/signup`
2. Create an account with your email and password
3. You'll be automatically logged in and redirected to the dashboard

## Deployment to Vercel

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure environment variables:
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Add `NEXT_PUBLIC_APP_URL` (your Vercel domain)
5. Click **Deploy**

Your app will be live at `https://your-project.vercel.app`

### 3. Update Supabase Auth Settings

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **URL Configuration**
3. Add your Vercel URL to **Site URL** and **Redirect URLs**:
   - Site URL: `https://your-project.vercel.app`
   - Redirect URLs: `https://your-project.vercel.app/**`

## Application Structure

```
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── dashboard/        # Main dashboard
│   │   ├── business/         # Business-specific pages
│   │   │   ├── web-dev/
│   │   │   └── jewels/
│   │   ├── transfers/        # Inter-business transfers
│   │   ├── partner-share/    # Partner profit sharing
│   │   └── settings/         # App settings
│   ├── auth/                 # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout
├── components/               # Reusable React components
│   ├── Navigation.tsx
│   ├── TransactionModal.tsx
│   ├── TransactionTable.tsx
│   ├── BusinessFinancePage.tsx
│   ├── RevenueExpenseChart.tsx
│   └── CategoryExpenseChart.tsx
├── lib/
│   ├── api/                  # API functions
│   │   ├── businesses.ts
│   │   ├── transactions.ts
│   │   ├── transfers.ts
│   │   ├── partners.ts
│   │   └── metrics.ts
│   ├── supabase/             # Supabase clients
│   │   ├── client.ts
│   │   └── server.ts
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Utility functions
├── supabase/
│   └── schema.sql            # Database schema
├── public/                   # Static assets
├── .env.local.example        # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Key Concepts

### Inter-Business Transfers

When you create a transfer from Arivah Web Dev to Arivah Jewels:

1. A record is created in `inter_business_transfers` table
2. A "transfer_out" transaction is created for Web Dev (negative)
3. A "transfer_in" transaction is created for Jewels (positive)
4. Both businesses' metrics are updated automatically

This ensures proper tracking of profit reinvestment from the service business to the e-commerce business.

### Net Profit Calculation

For a given period, net profit is calculated as:

```
Net Profit = Total Revenue - Total Expenses
```

Where:
- **Revenue** includes: revenue, transfer_in, capital_injection
- **Expenses** include: expense, tax, partner_payout, transfer_out

### Partner Profit Split

Partner profit sharing is calculated based on:

1. Select a business and date range
2. Calculate total profit for that period
3. For each partner:
   ```
   Partner Share = Total Profit × (Partner Equity % / 100)
   ```
4. Optionally record how the share was distributed:
   - Cash payout to partner
   - Reinvested to other business
   - Or a combination

### Cash Balance

Cash balance represents the cumulative net position of a business (all-time):

```
Cash Balance = Sum of all (Revenue + Capital + Transfers In) - (Expenses + Payouts + Transfers Out)
```

## Usage Guide

### Adding a Transaction

1. Navigate to the specific business page (Web Dev or Jewels)
2. Click **"Add Transaction"**
3. Fill in the form:
   - **Date**: Transaction date
   - **Type**: Revenue, Expense, etc.
   - **Category**: e.g., "Client Payment", "Marketing", "Inventory"
   - **Amount**: Transaction amount in INR
   - **Payment Method**: (Optional) How payment was made
   - **Description**: (Optional) Additional notes
4. Click **"Create"**

### Creating an Inter-Business Transfer

1. Navigate to **Transfers** page
2. Click **"Create Transfer"**
3. Select:
   - **From Business**: Usually "Arivah Web Dev"
   - **To Business**: Usually "Arivah Jewels"
   - **Amount**: Amount to transfer
   - **Date**: Transfer date
   - **Purpose**: Reason for transfer
4. Click **"Create Transfer"**

This will create corresponding transactions in both businesses automatically.

### Calculating Partner Shares

1. Navigate to **Partner Share** page
2. Select:
   - **Business**: Which business to calculate for
   - **From Date**: Start of period
   - **To Date**: End of period
3. Click **"Calculate"**
4. Review the profit split
5. Click **"Record Settlement"** to log the distribution
6. Enter how much was paid out vs reinvested
7. Save

### Customizing Business Names

1. Navigate to **Settings** page
2. Under **Businesses**, edit the business name
3. The change is saved automatically when you click outside the field

### Managing Partners

1. Navigate to **Settings** page
2. Under **Partners**, you can:
   - Update partner names
   - Add email addresses
   - Adjust equity percentages
3. Changes are saved automatically

## Security

- **Row Level Security (RLS)**: All database tables use Supabase RLS
- **Authentication Required**: All routes except auth pages require login
- **Secure Sessions**: Sessions managed by Supabase Auth
- **HTTPS Only**: In production, always use HTTPS

Since this is a private app for 2 partners only, RLS is configured to allow all authenticated users full access to all data.

## Troubleshooting

### "Failed to load data" error

- Check that your `.env.local` file has correct Supabase credentials
- Verify that the database schema has been run in Supabase
- Check browser console for specific error messages

### Charts not showing

- Ensure you have transactions in the database
- Charts require at least one transaction to display
- Check that the transaction dates are within the last 12 months

### Can't login after signup

- Check your email for a verification link (if email confirmation is enabled in Supabase)
- In Supabase dashboard, go to **Authentication** > **Settings** and disable "Enable email confirmations" for easier testing

### Deployment issues on Vercel

- Verify all environment variables are set correctly
- Check the build logs in Vercel dashboard
- Ensure your Supabase project allows connections from Vercel's IP ranges

## Future Enhancements

Potential features to add:

- [ ] Multi-currency support
- [ ] Recurring transactions
- [ ] Budget planning and alerts
- [ ] Export data to CSV/Excel
- [ ] Invoice generation
- [ ] Receipt uploads and attachments
- [ ] Tax reports and summaries
- [ ] Mobile app (React Native)
- [ ] Multi-user roles (viewer, editor, admin)
- [ ] Audit logs for all changes

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the database schema in `supabase/schema.sql`
3. Check Supabase logs in your project dashboard
4. Review Next.js documentation at [nextjs.org](https://nextjs.org)

## License

Private application for Arivah businesses. All rights reserved.

---

Built with ❤️ for Arivah Web Dev and Arivah Jewels
#   a r i v a h - f i n a n c e  
 