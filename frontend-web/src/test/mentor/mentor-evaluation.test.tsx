import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import MentorWeeklyEvaluationsPage from '@/app/(mentor)/mentor/weekly-evaluations/page';
import { apiClient } from '@/lib/api-client';

const mockUser = {
    id: 'mentor-1',
    fullName: 'Trần Minh Hoàng',
    role: 'COMPANY_MENTOR',
};

vi.mock('@/context/auth-context', () => ({
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
    });

    it('renders weekly log list of assigned students', () => {
        render(<MentorWeeklyEvaluationsPage />);

        expect(screen.getByText('Duyệt Nhật Ký Tuần (Weekly Logbook)')).toBeInTheDocument();
        expect(screen.getAllByText('Nguyễn Văn A').length).toBeGreaterThan(0);
        expect(screen.getByText(/Nghiên cứu tài liệu kiến trúc hệ thống/i)).toBeInTheDocument();
    });

    it('opens review modal and saves feedback', async () => {
        (apiClient.patch as any).mockResolvedValue({
            data: { success: true },
        });

        render(<MentorWeeklyEvaluationsPage />);

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
