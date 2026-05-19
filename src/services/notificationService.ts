import { supabase } from '../lib/supabase';
import { mapNotification } from '../lib/supabaseHelpers';
import { Notification } from '../types';

export const notificationService = {
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    if (!userId) return () => {};

    const load = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      callback((data || []).map(mapNotification) as Notification[]);
    };

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, load)
      .subscribe();

    load();
    return () => supabase.removeChannel(channel);
  },

  async sendNotification(data: Omit<Notification, 'id' | 'read' | 'createdAt'>) {
    const { error } = await supabase.from('notifications').insert({
      user_id: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      read: false
    });
    if (error) throw error;
  },

  async markAsRead(notificationId: string) {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
    if (error) throw error;
  },

  async deleteNotification(notificationId: string) {
    const { error } = await supabase.from('notifications').delete().eq('id', notificationId);
    if (error) throw error;
  }
};
