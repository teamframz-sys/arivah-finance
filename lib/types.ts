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
  personalExpenses?: number;
  totalInvestments?: number;
  settledInvestments?: number;
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

// Task Types
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  business_id?: string;
  assigned_to?: string;
  created_by?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  business?: Business;
  assigned_user?: User;
  creator?: User;
}

// Activity Log Types
export type ActivityAction =
  // Transaction actions
  | 'created_transaction'
  | 'updated_transaction'
  | 'deleted_transaction'
  // Transfer actions
  | 'created_transfer'
  | 'updated_transfer'
  | 'deleted_transfer'
  // Investment actions
  | 'created_investment'
  | 'updated_investment'
  | 'deleted_investment'
  | 'settled_investment'
  // Personal expense actions
  | 'created_personal_expense'
  | 'updated_personal_expense'
  | 'deleted_personal_expense'
  | 'reimbursed_expense'
  // Task actions
  | 'created_task'
  | 'updated_task'
  | 'deleted_task'
  | 'completed_task'
  | 'cancelled_task'
  // Partner & profit sharing actions
  | 'created_profit_sharing'
  | 'updated_profit_sharing'
  | 'settled_profit_sharing'
  | 'updated_partner'
  // Business actions
  | 'updated_business'
  // Auth actions
  | 'login'
  | 'logout';

export type EntityType =
  | 'transaction'
  | 'business'
  | 'task'
  | 'transfer'
  | 'partner'
  | 'profit_sharing'
  | 'user'
  | 'investment'
  | 'investment_settlement'
  | 'personal_expense';

export interface ActivityLog {
  id: string;
  user_id: string;
  action: ActivityAction;
  entity_type: EntityType;
  entity_id?: string;
  details?: Record<string, any>;
  created_at: string;
  user?: User;
}

// User with activity stats
export interface UserWithStats extends User {
  total_transactions?: number;
  total_tasks?: number;
  recent_activity?: ActivityLog[];
}

// Personal Expense Types
export interface PersonalExpense {
  id: string;
  user_id: string;
  business_id?: string;
  date: string;
  category: string;
  amount: number;
  payment_method?: string;
  description?: string;
  is_reimbursable: boolean;
  is_reimbursed: boolean;
  reimbursed_date?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  user?: User;
  business?: Business;
}

export interface PersonalExpenseStats {
  totalExpenses: number;
  categoryBreakdown: { category: string; amount: number; count: number }[];
  monthlyTrend: { month: string; amount: number }[];
  reimbursablePending: number;
  reimbursedTotal: number;
}

// Investment Types
export interface Investment {
  id: string;
  user_id: string;
  business_id: string;
  amount: number;
  investment_date: string;
  description?: string;
  is_settled: boolean;
  settled_date?: string;
  settlement_note?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  business?: Business;
}

export interface InvestmentSettlement {
  id: string;
  investment_id: string;
  partner_id: string;
  amount: number;
  settlement_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  partner?: Partner;
}

export interface InvestmentWithSettlements extends Investment {
  settlements?: InvestmentSettlement[];
}
