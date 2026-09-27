import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import StudentProfilePage from '@/app/(student)/student/profile/page';
import { apiClient } from '@/lib/api-client';

const mockUser = {
    id: 'std-user-1',
    email: 'nguyenvana@ctu.edu.vn',
    fullName: 'Nguyễn Văn A',
    role: 'STUDENT',
};

// Mock AuthContext
vi.mock('@/context/auth-context', () => ({
    useAuth: () => ({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
    }),
}));

// Mock API Client
vi.mock('@/lib/api-client', () => ({
    apiClient: {
        get: vi.fn(),
        put: vi.fn(),
        upload: vi.fn(),
    },
}));

describe('StudentProfilePage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (apiClient.get as any).mockImplementation((url: string) => {
            if (url.includes('/academic-programs')) {
                return Promise.resolve({
                    data: [
                        { id: 'prog-1', name: 'Kỹ thuật phần mềm', code: '7480103' },
                        { id: 'prog-2', name: 'Khoa học máy tính', code: '7480101' },
                    ],
                });
            }
            if (url.includes('/students/me/profile')) {
                return Promise.resolve({
                    data: {
                        userId: 'std-user-1',
                        studentCode: 'B2101234',
                        fullName: 'Nguyễn Văn A',
                        email: 'nguyenvana@ctu.edu.vn',
                        phoneNumber: '0912345678',
                        programId: 'prog-1',
                        gpa: 3.5,
                        githubUrl: 'https://github.com/nguyenvana',
                        bio: 'Sinh viên năm cuối ngành Kỹ thuật phần mềm.',
                        preferences: {
                            skills: ['Java', 'Spring Boot', 'React'],
                        },
                        cvFileName: 'CV_NguyenVanA.pdf',
                    },
                });
            }
            return Promise.resolve({ data: null });
        });
    });

    it('renders profile form with populated data from API', async () => {
        render(<StudentProfilePage />);

        // Wait for profile data to load
        await waitFor(() => {
            expect(screen.getByText('Hồ sơ & Kỹ năng Sinh viên')).toBeInTheDocument();
        });

        // Check form inputs
        const mssvInput = screen.getByLabelText(/Mã số sinh viên/i) as HTMLInputElement;
        expect(mssvInput.value).toBe('B2101234');

        const gpaInput = screen.getByLabelText(/Điểm trung bình tích lũy/i) as HTMLInputElement;
        expect(gpaInput.value).toBe('3.5');

        // Check skills badges rendered
        expect(screen.getByText('Java')).toBeInTheDocument();
        expect(screen.getByText('Spring Boot')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('allows adding and removing skills dynamically', async () => {
        render(<StudentProfilePage />);

        await waitFor(() => {
            expect(screen.getByText('Java')).toBeInTheDocument();
        });

        // Add a new skill via suggested button
        const dockerSuggestion = screen.getByRole('button', { name: /\+ Docker/i });
        fireEvent.click(dockerSuggestion);

        expect(screen.getByText('Docker')).toBeInTheDocument();

        // Remove a skill
        const removeJavaBtn = screen.getByRole('button', { name: /Xóa Java/i });
        fireEvent.click(removeJavaBtn);

        expect(screen.queryByText('Java')).not.toBeInTheDocument();
    });

    it('submits updated profile when clicking save', async () => {
        (apiClient.put as any).mockResolvedValue({
            data: { success: true },
        });

        render(<StudentProfilePage />);

        await waitFor(() => {
            expect(screen.getByText('Hồ sơ & Kỹ năng Sinh viên')).toBeInTheDocument();
        });

        const saveButton = screen.getByRole('button', { name: /Lưu thông tin hồ sơ/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(apiClient.put).toHaveBeenCalledWith(
                '/api/v1/students/me/profile',
                expect.objectContaining({
                    studentCode: 'B2101234',
                    gpa: 3.5,
                })
            );
        });
    });
});
