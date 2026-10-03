export interface Notification {
    category?: string;
    deliveryStatus?: { inApp?: string; email?: string };
    id: string;
    recipientUserId?: string;
    notificationType: string;
    title: string;
    message: string;
    actionUrl?: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
}
