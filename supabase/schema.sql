-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('service', 'ecommerce')),
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partners table
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  equity_percentage DECIMAL(5,2) NOT NULL DEFAULT 50.00 CHECK (equity_percentage >= 0 AND equity_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business-Partner relationship table
CREATE TABLE IF NOT EXISTS public.business_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  equity_percentage DECIMAL(5,2) NOT NULL CHECK (equity_percentage >= 0 AND equity_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, partner_id)
);

-- Transaction types enum
CREATE TYPE transaction_type AS ENUM (
  'revenue',
  'expense',
  'transfer_out',
  'transfer_in',
  'partner_payout',
  'capital_injection',
  'tax',
  'other'
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type transaction_type NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method TEXT,
  description TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inter-business transfers table
CREATE TABLE IF NOT EXISTS public.inter_business_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  to_business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  purpose TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (from_business_id != to_business_id)
);

-- Profit sharing logs table
CREATE TABLE IF NOT EXISTS public.profit_sharing_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  total_profit DECIMAL(15,2) NOT NULL,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  partner_share_amount DECIMAL(15,2) NOT NULL,
  reinvested_to_other_business_amount DECIMAL(15,2) DEFAULT 0,
  cash_payout_amount DECIMAL(15,2) DEFAULT 0,
  note TEXT,
  is_settled BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (period_start_date <= period_end_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_business_id ON public.transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transfers_from_business ON public.inter_business_transfers(from_business_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to_business ON public.inter_business_transfers(to_business_id);
CREATE INDEX IF NOT EXISTS idx_transfers_date ON public.inter_business_transfers(date);
CREATE INDEX IF NOT EXISTS idx_profit_logs_business ON public.profit_sharing_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_profit_logs_partner ON public.profit_sharing_logs(partner_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inter_business_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_sharing_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (authenticated users can access all data - as there are only 2 admin users)
CREATE POLICY "Allow authenticated users full access to users"
  ON public.users FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to businesses"
  ON public.businesses FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to partners"
  ON public.partners FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to business_partners"
  ON public.business_partners FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to transactions"
  ON public.transactions FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to transfers"
  ON public.inter_business_transfers FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to profit_sharing_logs"
  ON public.profit_sharing_logs FOR ALL
  USING (auth.role() = 'authenticated');

-- Insert default businesses
INSERT INTO public.businesses (name, type, currency) VALUES
  ('Arivah Web Dev', 'service', 'INR'),
  ('Arivah Jewels', 'ecommerce', 'INR')
ON CONFLICT (name) DO NOTHING;

-- Insert default partners (will be updated later with actual names)
INSERT INTO public.partners (name, equity_percentage) VALUES
  ('Partner 1', 50.00),
  ('Partner 2', 50.00)
ON CONFLICT DO NOTHING;

-- Link partners to businesses
INSERT INTO public.business_partners (business_id, partner_id, equity_percentage)
SELECT
  b.id,
  p.id,
  50.00
FROM public.businesses b
CROSS JOIN public.partners p
ON CONFLICT (business_id, partner_id) DO NOTHING;
