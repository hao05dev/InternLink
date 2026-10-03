import { apiClient } from '@/lib/api-client';
import type { Notification } from '@/features/notifications/types/notification.types';
import type { NotificationPage, NotificationPreferences } from '../types/preferences.types';

export const notificationService = {
    getPage: (page=0,size=20,unread=false) => apiClient.get<NotificationPage>(`/api/v1/notifications?page=${page}&size=${size}&unread=${unread}`),
    getPreferences: () => apiClient.get<NotificationPreferences>('/api/v1/notifications/preferences'),
    savePreferences: (value: NotificationPreferences) => apiClient.put<NotificationPreferences>('/api/v1/notifications/preferences',value),
    getMyNotifications: () => apiClient.get<Notification[]>('/api/v1/notifications/my-notifications'),
    getUnreadCount: () => apiClient.get<number>('/api/v1/notifications/unread-count'),
    markRead: (id: string) => apiClient.patch(`/api/v1/notifications/${id}/read`),
    markAllRead: () => apiClient.patch('/api/v1/notifications/read-all'),
};
