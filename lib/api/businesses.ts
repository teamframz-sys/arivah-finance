import { supabase } from '@/lib/supabase/client';
import { Business } from '@/lib/types';

export async function getBusinesses(): Promise<Business[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getBusinessByName(name: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('name', name)
    .single();

  if (error) throw error;
  return data;
}

export async function updateBusiness(id: string, updates: Partial<Business>): Promise<Business> {
  const { data, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
