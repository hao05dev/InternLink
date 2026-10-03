import type { Notification } from "./notification.types";
export interface NotificationPreferences {
    emailEnabled: boolean; workflowEmail: boolean; reminderEmail: boolean;
    announcementEmail: boolean; systemEmail: boolean; emailServiceEnabled: boolean;
}
export interface NotificationPage {
    items: Notification[]; totalElements: number; totalPages: number; unreadCount: number;
}
