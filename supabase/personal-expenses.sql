-- Personal Expenses Feature
-- Run this SQL in Supabase SQL Editor to add personal expenses tracking

-- Personal expenses table
CREATE TABLE IF NOT EXISTS public.personal_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method TEXT,
  description TEXT,
  is_reimbursable BOOLEAN DEFAULT false,
  is_reimbursed BOOLEAN DEFAULT false,
  reimbursed_date DATE,
  tags TEXT[], -- Array of tags for better categorization
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_personal_expenses_user_id ON public.personal_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_expenses_business_id ON public.personal_expenses(business_id);
CREATE INDEX IF NOT EXISTS idx_personal_expenses_date ON public.personal_expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_personal_expenses_category ON public.personal_expenses(category);
CREATE INDEX IF NOT EXISTS idx_personal_expenses_is_reimbursable ON public.personal_expenses(is_reimbursable);

-- Disable RLS for simplicity (2-person app)
ALTER TABLE public.personal_expenses DISABLE ROW LEVEL SECURITY;

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_personal_expenses_updated_at ON public.personal_expenses;
CREATE TRIGGER update_personal_expenses_updated_at
  BEFORE UPDATE ON public.personal_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.personal_expenses IS 'Personal expenses tracking for users, separate from business expenses';
COMMENT ON COLUMN public.personal_expenses.is_reimbursable IS 'Whether this expense can be reimbursed by a business';
COMMENT ON COLUMN public.personal_expenses.is_reimbursed IS 'Whether this expense has been reimbursed';
COMMENT ON COLUMN public.personal_expenses.tags IS 'Custom tags for categorization (e.g., travel, food, utilities)';
