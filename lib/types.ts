// Database Types
export type TransactionType =
  | 'revenue'
  | 'expense'
  | 'transfer_out'
  | 'transfer_in'
  | 'partner_payout'
  | 'capital_injection'
  | 'tax'
  | 'other';

export type BusinessType = 'service' | 'ecommerce';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  name: string;
  email?: string;
  equity_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessPartner {
  id: string;
  business_id: string;
  partner_id: string;
  equity_percentage: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  business_id: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  payment_method?: string;
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  business?: Business;
}

export interface InterBusinessTransfer {
  id: string;
  from_business_id: string;
  to_business_id: string;
  date: string;
  amount: number;
  purpose: string;
  created_by?: string;
  created_at: string;
  from_business?: Business;
  to_business?: Business;
}

export interface ProfitSharingLog {
  id: string;
  business_id: string;
  period_start_date: string;
  period_end_date: string;
  total_profit: number;
  partner_id: string;
  partner_share_amount: number;
  reinvested_to_other_business_amount: number;
  cash_payout_amount: number;
  note?: string;
  is_settled: boolean;
  created_by?: string;
  created_at: string;
  business?: Business;
  partner?: Partner;
}

// API Types
export interface BusinessMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  transferredOut?: number;
  receivedIn?: number;
  cashBalance: number;
}

export interface DashboardData {
  webDev: BusinessMetrics;
  jewels: BusinessMetrics;
  consolidated: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    totalTransfers: number;
  };
}

export interface PartnerShare {
  partner: Partner;
  shareAmount: number;
  equityPercentage: number;
}
