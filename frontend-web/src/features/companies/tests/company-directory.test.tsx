import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CompanyDirectoryView from '@/features/companies/components/company-directory-view';
import { formatCompanyAddress } from '@/features/companies/types/company.types';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
    apiClient: {
        get: vi.fn(),
    },
}));

vi.mock('@/features/auth/hooks/use-auth', () => ({
    useAuth: () => ({
        user: null,
        isLoading: false,
        isAuthenticated: false,
    }),
}));

describe('formatCompanyAddress', () => {
    it('formats object address with street, ward, district, province correctly', () => {
        const addressObj = {
            street: '123 Đường 3/2',
            ward: 'Phường Xuân Khánh',
            district: 'Quận Ninh Kiều',
            province: 'TP. Cần Thơ',
        };
        expect(formatCompanyAddress(addressObj)).toBe('123 Đường 3/2, Phường Xuân Khánh, Quận Ninh Kiều, TP. Cần Thơ');
    });

    it('handles string address directly', () => {
        expect(formatCompanyAddress('Khu II, Đại học Cần Thơ')).toBe('Khu II, Đại học Cần Thơ');
    });

    it('returns empty string for null or undefined', () => {
        expect(formatCompanyAddress(null)).toBe('');
        expect(formatCompanyAddress(undefined)).toBe('');
    });
});

describe('CompanyDirectoryView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders company with object address without runtime errors', async () => {
        (apiClient.get as any).mockResolvedValueOnce({
            data: [
                {
                    id: 'comp-1',
                    companyName: 'FPT Software Cần Thơ',
                    industry: 'Công nghệ thông tin',
                    verificationStatus: 'VERIFIED',
                    address: {
                        street: 'Số 1 Nguyễn Văn Cừ',
                        ward: 'An Bình',
                        district: 'Ninh Kiều',
                        province: 'Cần Thơ',
                    },
                    website: 'https://fptsoftware.com',
                },
            ],
        });

        render(<CompanyDirectoryView />);

        await waitFor(() => {
            expect(screen.getByText('FPT Software Cần Thơ')).toBeInTheDocument();
        });

        expect(screen.getByText('Số 1 Nguyễn Văn Cừ, An Bình, Ninh Kiều, Cần Thơ')).toBeInTheDocument();
        expect(screen.getByText('Đã xác minh')).toBeInTheDocument();
    });
});
