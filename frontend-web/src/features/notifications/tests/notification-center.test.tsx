import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationCenter } from '@/features/notifications/components/notification-center';
import * as AuthContextModule from '@/features/auth/hooks/use-auth';
import { notificationService } from '@/features/notifications/services/notification.service';

vi.mock('@/features/notifications/services/notification.service', () => ({
    notificationService: {
        getMyNotifications: vi.fn(),
        markRead: vi.fn(),
        markAllRead: vi.fn(),
    },
}));

describe('NotificationCenter Component', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('renders null when user is not authenticated', async () => {
        vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        let container: HTMLElement;
        await act(async () => {
            ({ container } = render(<NotificationCenter />));
        });
        expect(container!).toBeEmptyDOMElement();
    });

    it('displays unread count badge and toggles notification popover', async () => {
        vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
            user: {
                id: 'student-1',
                email: 'student@ctu.edu.vn',
                fullName: 'Nguyen Van A',
                role: 'STUDENT',
            },
            isLoading: false,
            isAuthenticated: true,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        vi.mocked(notificationService.getMyNotifications).mockResolvedValue({
            data: [
                {
                    id: 'notif-1',
                    notificationType: 'LOGBOOK_REVISION_REQUESTED',
                    title: 'Yêu cầu sửa nhật ký tuần 2',
                    message: 'Vui lòng bổ sung mục tiêu tuần này.',
                    actionUrl: '/student/weekly-logs',
                    isRead: false,
                    createdAt: new Date().toISOString(),
                },
                {
                    id: 'notif-2',
                    notificationType: 'INTRODUCTION_LETTER_PICKUP',
                    title: 'Giấy giới thiệu thực tập sẵn sàng',
                    message: 'Đến văn phòng khoa nhận giấy.',
                    actionUrl: '/student/dashboard',
                    isRead: true,
                    createdAt: new Date().toISOString(),
                },
            ],
            success: true,
        });

        await act(async () => {
            render(<NotificationCenter />);
        });

        // Wait for unread count badge (1 unread)
        await waitFor(() => {
            expect(screen.getByText('1')).toBeInTheDocument();
        });

        // Click bell to open
        const bellButton = screen.getByRole('button', { name: /Thông báo hệ thống/i });
        fireEvent.click(bellButton);

        // Popover title
        expect(screen.getByText('Thông báo')).toBeInTheDocument();
        expect(screen.getByText('Yêu cầu sửa nhật ký tuần 2')).toBeInTheDocument();
        expect(screen.getByText('Giấy giới thiệu thực tập sẵn sàng')).toBeInTheDocument();

        // Switch to "Chưa đọc" tab
        const unreadTab = screen.getByRole('button', { name: /Chưa đọc \(1\)/i });
        fireEvent.click(unreadTab);

        expect(screen.getByText('Yêu cầu sửa nhật ký tuần 2')).toBeInTheDocument();
        expect(screen.queryByText('Giấy giới thiệu thực tập sẵn sàng')).not.toBeInTheDocument();
    });

    it('marks all notifications as read when clicking Đã đọc hết', async () => {
        vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
            user: {
                id: 'student-1',
                email: 'student@ctu.edu.vn',
                fullName: 'Nguyen Van A',
                role: 'STUDENT',
            },
            isLoading: false,
            isAuthenticated: true,
            login: vi.fn(),
            logout: vi.fn(),
            refreshUser: vi.fn(),
        });

        vi.mocked(notificationService.getMyNotifications).mockResolvedValue({
            data: [
                {
                    id: 'notif-1',
                    notificationType: 'NEW_JOB_POSTED',
                    title: 'Tin tuyển dụng mới: Frontend Dev',
                    message: 'Công ty ABC vừa đăng tin.',
                    actionUrl: '/jobs/job-1',
                    isRead: false,
                    createdAt: new Date().toISOString(),
                },
            ],
            success: true,
        });
        vi.mocked(notificationService.markAllRead).mockResolvedValue({} as any);

        await act(async () => {
            render(<NotificationCenter />);
        });

        const bellButton = await screen.findByRole('button', { name: /Thông báo hệ thống/i });
        fireEvent.click(bellButton);

        const markAllButton = await screen.findByRole('button', { name: /Đã đọc hết/i });
        fireEvent.click(markAllButton);

        expect(notificationService.markAllRead).toHaveBeenCalled();
    });
});
