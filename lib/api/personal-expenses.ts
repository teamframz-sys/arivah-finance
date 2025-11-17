import { supabase } from '@/lib/supabase/client';
import { PersonalExpense, PersonalExpenseStats } from '@/lib/types';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface PersonalExpenseFilters {
  userId?: string;
  businessId?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  isReimbursable?: boolean;
  isReimbursed?: boolean;
}

export async function getPersonalExpenses(filters?: PersonalExpenseFilters): Promise<PersonalExpense[]> {
  let query = supabase
    .from('personal_expenses')
    .select('*, user:users(*), business:businesses(*)');

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }

  if (filters?.businessId) {
    query = query.eq('business_id', filters.businessId);
  }

  if (filters?.startDate) {
    query = query.gte('date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('date', filters.endDate);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.isReimbursable !== undefined) {
    query = query.eq('is_reimbursable', filters.isReimbursable);
  }

  if (filters?.isReimbursed !== undefined) {
    query = query.eq('is_reimbursed', filters.isReimbursed);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPersonalExpenseById(id: string): Promise<PersonalExpense> {
  const { data, error } = await supabase
    .from('personal_expenses')
    .select('*, user:users(*), business:businesses(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createPersonalExpense(
  expense: Omit<PersonalExpense, 'id' | 'created_at' | 'updated_at'>
): Promise<PersonalExpense> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('personal_expenses')
    .insert({
      ...expense,
      user_id: user?.id || expense.user_id,
    })
    .select('*, user:users(*), business:businesses(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function updatePersonalExpense(
  id: string,
  updates: Partial<PersonalExpense>
): Promise<PersonalExpense> {
  const { data, error } = await supabase
    .from('personal_expenses')
    .update(updates)
    .eq('id', id)
    .select('*, user:users(*), business:businesses(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function deletePersonalExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('personal_expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getPersonalExpenseCategories(userId?: string): Promise<string[]> {
  let query = supabase
    .from('personal_expenses')
    .select('category');

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const categories = [...new Set(data?.map((item) => item.category) || [])];
  return categories.sort();
}

export async function getPersonalExpenseStats(
  userId?: string,
  startDate?: string,
  endDate?: string
): Promise<PersonalExpenseStats> {
  const expenses = await getPersonalExpenses({
    userId,
    startDate,
    endDate,
  });

  // Total expenses
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Category breakdown
  const categoryMap = new Map<string, { amount: number; count: number }>();
  expenses.forEach((exp) => {
    const existing = categoryMap.get(exp.category) || { amount: 0, count: 0 };
    categoryMap.set(exp.category, {
      amount: existing.amount + exp.amount,
      count: existing.count + 1,
    });
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.amount - a.amount);

  // Monthly trend (last 6 months)
  const monthlyMap = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i);
    const monthKey = format(monthDate, 'MMM yyyy');
    monthlyMap.set(monthKey, 0);
  }

  expenses.forEach((exp) => {
    const monthKey = format(new Date(exp.date), 'MMM yyyy');
    if (monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + exp.amount);
    }
  });

  const monthlyTrend = Array.from(monthlyMap.entries()).map(([month, amount]) => ({
    month,
    amount,
  }));

  // Reimbursable stats
  const reimbursablePending = expenses
    .filter((exp) => exp.is_reimbursable && !exp.is_reimbursed)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const reimbursedTotal = expenses
    .filter((exp) => exp.is_reimbursed)
    .reduce((sum, exp) => sum + exp.amount, 0);

  return {
    totalExpenses,
    categoryBreakdown,
    monthlyTrend,
    reimbursablePending,
    reimbursedTotal,
  };
}

export async function markAsReimbursed(id: string): Promise<PersonalExpense> {
  return updatePersonalExpense(id, {
    is_reimbursed: true,
    reimbursed_date: new Date().toISOString().split('T')[0],
  });
}
