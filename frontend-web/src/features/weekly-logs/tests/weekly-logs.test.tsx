import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import StudentWeeklyLogsPage from '@/features/weekly-logs/components/student-weekly-logs-view';
import { apiClient } from '@/lib/api-client';

vi.mock('@/features/auth/hooks/use-auth', () => ({
    useAuth: () => ({
        user: { id: 'std-1', fullName: 'Nguyễn Văn A', role: 'STUDENT' },
        isAuthenticated: true,
        isLoading: false,
    }),
}));

vi.mock('@/lib/api-client', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

describe('StudentWeeklyLogsPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (apiClient.get as any).mockImplementation((url: string) => {
            if (url.includes('/placements/my-placement')) {
                return Promise.resolve({
                    data: [{ id: 'plc-1', companyName: 'FPT Software', status: 'ACTIVE' }],
                });
            }
            if (url.includes('/logbooks/placement/')) {
                return Promise.resolve({
                    data: [
                        {
                            id: 'log-1',
                            placementId: 'plc-1',
                            weekNumber: 1,
                            periodStart: '2026-10-01',
                            periodEnd: '2026-10-05',
                            tasksCompleted: 'Cài đặt môi trường Spring Boot và thiết lập Docker',
                            learningReflection: 'Học cách cấu hình container cho database PostgreSQL',
                            totalHours: 40,
                            wasLate: false,
                            status: 'APPROVED',
                            mentorFeedback: 'Làm việc chăm chỉ, hoàn thành tốt',
                        },
                    ],
                });
            }
            return Promise.resolve({ data: [] });
        });
    });

    it('renders weekly log list with mentor feedback and status badge', async () => {
        render(<StudentWeeklyLogsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Nhật ký thực tập — Tuần 1/i)).toBeInTheDocument();
        });

        expect(screen.getByText(/Cài đặt môi trường Spring Boot/i)).toBeInTheDocument();
        expect(screen.getByText(/Học cách cấu hình container/i)).toBeInTheDocument();
        expect(screen.getByText(/Làm việc chăm chỉ, hoàn thành tốt/i)).toBeInTheDocument();
    });

    it('opens create modal when clicking "Nộp nhật ký tuần mới"', async () => {
        render(<StudentWeeklyLogsPage />);

        await waitFor(() => {
            expect(screen.getByText(/Nhật ký thực tập — Tuần 1/i)).toBeInTheDocument();
        });

        const newLogBtn = screen.getByRole('button', { name: /Nộp nhật ký tuần mới/i });
        fireEvent.click(newLogBtn);

        expect(screen.getByText(/Nộp nhật ký thực tập tuần/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Tuần số/i)).toBeInTheDocument();
    });
});
