import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminAiView from '../components/admin-ai-view';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }));

const run = { id: 'run-old', runType: 'CV_EXTRACTION', status: 'FAILED', studentId: 'student-1',
    studentName: 'Nguyễn Văn An', studentEmail: 'an@ctu.edu.vn', modelName: 'fallback',
    createdAt: '2026-09-29T01:00:00Z', startedAt: '2026-09-29T01:00:00Z',
    completedAt: '2026-09-29T01:00:10Z', canRetry: true };
const detail = { run, inputSnapshot: { text_length: 20 }, outputResult: { status: 'FAILED' },
    errorDetail: { message: 'Dịch vụ AI không kết nối được' } };

function mount() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={client}><AdminAiView /></QueryClientProvider>);
}

describe('Admin AI management', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(apiClient.get).mockImplementation(async endpoint => {
            const data = endpoint.endsWith('/stats') ? { total: 1, completed: 0, failed: 1, pending: 0, running: 0 }
                : endpoint.endsWith('/health') ? { available: false, geminiConfigured: false, checkedAt: '2026-09-29T01:00:00Z' }
                    : endpoint.endsWith('/taxonomy') ? [{ id: 'SK-JAVA', skillName: 'Java', aliases: ['JDK'], category: 'TECHNICAL', framework: 'ESCO', taxonomyVersion: 'v1', isActive: true }]
                        : endpoint.includes('/runs?') ? { content: [run], totalElements: 1, totalPages: 1, number: 0 }
                            : detail;
            return { success: true, data } as never;
        });
    });

    it('shows real API history and unavailable service, and applies server filters', async () => {
        mount();
        await screen.findByText('Nguyễn Văn An');
        expect(await screen.findByText('Không kết nối được')).toBeInTheDocument();
        fireEvent.change(screen.getByLabelText('Trạng thái'), { target: { value: 'FAILED' } });
        await waitFor(() => expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('status=FAILED'), expect.anything()));
        fireEvent.change(screen.getByLabelText('Tìm lượt xử lý'), { target: { value: 'An' } });
        fireEvent.click(screen.getByRole('button', { name: 'Tìm kiếm' }));
        await waitFor(() => expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('search=An'), expect.anything()));
    });

    it('looks up taxonomy aliases', async () => {
        mount();
        fireEvent.click(screen.getByRole('tab', { name: 'Danh mục kỹ năng' }));
        await screen.findByText('Java');
        fireEvent.change(screen.getByLabelText('Tìm kỹ năng'), { target: { value: 'JDK' } });
        expect(screen.getByText('Java')).toBeInTheDocument();
        fireEvent.change(screen.getByLabelText('Tìm kỹ năng'), { target: { value: 'Python' } });
        expect(screen.getByText('Không có kỹ năng phù hợp.')).toBeInTheDocument();
    });

    it('requires CV text and sends retry without claiming a failed run succeeded', async () => {
        vi.mocked(apiClient.post).mockResolvedValue({ success: true, data: { ...detail, run: { ...run, id: 'run-new' } } } as never);
        mount();
        fireEvent.click(await screen.findByRole('button', { name: 'Xem chi tiết lượt run-old' }));
        const dialog = await screen.findByRole('dialog');
        fireEvent.click(await within(dialog).findByRole('button', { name: 'Xử lý lại CV' }));
        expect(within(dialog).getByRole('button', { name: 'Bắt đầu xử lý lại' })).toBeDisabled();
        fireEvent.change(within(dialog).getByLabelText(/Nội dung CV nguồn/), { target: { value: 'Java developer' } });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Bắt đầu xử lý lại' }));
        await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/v1/admin/ai/runs/run-old/retry', { cvText: 'Java developer' }));
        expect(await screen.findByText(/Dịch vụ AI vẫn gặp lỗi/)).toBeInTheDocument();
        expect(screen.queryByText(/Đã xử lý lại CV/)).not.toBeInTheDocument();
    });

    it('shows API failure rather than an empty successful history', async () => {
        vi.mocked(apiClient.get).mockRejectedValue(new Error('Không có quyền truy cập'));
        mount();
        expect(await screen.findByText('Không tải được lịch sử: Không có quyền truy cập')).toBeInTheDocument();
        expect(screen.queryByText('Chưa có lượt xử lý phù hợp.')).not.toBeInTheDocument();
    });

    it('shows a successful retry and the extracted skills', async () => {
        const completed = { ...detail, run: { ...run, id: 'run-new', status: 'COMPLETED', canRetry: false },
            outputResult: { normalized_skills: [{ id: 'SK-JAVA', name: 'Java' }] }, errorDetail: null };
        vi.mocked(apiClient.post).mockResolvedValue({ success: true, data: completed } as never);
        const read = vi.mocked(apiClient.get).getMockImplementation()!;
        vi.mocked(apiClient.get).mockImplementation(async (endpoint, options) => endpoint.endsWith('/runs/run-new')
            ? { success: true, data: completed } as never : read(endpoint, options));
        mount();
        fireEvent.click(await screen.findByRole('button', { name: 'Xem chi tiết lượt run-old' }));
        fireEvent.click(await screen.findByRole('button', { name: 'Xử lý lại CV' }));
        fireEvent.change(screen.getByLabelText(/Nội dung CV nguồn/), { target: { value: 'Java developer' } });
        fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu xử lý lại' }));
        expect(await screen.findByText('Đã xử lý lại CV. Kỹ năng mới đang chờ sinh viên xác nhận.')).toBeInTheDocument();
        expect(await screen.findByText('Java')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Xử lý lại CV' })).not.toBeInTheDocument();
    });
});
