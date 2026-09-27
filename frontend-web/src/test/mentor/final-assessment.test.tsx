import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import MentorFinalAssessmentPage from '@/app/(mentor)/mentor/final-assessment/page';
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
        post: vi.fn(),
    },
}));

describe('MentorFinalAssessmentPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders rubric evaluation form with standard 5 criteria', () => {
        render(<MentorFinalAssessmentPage />);

        expect(screen.getByText(/Đánh Giá Thực Tập Cuối Kỳ/i)).toBeInTheDocument();
        expect(screen.getByText(/Ý thức kỷ luật, chuyên cần/i)).toBeInTheDocument();
        expect(screen.getByText(/Năng lực chuyên môn & Kỹ năng kỹ thuật/i)).toBeInTheDocument();
        expect(screen.getByText(/Tinh thần đồng đội & Kỹ năng giao tiếp/i)).toBeInTheDocument();
        expect(screen.getByText(/Tính chủ động và tinh thần cầu tiến/i)).toBeInTheDocument();
        expect(screen.getByText(/Đóng góp cụ thể cho sản phẩm/i)).toBeInTheDocument();
    });

    it('submits rubric assessment with calculated final score', async () => {
        (apiClient.post as any).mockResolvedValue({
            data: { success: true },
        });

        render(<MentorFinalAssessmentPage />);

        const submitBtn = screen.getByRole('button', { name: /Gửi đánh giá Rubric/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith(
                '/api/v1/evaluations',
                expect.objectContaining({
                    evaluationStage: 'FINAL',
                    rubricVersion: 'CICT-RUBRIC-2026-V1',
                })
            );
        });
    });
});
