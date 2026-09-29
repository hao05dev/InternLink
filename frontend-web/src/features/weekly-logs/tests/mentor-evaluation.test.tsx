import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import MentorWeeklyEvaluationsPage from '@/features/weekly-logs/components/mentor-weekly-evaluations-view';
import { apiClient } from '@/lib/api-client';

const mockUser = {
    id: 'mentor-1',
    fullName: 'Trần Minh Hoàng',
    role: 'COMPANY_MENTOR',
};

const mockPlacements = [
    {
        id: 'p-1',
        studentId: 'stu-1',
        studentName: 'Nguyễn Văn A',
        studentCode: 'B2100001',
        companyName: 'FPT Software Cần Thơ',
    },
];

const mockLogs = [
    {
        id: 'log-1',
        weekNumber: 1,
        studentId: 'stu-1',
        studentName: 'Nguyễn Văn A',
        studentCode: 'B2100001',
        tasksCompleted: 'Nghiên cứu tài liệu kiến trúc hệ thống',
        status: 'SUBMITTED',
        hoursWorked: 40,
    },
];

vi.mock('@/features/auth/hooks/use-auth', () => ({
    useAuth: () => ({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
    }),
}));

vi.mock('@/lib/api-client', () => ({
    apiClient: {
        get: vi.fn(),
        patch: vi.fn(),
    },
}));

describe('MentorWeeklyEvaluationsPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (apiClient.get as any).mockImplementation((url: string) => {
            if (url.includes('/my-students')) {
                return Promise.resolve({ data: mockPlacements });
            }
            if (url.includes('/logbooks/placement/')) {
                return Promise.resolve({ data: mockLogs });
            }
            return Promise.resolve({ data: [] });
        });
    });

    it('renders weekly log list of assigned students', async () => {
        render(<MentorWeeklyEvaluationsPage />);

        expect(screen.getByText('Duyệt Nhật Ký Tuần (Weekly Logbook)')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getAllByText('Nguyễn Văn A').length).toBeGreaterThan(0);
            expect(screen.getByText(/Nghiên cứu tài liệu kiến trúc hệ thống/i)).toBeInTheDocument();
        });
    });

    it('opens review modal and saves feedback', async () => {
        (apiClient.patch as any).mockResolvedValue({
            data: { success: true },
        });

        render(<MentorWeeklyEvaluationsPage />);

        await waitFor(() => {
            expect(screen.getAllByText('Nguyễn Văn A').length).toBeGreaterThan(0);
        });

        // Click review button
        const reviewBtns = screen.getAllByRole('button', { name: /Đánh giá/i });
        fireEvent.click(reviewBtns[0]);

        // Check modal appeared
        expect(screen.getByText(/Đánh giá nhật ký/i)).toBeInTheDocument();

        // Type mentor feedback
        const feedbackInput = screen.getByLabelText(/Nhận xét của Cán bộ hướng dẫn/i);
        fireEvent.change(feedbackInput, { target: { value: 'Sinh viên làm việc tích cực, chất lượng code tốt.' } });

        // Submit
        const saveBtn = screen.getByRole('button', { name: /Lưu đánh giá/i });
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(apiClient.patch).toHaveBeenCalledWith(
                expect.stringContaining('/mentor-review?status=APPROVED')
            );
        });
    });
});
