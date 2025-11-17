import { supabase } from '@/lib/supabase/client';
import { InterBusinessTransfer } from '@/lib/types';
import { createTransaction } from './transactions';
import { logActivity } from './activity';

export async function getTransfers(businessId?: string): Promise<InterBusinessTransfer[]> {
  let query = supabase
    .from('inter_business_transfers')
    .select('*, from_business:from_business_id(name), to_business:to_business_id(name)');

  if (businessId) {
    query = query.or(`from_business_id.eq.${businessId},to_business_id.eq.${businessId}`);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createTransfer(transfer: {
  from_business_id: string;
  to_business_id: string;
  amount: number;
  date: string;
  purpose: string;
}): Promise<InterBusinessTransfer> {
  const { data: { user } } = await supabase.auth.getUser();

  // Start a transaction by creating both records
  // 1. Create the transfer record
  const { data: transferData, error: transferError } = await supabase
    .from('inter_business_transfers')
    .insert({
      ...transfer,
      created_by: user?.id,
    })
    .select('*, from_business:from_business_id(*), to_business:to_business_id(*)')
    .single();

  if (transferError) throw transferError;

  // 2. Create transfer_out transaction for source business
  await createTransaction({
    business_id: transfer.from_business_id,
    date: transfer.date,
    type: 'transfer_out',
    category: 'Inter-business Transfer',
    amount: transfer.amount,
    description: `Transfer to ${transferData.to_business?.name || 'another business'}: ${transfer.purpose}`,
  });

  // 3. Create transfer_in transaction for destination business
  await createTransaction({
    business_id: transfer.to_business_id,
    date: transfer.date,
    type: 'transfer_in',
    category: 'Inter-business Transfer',
    amount: transfer.amount,
    description: `Transfer from ${transferData.from_business?.name || 'another business'}: ${transfer.purpose}`,
  });

  // Log activity
  await logActivity('created_transfer', 'transfer', transferData.id, {
    amount: transfer.amount,
    from_business: transferData.from_business?.name,
    to_business: transferData.to_business?.name,
    purpose: transfer.purpose,
    date: transfer.date,
  });

  return transferData;
}

export async function getTransfersBetweenBusinesses(
  fromBusinessId: string,
  toBusinessId: string,
  startDate?: string,
  endDate?: string
): Promise<InterBusinessTransfer[]> {
  let query = supabase
    .from('inter_business_transfers')
    .select('*')
    .eq('from_business_id', fromBusinessId)
    .eq('to_business_id', toBusinessId);

  if (startDate) {
    query = query.gte('date', startDate);
  }

  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}
