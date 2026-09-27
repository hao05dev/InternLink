import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import CompanyJobsPage from '@/app/(company)/company/jobs/page';
import { apiClient } from '@/lib/api-client';

const mockUser = {
    id: 'comp-user-1',
    email: 'contact@fpt.com',
    fullName: 'FPT Software Cần Thơ',
    role: 'COMPANY_REP',
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
        post: vi.fn(),
        patch: vi.fn(),
    },
}));

describe('CompanyJobsPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (apiClient.get as any).mockResolvedValue({
            data: [
                {
                    id: 'job-1',
                    title: 'Thực tập sinh Lập trình Web Fullstack',
                    vacancies: 5,
                    location: 'Cần Thơ',
                    stipendAmount: 4000000,
                    status: 'DRAFT',
                    skills: [{ skillName: 'Java' }],
                    description: 'Phát triển backend và frontend',
                },
            ],
        });
    });

    it('renders company jobs list with draft status and action buttons', async () => {
        render(<CompanyJobsPage />);

        await waitFor(() => {
            expect(screen.getByText('Quản Lý Vị Trí Tuyển Dụng Thực Tập')).toBeInTheDocument();
        });

        expect(screen.getByText('Thực tập sinh Lập trình Web Fullstack')).toBeInTheDocument();
        expect(screen.getByText(/Chỉ tiêu: 5 sinh viên/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Gửi duyệt lên Khoa/i })).toBeInTheDocument();
    });

    it('submits job for faculty review when clicking "Gửi duyệt lên Khoa"', async () => {
        (apiClient.patch as any).mockResolvedValue({
            data: { success: true },
        });

        render(<CompanyJobsPage />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Gửi duyệt lên Khoa/i })).toBeInTheDocument();
        });

        const submitReviewBtn = screen.getByRole('button', { name: /Gửi duyệt lên Khoa/i });
        fireEvent.click(submitReviewBtn);

        await waitFor(() => {
            expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/jobs/job-1/submit');
        });
    });

    it('opens create job modal when clicking "Đăng tin tuyển dụng mới"', async () => {
        render(<CompanyJobsPage />);

        await waitFor(() => {
            expect(screen.getByText('Quản Lý Vị Trí Tuyển Dụng Thực Tập')).toBeInTheDocument();
        });

        const createBtn = screen.getByRole('button', { name: /Đăng tin tuyển dụng mới/i });
        fireEvent.click(createBtn);

        expect(screen.getByText('Đăng tin tuyển dụng thực tập mới')).toBeInTheDocument();
        expect(screen.getByLabelText(/Tiêu đề vị trí thực tập/i)).toBeInTheDocument();
    });
});
