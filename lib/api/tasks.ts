import { supabase } from '@/lib/supabase/client';
import { Task, TaskStatus, TaskPriority } from '@/lib/types';

export interface TaskFilters {
  businessId?: string;
  assignedTo?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export async function getTasks(filters?: TaskFilters): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*, business:businesses(*), assigned_user:users!assigned_to(*), creator:users!created_by(*)');

  if (filters?.businessId) {
    query = query.eq('business_id', filters.businessId);
  }

  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTaskById(id: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, business:businesses(*), assigned_user:users!assigned_to(*), creator:users!created_by(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...task,
      created_by: user?.id,
    })
    .select('*, business:businesses(*), assigned_user:users!assigned_to(*), creator:users!created_by(*)')
    .single();

  if (error) throw error;

  // Log activity
  await logActivity('created_task', 'task', data.id, { title: task.title });

  return data;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  // If status is being changed to completed, set completed_at
  if (updates.status === 'completed' && !updates.completed_at) {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select('*, business:businesses(*), assigned_user:users!assigned_to(*), creator:users!created_by(*)')
    .single();

  if (error) throw error;

  // Log activity
  const action = updates.status === 'completed' ? 'completed_task' : 'updated_task';
  await logActivity(action, 'task', id, updates);

  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Helper function to log activity
async function logActivity(
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, any>
) {
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
