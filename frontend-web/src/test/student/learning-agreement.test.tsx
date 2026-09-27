import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import StudentLearningAgreementPage from '@/app/(student)/student/learning-agreement/page';
import { apiClient } from '@/lib/api-client';

const mockUser = {
    id: 'std-1',
    fullName: 'Nguyễn Văn A',
    role: 'STUDENT',
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

describe('StudentLearningAgreementPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (apiClient.get as any).mockResolvedValue({
            data: [
                {
                    id: 'la-100',
                    studentId: 'std-1',
                    studentName: 'Nguyễn Văn A',
                    studentCode: 'B2101234',
                    companyName: 'FPT Software Cần Thơ',
                    companyAddress: 'KDC Nam Long, Cần Thơ',
                    mentorName: 'Trần Minh Hoàng',
                    mentorEmail: 'hoangtm@fpt.com',
                    facultyName: 'Khoa CNTT&TT - ĐH Cần Thơ',
                    startDate: '2026-10-01',
                    endDate: '2026-12-25',
                    workingDays: 'Thứ 2 - Thứ 6',
                    status: 'PENDING_STUDENT',
                    createdAt: '2026-09-20T00:00:00Z',
                },
            ],
        });
    });

    it('renders tripartite agreement with parties info and pending student status', async () => {
        render(<StudentLearningAgreementPage />);

        await waitFor(() => {
            expect(screen.getByText(/Thỏa Thuận Thực Tập 3 Bên/i)).toBeInTheDocument();
        });

        expect(screen.getByText('BÊN A: SINH VIÊN')).toBeInTheDocument();
        expect(screen.getByText('BÊN B: DOANH NGHIỆP')).toBeInTheDocument();
        expect(screen.getByText('BÊN C: NHÀ TRƯỜNG')).toBeInTheDocument();
        expect(screen.getByText('FPT Software Cần Thơ')).toBeInTheDocument();
    });

    it('opens signature modal and triggers sign agreement API', async () => {
        (apiClient.patch as any).mockResolvedValue({
            data: { success: true },
        });

        render(<StudentLearningAgreementPage />);

        await waitFor(() => {
            expect(screen.getByText(/Ký xác nhận thỏa thuận/i)).toBeInTheDocument();
        });

        // Open sign modal
        const signBtn = screen.getByRole('button', { name: /Ký xác nhận thỏa thuận/i });
        fireEvent.click(signBtn);

        expect(screen.getByText(/Xác nhận Ký số Thỏa thuận thực tập 3 bên/i)).toBeInTheDocument();

        // Check consent checkbox
        const consentCheckbox = screen.getByRole('checkbox');
        fireEvent.click(consentCheckbox);

        // Click confirm sign button
        const confirmBtn = screen.getByRole('button', { name: /Xác nhận Ký thỏa thuận/i });
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(apiClient.patch).toHaveBeenCalledWith(
                '/api/v1/agreements/la-100/sign',
                expect.any(Object)
            );
        });
    });
});
