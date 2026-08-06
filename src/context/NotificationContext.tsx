/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { requestJson, type DatabaseRecord } from '../lib/appData';
import { useAuth } from './AuthContext';

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

function mapNotification(item: DatabaseRecord): Notification {
  return {
    id: String(item.id || ''),
    userId: String(item.user_id || ''),
    title: String(item.title || ''),
    message: String(item.message || ''),
    type: item.type as Notification['type'],
    read: Boolean(item.read),
    createdAt: String(item.created_at || ''),
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await requestJson<{ notifications: DatabaseRecord[] }>('/api/notifications');
      setNotifications(data.notifications.map(mapNotification));
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const addNotification = async (title: string, message: string, type: Notification['type'], targetUserId?: string) => {
    if (!user && !targetUserId) return;
    await requestJson('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({ title, message, type, targetUserId: targetUserId || user?.id }),
    });
    if (!targetUserId || targetUserId === user?.id || (targetUserId === 'admins' && user?.role === 'admin')) await refresh();
  };

  const markAsRead = async (id: string) => {
    await requestJson('/api/notifications/read', { method: 'POST', body: JSON.stringify({ id }) });
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
  };

  const markAllAsRead = async () => {
    await requestJson('/api/notifications/read', { method: 'POST', body: JSON.stringify({ all: true }) });
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  const deleteNotification = async (id: string) => {
    await requestJson('/api/notifications/delete', { method: 'POST', body: JSON.stringify({ id }) });
    setNotifications((current) => current.filter((item) => item.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount: notifications.filter((item) => !item.read).length, loading, addNotification, markAsRead, markAllAsRead, deleteNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
}
