import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import AdminUsersPage from '@/features/administration/components/admin-users-view';
import { apiClient } from '@/lib/api-client';

vi.mock('@/features/auth/hooks/use-auth', () => ({ useAuth: () => ({ user: { id: 'admin-1', role: 'ADMIN' } }) }));
vi.mock('@/lib/api-client', () => ({ apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }));

const users = [
    { id: 'admin-1', email: 'admin@ctu.edu.vn', fullName: 'Quản trị', role: 'ADMIN', isActive: true },
    { id: 'faculty-1', email: 'khoa@ctu.edu.vn', fullName: 'Quản lý khoa', role: 'FACULTY_ADMIN', departmentId: 'dept-1', isActive: true },
];

describe('AdminUsersPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(apiClient.get).mockImplementation(async endpoint => ({ success: true, data: endpoint.includes('/admin/users') ? users : endpoint.includes('departments') ? [{ id: 'dept-1', name: 'CNTT' }] : [] } as never));
        vi.mocked(apiClient.put).mockResolvedValue({ success: true, data: null } as never);
    });

    it('loads users from the admin API and filters the list', async () => {
        render(<AdminUsersPage />);
        await screen.findByText(/khoa@ctu.edu.vn/);
        expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/users');
        fireEvent.change(screen.getByPlaceholderText('Tìm tên, email hoặc vai trò'), { target: { value: 'khoa@' } });
        expect(screen.queryByText(/admin@ctu.edu.vn/)).not.toBeInTheDocument();
    });

    it('persists account lock through the API', async () => {
        render(<AdminUsersPage />);
        await screen.findByText(/khoa@ctu.edu.vn/);
        fireEvent.click(screen.getAllByRole('button', { name: 'Khóa' }).find(button => !button.hasAttribute('disabled'))!);
        await waitFor(() => expect(apiClient.put).toHaveBeenCalledWith('/api/v1/admin/users/faculty-1', expect.objectContaining({ isActive: false })));
    });
});
