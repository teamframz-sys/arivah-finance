import { supabase } from '@/lib/supabase/client';
import { User, UserWithStats, ActivityLog } from '@/lib/types';

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getUserById(id: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getUsersWithStats(): Promise<UserWithStats[]> {
  const users = await getUsers();

  const usersWithStats = await Promise.all(
    users.map(async (user) => {
      // Get transaction count
      const { count: transactionCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);

      // Get task count
      const { count: taskCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`);

      // Get recent activity
      const { data: recentActivity } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        ...user,
        total_transactions: transactionCount || 0,
        total_tasks: taskCount || 0,
        recent_activity: recentActivity || [],
      };
    })
  );

  return usersWithStats;
}

export async function getActivityLogs(userId?: string, limit = 100): Promise<ActivityLog[]> {
  let query = supabase
    .from('activity_logs')
    .select('*, user:users(*)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function logActivity(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, any>
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });
  }
}
