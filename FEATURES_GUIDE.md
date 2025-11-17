# Features Guide

Complete guide to all features in the Arivah Finance Manager.

## Table of Contents

1. [Dashboard](#dashboard)
2. [Business Finance Pages](#business-finance-pages)
3. [Transaction Management](#transaction-management)
4. [Inter-Business Transfers](#inter-business-transfers)
5. [Partner Profit Sharing](#partner-profit-sharing)
6. [Settings](#settings)
7. [Tips & Best Practices](#tips--best-practices)

---

## Dashboard

**Access**: Click "Dashboard" in the sidebar or navigate to `/dashboard`

### What You'll See

The dashboard provides a high-level overview of both businesses:

#### 1. Consolidated Overview Card
- **Total Revenue**: Combined revenue from both businesses
- **Total Expenses**: Combined expenses from both businesses
- **Net Profit**: Combined profit (can be negative)
- **Transfers**: Money moved from Web Dev → Jewels

#### 2. Business Cards

**Arivah Web Dev Card**:
- Revenue for selected period
- Expenses for selected period
- Net Profit
- Amount transferred to Jewels
- Cash Balance (all-time)

**Arivah Jewels Card**:
- Revenue for selected period
- Expenses for selected period
- Net Profit
- Funds received from Web Dev
- Cash Balance (all-time)

#### 3. Date Range Filter
- Select start and end dates
- Default: Current month
- All metrics update based on selected range

#### 4. Quick Actions
- "Add Web Dev Transaction"
- "Add Jewels Transaction"
- "Create Transfer"

### Use Cases

**Scenario 1: Monthly Review**
1. Set date range to last month
2. Review combined net profit
3. Check how much was transferred to Jewels
4. Compare both businesses' performance

**Scenario 2: Current Status**
1. Keep default (current month)
2. View today's cash balances
3. See month-to-date profit

---

## Business Finance Pages

**Access**: Click "Arivah Web Dev" or "Arivah Jewels" in the sidebar

### What You'll See

Each business has its own dedicated finance page with:

#### 1. Metrics Cards (Top Row)
- **Revenue**: Green color, upward arrow icon
- **Expenses**: Red color, downward arrow icon
- **Net Profit**: Green if positive, red if negative
- **Cash Balance**: All-time balance

#### 2. Charts

**Revenue vs Expenses Chart**:
- Line chart showing last 12 months
- Green line = Revenue
- Red line = Expenses
- Blue line = Profit (Revenue - Expenses)

**Top Expense Categories Chart**:
- Horizontal bar chart
- Shows top 10 expense categories
- Helps identify where money is going

#### 3. Filters
- **From Date / To Date**: Filter transactions by date range
- **Type**: Filter by transaction type (revenue, expense, etc.)
- **Category**: Filter by category

#### 4. Transactions Table
- Shows all transactions matching filters
- Columns: Date, Type, Category, Description, Amount
- Actions: Edit (pencil icon), Delete (trash icon)

### Use Cases

**Scenario 1: Review Monthly Expenses**
1. Navigate to business page
2. Set date range to last month
3. Filter by "Expense" type
4. Look at expense category chart
5. Identify top spending areas

**Scenario 2: Find a Specific Transaction**
1. Set date range around when it occurred
2. Select category from dropdown
3. Look through filtered table
4. Edit if needed

**Scenario 3: Analyze Trends**
1. Scroll to charts section
2. Review revenue vs expenses chart
3. Look for patterns (e.g., seasonal variations)
4. Plan accordingly

---

## Transaction Management

### Adding a Transaction

#### Method 1: From Business Page
1. Navigate to the business (Web Dev or Jewels)
2. Click "Add Transaction" button
3. Fill in the form (see fields below)
4. Click "Create"

#### Method 2: From Dashboard
1. On dashboard, click a quick action button
2. Automatically opens with business pre-selected
3. Fill in form
4. Click "Create"

### Transaction Form Fields

**Required Fields:**
- **Date**: When the transaction occurred (defaults to today)
- **Type**: Select from dropdown
  - `Revenue` - Money received
  - `Expense` - Money spent
  - `Partner Payout` - Distribution to partners
  - `Capital Injection` - Money added to business
  - `Tax` - Tax payments
  - `Other` - Anything else
- **Category**: Free text (e.g., "Client Payment", "Marketing", "Inventory")
- **Amount**: Transaction amount in INR

**Optional Fields:**
- **Payment Method**: How it was paid (Cash, UPI, Bank Transfer, etc.)
- **Description**: Additional notes

### Tips for Categories

**For Arivah Web Dev (Service)**:
- Revenue categories: "Client Payment", "Consulting Fee", "Project Payment"
- Expense categories: "Software", "Marketing", "Tools", "Office", "Taxes"

**For Arivah Jewels (E-commerce)**:
- Revenue categories: "Product Sale", "Wholesale Order"
- Expense categories: "Inventory Purchase", "Raw Materials", "Packaging", "Shipping", "Ads", "Platform Fees"

### Editing a Transaction

1. Find the transaction in the table
2. Click the edit icon (pencil)
3. Modal opens with pre-filled data
4. Update any fields
5. Click "Update"

### Deleting a Transaction

1. Find the transaction in the table
2. Click the delete icon (trash)
3. Confirm the deletion
4. Transaction is permanently removed

**Warning**: Deletions cannot be undone!

---

## Inter-Business Transfers

**Purpose**: Track profit reinvestment from Arivah Web Dev to Arivah Jewels

**Access**: Click "Transfers" in the sidebar

### What Happens When You Create a Transfer

When you transfer ₹25,000 from Web Dev to Jewels:

1. **Transfer Record Created**: Entry in `inter_business_transfers` table
2. **Web Dev Gets**: "Transfer Out" transaction for -₹25,000
3. **Jewels Gets**: "Transfer In" transaction for +₹25,000
4. **Result**:
   - Web Dev cash balance: -₹25,000
   - Jewels cash balance: +₹25,000
   - Net effect: Money moved between businesses

### Creating a Transfer

1. Navigate to "Transfers" page
2. Click "Create Transfer"
3. Fill in form:
   - **From Business**: Usually "Arivah Web Dev"
   - **To Business**: Usually "Arivah Jewels"
   - **Amount**: Amount to transfer
   - **Date**: Transfer date (default: today)
   - **Purpose**: Reason (default: "Reinvestment from Web Dev profit to Jewels")
4. Click "Create Transfer"

### Viewing Transfer History

The transfers page shows:
- All transfers with dates
- From/to businesses with visual arrow
- Amount (shown as -/+ for each business)
- Purpose of each transfer

### Use Cases

**Scenario 1: Monthly Profit Reinvestment**

Web Dev had a good month with ₹1,00,000 profit. You want to reinvest ₹50,000 into Jewels:

1. Go to Transfers page
2. Create transfer for ₹50,000
3. Purpose: "Profit reinvestment for inventory purchase"
4. Both businesses' balances update instantly

**Scenario 2: Capital Allocation**

Jewels needs funds for a big inventory order:

1. Calculate how much is needed
2. Check Web Dev's cash balance
3. Create transfer for that amount
4. Purpose: "Capital for Q4 inventory"

---

## Partner Profit Sharing

**Purpose**: Calculate and record how profit is distributed between partners

**Access**: Click "Partner Share" in the sidebar

### How It Works

The system calculates each partner's share based on:
1. Total profit for selected period
2. Each partner's equity percentage (default: 50% each)

Formula: `Partner Share = Total Profit × (Equity % / 100)`

### Calculating Shares

1. Navigate to "Partner Share" page
2. Select:
   - **Business**: Which business (Web Dev or Jewels)
   - **From Date**: Start of period (e.g., first day of month)
   - **To Date**: End of period (e.g., last day of month)
3. Click "Calculate"

You'll see:
- Total profit for the period
- Each partner's name
- Each partner's equity percentage
- Each partner's calculated share

### Recording a Settlement

After calculating, you can record how the profit was distributed:

1. Click "Record Settlement" on a partner's share
2. Enter:
   - **Cash Payout Amount**: Money paid to partner in cash
   - **Reinvested Amount**: Money kept in business
   - **Note**: Any additional notes
3. Click "Record Settlement"

This creates a permanent log for accounting purposes.

### Settlement History

The bottom of the page shows:
- All past settlements
- Period, business, partner
- Total profit, partner share
- How it was distributed (cash vs reinvested)

### Use Cases

**Scenario 1: Monthly Profit Distribution**

End of month, Web Dev made ₹2,00,000 profit:

1. Calculate shares for Web Dev (Jan 1 - Jan 31)
2. System shows:
   - Partner 1: ₹1,00,000 (50%)
   - Partner 2: ₹1,00,000 (50%)
3. Partner 1 clicks "Record Settlement":
   - Cash Payout: ₹50,000
   - Reinvested: ₹50,000
4. Partner 2 does the same
5. Now you have a record for tax purposes

**Scenario 2: Quarterly Review**

1. Set date range to Q1 (Jan 1 - Mar 31)
2. Calculate for both businesses
3. See which business was more profitable
4. Decide on distributions
5. Record settlements

---

## Settings

**Access**: Click "Settings" in the sidebar

### What You Can Configure

#### 1. Business Settings

For each business (Web Dev & Jewels):
- **Business Name**: Click to edit (default: Arivah Web Dev, Arivah Jewels)
- **Type**: Select Service or E-commerce

**Note**: Changing names affects all pages, but doesn't change historical data.

#### 2. Partner Settings

For each partner:
- **Partner Name**: Click to edit (default: Partner 1, Partner 2)
- **Email**: Optional email address
- **Equity Percentage**: Ownership percentage (default: 50%)

**Important**:
- Changes are auto-saved when you click outside the field
- Equity changes affect future profit calculations (not past ones)
- Names update throughout the app

#### 3. App Information

Read-only section showing:
- App name
- Version
- Purpose

### Use Cases

**Scenario 1: Initial Setup**

When first using the app:
1. Go to Settings
2. Update "Partner 1" to your actual name
3. Update "Partner 2" to your partner's name
4. Add email addresses
5. Verify equity percentages

**Scenario 2: Equity Adjustment**

If you decide to change equity split:
1. Go to Settings
2. Update equity percentages (e.g., 60% / 40%)
3. Future profit calculations will use new percentages
4. Past settlement logs remain unchanged

---

## Tips & Best Practices

### Transaction Entry

**Be Consistent with Categories**:
- ✅ Always use "Marketing" (not "Mktg", "marketing", "Advertisement")
- ✅ Create a category list and stick to it
- ✅ Use title case (Client Payment, not client payment)

**Add Descriptions**:
- ✅ "Google Ads campaign for Diwali sale"
- ❌ "Ads"

**Log Immediately**:
- Don't wait until end of month
- Log transactions as they happen
- Prevents forgetting or errors

### Transfers

**Document Purpose**:
- Be specific about why money is being transferred
- Include what it will be used for
- Helps with planning and tracking

**Regular Schedule**:
- Consider monthly transfers based on Web Dev profit
- Set a policy (e.g., "50% of profit goes to Jewels")
- Maintain consistency

### Partner Shares

**Monthly Calculation**:
- Calculate at month-end
- Record settlements promptly
- Keep notes for tax purposes

**Transparent Communication**:
- Both partners should review calculations
- Discuss distribution (cash vs reinvestment)
- Document decisions

### Data Organization

**Use Date Filters**:
- Review specific periods (monthly, quarterly)
- Compare year-over-year
- Identify seasonal trends

**Regular Reviews**:
- Weekly: Quick dashboard check
- Monthly: Full review with calculations
- Quarterly: Deep dive into charts and trends

### Backup & Security

**Regular Checks**:
- Supabase automatically backs up daily
- Occasionally download data as CSV (future feature)
- Keep environment variables secure

**Access Control**:
- Don't share login credentials
- Each partner has their own account
- Use strong passwords

### Chart Analysis

**Revenue vs Expenses Chart**:
- Look for growing gap (profit increasing)
- Identify months with losses
- Plan for lean months

**Category Chart**:
- Identify top expense areas
- Look for optimization opportunities
- Compare month-over-month

---

## Keyboard Shortcuts

While no specific keyboard shortcuts are implemented, you can use browser defaults:

- `Ctrl + R` / `Cmd + R`: Refresh page
- `Ctrl + W` / `Cmd + W`: Close tab
- `F5`: Reload
- `Esc`: Close modals

---

## Mobile Usage Tips

### Navigation
- Tap hamburger menu (☰) to open sidebar
- Swipe to close menu

### Tables
- Scroll horizontally to see all columns
- Tap row to select before editing

### Forms
- Form fields auto-focus on mobile
- Use device keyboard for easy entry
- Date picker optimized for mobile

---

## Common Workflows

### Workflow 1: Log a Client Payment (Web Dev)

1. Navigate to "Arivah Web Dev"
2. Click "Add Transaction"
3. Fill in:
   - Type: Revenue
   - Category: Client Payment
   - Amount: 75000
   - Description: "Logo design for ABC Corp"
4. Click "Create"
5. See it reflected in dashboard immediately

### Workflow 2: Log an Inventory Purchase (Jewels)

1. Navigate to "Arivah Jewels"
2. Click "Add Transaction"
3. Fill in:
   - Type: Expense
   - Category: Inventory Purchase
   - Amount: 30000
   - Description: "Gold chains - 50g"
4. Click "Create"

### Workflow 3: Month-End Profit Distribution

1. Navigate to "Partner Share"
2. Select "Arivah Web Dev"
3. Set dates to last month
4. Click "Calculate"
5. Review profit split
6. For each partner, click "Record Settlement"
7. Enter distribution details
8. Repeat for "Arivah Jewels"

### Workflow 4: Transfer Profit to Jewels

1. Navigate to "Transfers"
2. Click "Create Transfer"
3. From: Arivah Web Dev
4. To: Arivah Jewels
5. Amount: 50000
6. Purpose: "Monthly reinvestment for inventory"
7. Click "Create Transfer"
8. Check both business pages to verify

---

## Troubleshooting Common Issues

### "Transaction not showing up"
- Check date filters - expand date range
- Check type/category filters - reset to "All"
- Refresh the page

### "Can't delete transaction"
- Check if you have permissions
- Try refreshing and deleting again
- Check for related transfer records

### "Charts not displaying"
- Ensure you have transactions in the database
- Charts need at least one transaction to show
- Check that dates are within last 12 months

### "Cash balance seems wrong"
- Remember it's all-time balance, not filtered
- Check for missing transactions
- Verify transfer transactions were created properly

---

## Feature Requests & Future Enhancements

While not currently implemented, these features are planned for future versions:

- Export data to Excel/CSV
- Recurring transactions
- Budget planning
- Receipt uploads
- Invoice generation
- Tax calculation helpers
- Multiple currencies
- Mobile app

---

**Need more help?** Check the [README.md](README.md) or [INSTALLATION.md](INSTALLATION.md)

Happy tracking! 💰
