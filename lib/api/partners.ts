import { supabase } from '@/lib/supabase/client';
import { Partner, ProfitSharingLog, PartnerShare } from '@/lib/types';
import { getTransactions } from './transactions';
import { getTransactionSign } from '@/lib/utils';

export async function getPartners(): Promise<Partner[]> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function updatePartner(id: string, updates: Partial<Partner>): Promise<Partner> {
  const { data, error } = await supabase
    .from('partners')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBusinessPartners(businessId: string): Promise<(Partner & { equity_percentage: number })[]> {
  const { data, error } = await supabase
    .from('business_partners')
    .select('equity_percentage, partner:partners(*)')
    .eq('business_id', businessId);

  if (error) throw error;

  return data?.map(bp => ({
    ...(bp.partner as unknown as Partner),
    equity_percentage: bp.equity_percentage,
  })) || [];
}

export async function calculatePartnerShares(
  businessId: string,
  startDate: string,
  endDate: string
): Promise<{ totalProfit: number; shares: PartnerShare[] }> {
  // Get all transactions for the period
  const transactions = await getTransactions({
    businessId,
    startDate,
    endDate,
  });

  // Calculate total profit
  const totalProfit = transactions.reduce((sum, txn) => {
    const sign = getTransactionSign(txn.type);
    return sum + (txn.amount * sign);
  }, 0);

  // Get partners for this business
  const partners = await getBusinessPartners(businessId);

  // Calculate each partner's share
  const shares: PartnerShare[] = partners.map(partner => ({
    partner,
    shareAmount: (totalProfit * partner.equity_percentage) / 100,
    equityPercentage: partner.equity_percentage,
  }));

  return { totalProfit, shares };
}

export async function createProfitSharingLog(log: Omit<ProfitSharingLog, 'id' | 'created_at'>): Promise<ProfitSharingLog> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('profit_sharing_logs')
    .insert({
      ...log,
      created_by: user?.id,
    })
    .select('*, business:businesses(*), partner:partners(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function getProfitSharingLogs(businessId?: string): Promise<ProfitSharingLog[]> {
  let query = supabase
    .from('profit_sharing_logs')
    .select('*, business:businesses(*), partner:partners(*)');

  if (businessId) {
    query = query.eq('business_id', businessId);
  }

  const { data, error } = await query.order('period_end_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateProfitSharingLog(id: string, updates: Partial<ProfitSharingLog>): Promise<ProfitSharingLog> {
  const { data, error } = await supabase
    .from('profit_sharing_logs')
    .update(updates)
    .eq('id', id)
    .select('*, business:businesses(*), partner:partners(*)')
    .single();

  if (error) throw error;
  return data;
}
