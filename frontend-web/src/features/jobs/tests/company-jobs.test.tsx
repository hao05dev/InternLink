import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { CompanyJobsListView } from '@/features/jobs/views/company-jobs-list-view';
import { CompanyJobFormView } from '@/features/jobs/views/company-job-form-view';
import { CompanyJobDetailView } from '@/features/jobs/views/company-job-detail-view';
import { apiClient } from '@/lib/api-client';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => '/company/jobs',
}));

vi.mock('@/features/auth/hooks/use-auth', () => ({
    useAuth: () => ({
        user: {
            id: 'comp-user-1',
            companyId: 'comp-1',
            email: 'contact@fpt.com',
            fullName: 'FPT Software Cần Thơ',
            role: 'COMPANY_REP',
        },
        isAuthenticated: true,
        isLoading: false,
    }),
}));

vi.mock('@/lib/api-client', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
    },
}));

describe('Company Jobs Management & Full-Page Form', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (apiClient.get as any).mockImplementation((url: string) => {
            if (url === '/api/v1/jobs') {
                return Promise.resolve({
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
            }
            if (url === '/api/v1/jobs/job-1') {
                return Promise.resolve({
                    data: {
                        id: 'job-1',
                        title: 'Thực tập sinh Lập trình Web Fullstack',
                        vacancies: 5,
                        location: 'Cần Thơ',
                        stipendAmount: 4000000,
                        status: 'DRAFT',
                        skills: [{ skillName: 'Java' }],
                        description: 'Phát triển backend và frontend',
                    },
                });
            }
            if (url.includes('/api/v1/terms')) {
                return Promise.resolve({
                    data: [{ id: 'term-1', name: 'Học kỳ 1 (2026-2027)', status: 'ACTIVE' }],
                });
            }
            if (url.includes('/api/v1/departments') || url.includes('/api/v1/companies')) {
                return Promise.resolve({
                    data: [{ id: 'dept-1', name: 'Khoa Công Nghệ Thông Tin' }],
                });
            }
            return Promise.resolve({ data: [] });
        });
    });

    it('renders company jobs list with draft status and navigation button', async () => {
        render(<CompanyJobsListView />);

        await waitFor(() => {
            expect(screen.getByText('Quản Lý Vị Trí Tuyển Dụng Thực Tập')).toBeInTheDocument();
        });

        expect(screen.getByText('Thực tập sinh Lập trình Web Fullstack')).toBeInTheDocument();
        expect(screen.getByText(/Chỉ tiêu: 5 SV/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Gửi duyệt/i })).toBeInTheDocument();

        const createLink = screen.getByRole('link', { name: /Đăng tin tuyển dụng mới/i });
        expect(createLink).toHaveAttribute('href', '/company/jobs/new');
    });

    it('submits job for faculty review when clicking "Gửi duyệt"', async () => {
        (apiClient.patch as any).mockResolvedValue({
            data: { success: true },
        });

        render(<CompanyJobsListView />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Gửi duyệt/i })).toBeInTheDocument();
        });

        const submitReviewBtn = screen.getByRole('button', { name: /Gửi duyệt/i });
        fireEvent.click(submitReviewBtn);

        await waitFor(() => {
            expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/jobs/job-1/submit');
        });
    });

    it('renders full-page create form with all input sections', async () => {
        render(<CompanyJobFormView mode="create" />);

        await waitFor(() => {
            expect(screen.getByText('Đăng Tin Tuyển Dụng Mới')).toBeInTheDocument();
        });

        expect(screen.getByLabelText(/Tiêu đề vị trí thực tập \*/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Hình thức làm việc \*/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Chỉ tiêu tiếp nhận \(SV\) \*/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Lưu bản nháp/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Gửi duyệt lên Khoa/i })).toBeInTheDocument();
    });

    it('submits create form and redirects to /company/jobs', async () => {
        (apiClient.post as any).mockResolvedValue({
            data: { id: 'new-job-1' },
        });

        render(<CompanyJobFormView mode="create" />);

        await waitFor(() => {
            expect(screen.getByText('Đăng Tin Tuyển Dụng Mới')).toBeInTheDocument();
        });

        const titleInput = screen.getByLabelText(/Tiêu đề vị trí thực tập \*/i);
        fireEvent.change(titleInput, { target: { value: 'Frontend Developer Intern' } });

        const descTextarea = screen.getByPlaceholderText(/Mô tả các đầu việc chính/i);
        fireEvent.change(descTextarea, { target: { value: 'Mô tả chi tiết công việc' } });

        const saveDraftBtn = screen.getByRole('button', { name: /Lưu bản nháp/i });
        fireEvent.click(saveDraftBtn);

        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith('/api/v1/jobs', expect.objectContaining({
                title: 'Frontend Developer Intern',
                description: 'Mô tả chi tiết công việc',
            }));
            expect(mockPush).toHaveBeenCalledWith('/company/jobs');
        });
    });

    it('renders company job detail view with KPIs and description', async () => {
        render(<CompanyJobDetailView jobId="job-1" />);

        await waitFor(() => {
            expect(screen.getByText('Thực tập sinh Lập trình Web Fullstack')).toBeInTheDocument();
        });

        expect(screen.getByText('5 SV')).toBeInTheDocument();
        expect(screen.getByText('Phát triển backend và frontend')).toBeInTheDocument();
    });
});
