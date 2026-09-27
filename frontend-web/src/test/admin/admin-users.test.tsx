import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import AdminUsersPage from '@/app/(admin)/admin/users/page';

const mockUser = {
    id: 'admin-1',
    fullName: 'Quản Trị Viên',
    role: 'ADMIN',
};

vi.mock('@/context/auth-context', () => ({
    useAuth: () => ({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
    }),
}));

describe('AdminUsersPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders user management table across all 6 roles', () => {
        render(<AdminUsersPage />);

        expect(screen.getByText('Quản Lý Người Dùng & Phân Quyền (RBAC)')).toBeInTheDocument();
        expect(screen.getByText('admin@ctu.edu.vn')).toBeInTheDocument();
        expect(screen.getByText('bql.cict@ctu.edu.vn')).toBeInTheDocument();
        expect(screen.getByText('TS. Nguyễn Văn Hướng')).toBeInTheDocument();
        expect(screen.getByText('Trần Minh Hoàng')).toBeInTheDocument();
    });

    it('filters users by search query', () => {
        render(<AdminUsersPage />);

        const searchInput = screen.getByPlaceholderText(/Tìm theo họ tên hoặc email/i);
        fireEvent.change(searchInput, { target: { value: 'nvhuong' } });

        expect(screen.getByText('TS. Nguyễn Văn Hướng')).toBeInTheDocument();
        expect(screen.queryByText('Trần Minh Hoàng')).not.toBeInTheDocument();
    });

    it('toggles user lock/unlock status', () => {
        render(<AdminUsersPage />);

        const lockBtns = screen.getAllByRole('button', { name: /Khóa/i });
        fireEvent.click(lockBtns[0]);

        expect(screen.getByText('Cập nhật trạng thái kích hoạt tài khoản thành công.')).toBeInTheDocument();
    });
});
