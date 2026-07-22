import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'payment' | 'project' | 'request';
  read: boolean;
  createdAt: string;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (title: string, message: string, type: Notification['type'], targetUserId?: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const STORAGE_KEY = 'nextia_notifications_state';
const isSupabaseEnabled = false;

// Adapter: Maps database schema (snake_case) to UI models (camelCase)
function mapNotifDbToUi(dbNotif: any): Notification {
  return {
    id: dbNotif.id,
    userId: dbNotif.user_id,
    title: dbNotif.title,
    message: dbNotif.message,
    type: dbNotif.type,
    read: dbNotif.read,
    createdAt: dbNotif.created_at
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          setNotifications([]);
        } else if (data) {
          setNotifications(data.map(mapNotifDbToUi));
        }
      } catch (err) {
        console.error('Unexpected error loading notifications:', err);
      }
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const list: Notification[] = JSON.parse(stored);
          setNotifications(list.filter(n => n.userId === user.id));
        } catch {
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // addNotification
  const addNotification = async (title: string, message: string, type: Notification['type'], targetUserId?: string) => {
    // If no targetUserId, default to current user. If targetUserId is 'admins', send to all admins.
    const resolvedTargetId = targetUserId || (user ? user.id : '');

    if (!resolvedTargetId) return;

    if (resolvedTargetId === 'admins') {
      // ─── Broadcast to all Admins ───
      if (isSupabaseEnabled) {
        try {
          // Fetch admin profiles
          const { data: admins } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin');

          if (admins && admins.length > 0) {
            const dbNotifs = admins.map(admin => ({
              user_id: admin.id,
              title,
              message,
              type,
              read: false
            }));

            await supabase.from('notifications').insert(dbNotifs);
          }
        } catch (err) {
          console.error('Error broadcasting admin notifications:', err);
        }
      } else {
        // Fallback local broadcast
        const storedProfiles = localStorage.getItem('nextia_profiles_state');
        const profilesList = storedProfiles ? JSON.parse(storedProfiles) : [];
        const admins = profilesList.filter((p: any) => p.role === 'admin');

        const stored = localStorage.getItem(STORAGE_KEY);
        let list: Notification[] = stored ? JSON.parse(stored) : [];

        admins.forEach((admin: any) => {
          list.unshift({
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: admin.id,
            title,
            message,
            type,
            read: false,
            createdAt: new Date().toISOString()
          });
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        if (user && user.role === 'admin') {
          setNotifications(list.filter(n => n.userId === user.id));
        }
      }
      return;
    }

    // ─── Single User Notification ───
    if (isSupabaseEnabled) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .insert([{
            user_id: resolvedTargetId,
            title,
            message,
            type,
            read: false
          }])
          .select()
          .single();

        if (error) {
          console.error('Error inserting notification:', error);
        } else if (data && user && data.user_id === user.id) {
          setNotifications(prev => [mapNotifDbToUi(data), ...prev]);
        }
      } catch (err) {
        console.error('Error adding notification:', err);
      }
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      let list: Notification[] = stored ? JSON.parse(stored) : [];

      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        userId: resolvedTargetId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString()
      };

      list.unshift(newNotif);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      if (user && resolvedTargetId === user.id) {
        setNotifications(prev => [newNotif, ...prev]);
      }
    }
  };

  // markAsRead
  const markAsRead = async (id: string) => {
    if (isSupabaseEnabled) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', id);

        if (error) {
          console.error('Error marking notification read:', error);
        } else {
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const list: Notification[] = JSON.parse(stored);
        const updated = list.map(n => n.id === id ? { ...n, read: true } : n);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (user) {
          setNotifications(updated.filter(n => n.userId === user.id));
        }
      }
    }
  };

  // markAllAsRead
  const markAllAsRead = async () => {
    if (!user) return;

    if (isSupabaseEnabled) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error marking all notifications read:', error);
        } else {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const list: Notification[] = JSON.parse(stored);
        const updated = list.map(n => n.userId === user.id ? { ...n, read: true } : n);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setNotifications(updated.filter(n => n.userId === user.id));
      }
    }
  };

  // deleteNotification
  const deleteNotification = async (id: string) => {
    if (isSupabaseEnabled) {
      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting notification:', error);
        } else {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const list: Notification[] = JSON.parse(stored);
        const updated = list.filter(n => n.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (user) {
          setNotifications(updated.filter(n => n.userId === user.id));
        }
      }
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within a NotificationProvider');
  return ctx;
}
