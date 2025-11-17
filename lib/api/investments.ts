import { supabase } from '@/lib/supabase/client';
import { Investment, InvestmentSettlement, InvestmentWithSettlements } from '@/lib/types';

export interface GetInvestmentsOptions {
  userId?: string;
  businessId?: string;
  isSettled?: boolean;
  startDate?: string;
  endDate?: string;
}

// Get investments with filters
export async function getInvestments(
  options: GetInvestmentsOptions = {}
): Promise<Investment[]> {
  let query = supabase
    .from('investments')
    .select(`
      *,
      user:users(*),
      business:businesses(*)
    `)
    .order('investment_date', { ascending: false });

  if (options.userId) {
    query = query.eq('user_id', options.userId);
  }

  if (options.businessId) {
    query = query.eq('business_id', options.businessId);
  }

  if (options.isSettled !== undefined) {
    query = query.eq('is_settled', options.isSettled);
  }

  if (options.startDate) {
    query = query.gte('investment_date', options.startDate);
  }

  if (options.endDate) {
    query = query.lte('investment_date', options.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching investments:', error);
    throw error;
  }

  return data || [];
}

// Get single investment by ID
export async function getInvestmentById(id: string): Promise<Investment | null> {
  const { data, error } = await supabase
    .from('investments')
    .select(`
      *,
      user:users(*),
      business:businesses(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching investment:', error);
    throw error;
  }

  return data;
}

// Get investment with settlements
export async function getInvestmentWithSettlements(
  id: string
): Promise<InvestmentWithSettlements | null> {
  const { data: investment, error: investmentError } = await supabase
    .from('investments')
    .select(`
      *,
      user:users(*),
      business:businesses(*)
    `)
    .eq('id', id)
    .single();

  if (investmentError) {
    console.error('Error fetching investment:', investmentError);
    throw investmentError;
  }

  const { data: settlements, error: settlementsError } = await supabase
    .from('investment_settlements')
    .select(`
      *,
      partner:partners(*)
    `)
    .eq('investment_id', id);

  if (settlementsError) {
    console.error('Error fetching settlements:', settlementsError);
    throw settlementsError;
  }

  return {
    ...investment,
    settlements: settlements || [],
  };
}

// Create new investment
export async function createInvestment(
  investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>
): Promise<Investment> {
  const { data, error } = await supabase
    .from('investments')
    .insert([investment])
    .select(`
      *,
      user:users(*),
      business:businesses(*)
    `)
    .single();

  if (error) {
    console.error('Error creating investment:', error);
    throw error;
  }

  return data;
}

// Update investment
export async function updateInvestment(
  id: string,
  updates: Partial<Investment>
): Promise<Investment> {
  const { data, error } = await supabase
    .from('investments')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      user:users(*),
      business:businesses(*)
    `)
    .single();

  if (error) {
    console.error('Error updating investment:', error);
    throw error;
  }

  return data;
}

// Delete investment
export async function deleteInvestment(id: string): Promise<void> {
  const { error } = await supabase.from('investments').delete().eq('id', id);

  if (error) {
    console.error('Error deleting investment:', error);
    throw error;
  }
}

// Get settlements for an investment
export async function getInvestmentSettlements(
  investmentId: string
): Promise<InvestmentSettlement[]> {
  const { data, error } = await supabase
    .from('investment_settlements')
    .select(`
      *,
      partner:partners(*)
    `)
    .eq('investment_id', investmentId)
    .order('settlement_date', { ascending: false });

  if (error) {
    console.error('Error fetching investment settlements:', error);
    throw error;
  }

  return data || [];
}

// Create investment settlement
export async function createInvestmentSettlement(
  settlement: Omit<InvestmentSettlement, 'id' | 'created_at' | 'updated_at'>
): Promise<InvestmentSettlement> {
  const { data, error } = await supabase
    .from('investment_settlements')
    .insert([settlement])
    .select(`
      *,
      partner:partners(*)
    `)
    .single();

  if (error) {
    console.error('Error creating investment settlement:', error);
    throw error;
  }

  return data;
}

// Settle investment - create settlements for all partners
export async function settleInvestment(
  investmentId: string,
  partnerShares: Array<{ partner_id: string; amount: number }>,
  settlementDate: string,
  notes?: string
): Promise<InvestmentSettlement[]> {
  // Create settlements for each partner
  const settlements = partnerShares.map(share => ({
    investment_id: investmentId,
    partner_id: share.partner_id,
    amount: share.amount,
    settlement_date: settlementDate,
    notes,
  }));

  const { data, error } = await supabase
    .from('investment_settlements')
    .insert(settlements)
    .select(`
      *,
      partner:partners(*)
    `);

  if (error) {
    console.error('Error creating investment settlements:', error);
    throw error;
  }

  // Mark investment as settled
  await updateInvestment(investmentId, {
    is_settled: true,
    settled_date: settlementDate,
    settlement_note: notes,
  });

  return data || [];
}

// Get total unsettled investments by user
export async function getUnsettledInvestmentsByUser(
  userId: string
): Promise<{ total: number; count: number }> {
  const investments = await getInvestments({ userId, isSettled: false });

  const total = investments.reduce((sum, inv) => sum + inv.amount, 0);

  return {
    total,
    count: investments.length,
  };
}

// Get total unsettled investments by business
export async function getUnsettledInvestmentsByBusiness(
  businessId: string
): Promise<{ total: number; count: number }> {
  const investments = await getInvestments({ businessId, isSettled: false });

  const total = investments.reduce((sum, inv) => sum + inv.amount, 0);

  return {
    total,
    count: investments.length,
  };
}
