-- Investments Table
-- Tracks capital investments made by users into businesses
-- Supports settlement through partner share mechanism

CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  investment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  is_settled BOOLEAN DEFAULT FALSE,
  settled_date DATE,
  settlement_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_business_id ON public.investments(business_id);
CREATE INDEX IF NOT EXISTS idx_investments_is_settled ON public.investments(is_settled);
CREATE INDEX IF NOT EXISTS idx_investments_date ON public.investments(investment_date);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_investments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_investments_timestamp
BEFORE UPDATE ON public.investments
FOR EACH ROW
EXECUTE FUNCTION update_investments_updated_at();

-- Disable RLS for simplicity (2-person private app)
ALTER TABLE public.investments DISABLE ROW LEVEL SECURITY;

-- Investment Settlements Table
-- Records when investments are settled/distributed to partners
CREATE TABLE IF NOT EXISTS public.investment_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  settlement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_investment_settlements_investment_id ON public.investment_settlements(investment_id);
CREATE INDEX IF NOT EXISTS idx_investment_settlements_partner_id ON public.investment_settlements(partner_id);
CREATE INDEX IF NOT EXISTS idx_investment_settlements_date ON public.investment_settlements(settlement_date);

-- Auto-update timestamp trigger
CREATE TRIGGER trigger_update_investment_settlements_timestamp
BEFORE UPDATE ON public.investment_settlements
FOR EACH ROW
EXECUTE FUNCTION update_investments_updated_at();

-- Disable RLS
ALTER TABLE public.investment_settlements DISABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE public.investments IS 'User capital investments into businesses';
COMMENT ON TABLE public.investment_settlements IS 'Records of investment settlements distributed to partners';
COMMENT ON COLUMN public.investments.is_settled IS 'Whether the investment has been settled/distributed to partners';
COMMENT ON COLUMN public.investments.settled_date IS 'Date when the investment was settled';
