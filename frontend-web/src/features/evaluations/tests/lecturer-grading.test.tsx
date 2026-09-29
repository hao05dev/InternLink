import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LecturerGradingPage from '@/features/evaluations/components/lecturer-grading-view';
import { apiClient } from '@/lib/api-client';

const mockUser = {
    id: 'lec-1',
    fullName: 'TS. Nguyễn Văn Hướng',
    role: 'LECTURER',
};

const mockStudents = [
    {
        id: 'p-1',
        studentId: 'stu-1',
        studentName: 'Nguyễn Văn A',
        studentCode: 'B2100001',
        companyName: 'FPT Software Cần Thơ',
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
        post: vi.fn(),
    },
}));

describe('LecturerGradingPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (apiClient.get as any).mockResolvedValue({
            data: mockStudents,
        });
    });

    it('renders lecturer rubric evaluation form with weights', async () => {
        render(<LecturerGradingPage />);

        await waitFor(() => {
            expect(screen.getByText('Chấm Điểm & Báo Cáo CLO (Lecturer Grading)')).toBeInTheDocument();
            expect(screen.getByText('1. Nội dung báo cáo tổng kết thực tập')).toBeInTheDocument();
            expect(screen.getByText('2. Năng lực giải quyết bài toán & Sản phẩm hoàn thành')).toBeInTheDocument();
            expect(screen.getByText('3. Khả năng thuyết minh & Trả lời câu hỏi phản biện')).toBeInTheDocument();
        });
    });

    it('submits lecturer score with rubric criteria and comments', async () => {
        (apiClient.post as any).mockResolvedValue({
            data: { success: true },
        });

        render(<LecturerGradingPage />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Lưu điểm đánh giá GVHD/i })).toBeInTheDocument();
        });

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
