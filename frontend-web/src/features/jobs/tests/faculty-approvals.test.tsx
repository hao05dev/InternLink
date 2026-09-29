import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import FacultyJobApprovalsPage from '@/features/jobs/components/faculty-job-approvals-view';
import { apiClient } from '@/lib/api-client';

const mockUser = {
    id: 'fac-1',
    fullName: 'Ban Quản Lý Thực Tập Khoa',
    role: 'FACULTY_ADMIN',
};

const mockPendingJobs = [
    {
        id: 'job-pending-1',
        title: 'Kỹ sư Kiểm thử Phần mềm Thực tập (QA/QC Intern)',
        companyName: 'FPT Software Cần Thơ',
        workFormat: 'ONSITE',
        quota: 5,
        submittedAt: '2026-09-20',
        status: 'PENDING_APPROVAL',
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

describe('FacultyJobApprovalsPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (apiClient.get as any).mockResolvedValue({
            data: mockPendingJobs,
        });
    });

    it('renders pending job postings queue', async () => {
        render(<FacultyJobApprovalsPage />);

        expect(screen.getByText('Phê Duyệt Tin Tuyển Dụng Doanh Nghiệp')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('FPT Software Cần Thơ')).toBeInTheDocument();
            expect(screen.getByText('Kỹ sư Kiểm thử Phần mềm Thực tập (QA/QC Intern)')).toBeInTheDocument();
        });
        expect(screen.getAllByRole('button', { name: /Phê duyệt/i }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole('button', { name: /Từ chối/i }).length).toBeGreaterThan(0);
    });

    it('opens approval modal and confirms job approval', async () => {
        (apiClient.patch as any).mockResolvedValue({
            data: { success: true },
        });

        render(<FacultyJobApprovalsPage />);

        await waitFor(() => {
            expect(screen.getByText('FPT Software Cần Thơ')).toBeInTheDocument();
        });

        const approveBtns = screen.getAllByRole('button', { name: /Phê duyệt/i });
        fireEvent.click(approveBtns[0]);

        expect(screen.getByText('Xác nhận phê duyệt tin tuyển dụng')).toBeInTheDocument();

        const confirmBtn = screen.getByRole('button', { name: /Xác nhận Phê duyệt/i });
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(apiClient.patch).toHaveBeenCalledWith(
                expect.stringContaining('/review?status=APPROVED')
            );
        });
    });
});
