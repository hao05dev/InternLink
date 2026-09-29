import { apiClient } from '@/lib/api-client';
import type { Notification } from '@/features/notifications/types/notification.types';

export const notificationService = {
    getMyNotifications: () => apiClient.get<Notification[]>('/api/v1/notifications/my-notifications'),
    getUnreadCount: () => apiClient.get<number>('/api/v1/notifications/unread-count'),
    markRead: (id: string) => apiClient.patch(`/api/v1/notifications/${id}/read`),
    markAllRead: () => apiClient.patch('/api/v1/notifications/read-all'),
};
