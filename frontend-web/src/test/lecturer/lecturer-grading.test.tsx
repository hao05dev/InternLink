import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LecturerGradingPage from '@/app/(lecturer)/lecturer/grading/page';
import { apiClient } from '@/lib/api-client';

const mockUser = {
    id: 'lec-1',
    fullName: 'TS. Nguyễn Văn Hướng',
    role: 'LECTURER',
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
        post: vi.fn(),
    },
}));

describe('LecturerGradingPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders lecturer rubric evaluation form with weights', () => {
        render(<LecturerGradingPage />);

        expect(screen.getByText('Chấm Điểm & Báo Cáo CLO (Lecturer Grading)')).toBeInTheDocument();
        expect(screen.getByText('1. Nội dung báo cáo tổng kết thực tập')).toBeInTheDocument();
        expect(screen.getByText('2. Năng lực giải quyết bài toán & Sản phẩm hoàn thành')).toBeInTheDocument();
        expect(screen.getByText('3. Khả năng thuyết minh & Trả lời câu hỏi phản biện')).toBeInTheDocument();
    });

    it('submits lecturer score with rubric criteria and comments', async () => {
        (apiClient.post as any).mockResolvedValue({
            data: { success: true },
        });

        render(<LecturerGradingPage />);

        const submitBtn = screen.getByRole('button', { name: /Lưu điểm đánh giá GVHD/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith(
                '/api/v1/evaluations',
                expect.objectContaining({
                    evaluationStage: 'FINAL',
                    rubricVersion: 'CICT-LECTURER-2026',
                })
            );
        });
    });
});
