import { supabase } from '@/lib/supabase/client';
import { Transaction, TransactionType } from '@/lib/types';

export interface TransactionFilters {
  businessId?: string;
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  category?: string;
}

export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select('*, business:businesses(*)');

  if (filters?.businessId) {
    query = query.eq('business_id', filters.businessId);
  }

  if (filters?.startDate) {
    query = query.gte('date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('date', filters.endDate);
  }

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...transaction,
      created_by: user?.id,
    })
    .select('*, business:businesses(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select('*, business:businesses(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getCategories(businessId?: string): Promise<string[]> {
  let query = supabase
    .from('transactions')
    .select('category');

  if (businessId) {
    query = query.eq('business_id', businessId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const categories = new Set(data?.map(t => t.category) || []);
  return Array.from(categories).sort();
}
