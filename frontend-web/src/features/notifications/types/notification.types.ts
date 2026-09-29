export interface Notification {
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
