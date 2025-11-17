import { supabase } from '@/lib/supabase/client';
import { ActivityAction, EntityType } from '@/lib/types';

export async function logActivity(
  action: ActivityAction,
  entityType: EntityType,
  entityId?: string,
  details?: Record<string, any>
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn('No user found for activity logging');
      return;
    }

    const { error } = await supabase.from('activity_logs').insert([
      {
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
      },
    ]);

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
