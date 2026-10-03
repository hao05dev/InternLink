import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TermClosedBanner from '../components/term-closed-banner';
import GrantExtensionModal from '../components/modals/grant-extension-modal';
import LecturerStatsBar from '../components/lecturer/lecturer-stats-bar';
import LecturerRosterFilter from '../components/lecturer/lecturer-roster-filter';
import LecturerStudentsTable from '../components/lecturer/lecturer-students-table';
import type { PlacementMeta } from '../types';

vi.mock('../api', () => ({
  portfolioApi: {
    grantExtension: vi.fn().mockResolvedValue({
      data: { id: 'p1', isExtended: true, reportDueAt: '2026-11-01T00:00:00Z' },
    }),
  },
  errorText: (e: any) => e.message || 'Error',
  dateLabel: (d: string) => d,
}));

const mockPlacements: PlacementMeta[] = [
  {
    id: 'p1',
    studentName: 'Nguyen Van A',
    studentCode: 'SV001',
    companyName: 'FPT Software',
    mentorName: 'Tran Mentor',
    lecturerName: 'Dr. Le',
    termId: 'term-1',
    termName: 'HK1 2025-2026',
    termStatus: 'ACTIVE',
    academicYear: '2025-2026',
    semester: 'HK1',
    startDate: '2025-09-01',
    endDate: '2025-12-31',
    status: 'ACTIVE',
    source: 'OFFICIAL',
    hasMentor: true,
    weekCount: 15,
    reportDueAt: '2025-12-25T17:00:00Z',
    isExtended: false,
    components: [],
  },
  {
    id: 'p2',
    studentName: 'Tran Thi B',
    studentCode: 'SV002',
    companyName: 'VNG Corp',
    mentorName: 'Nguyen Mentor',
    lecturerName: 'Dr. Le',
    termId: 'term-2',
    termName: 'HK2 2024-2025',
    termStatus: 'CLOSED',
    academicYear: '2024-2025',
    semester: 'HK2',
    startDate: '2025-01-01',
    endDate: '2025-05-30',
    status: 'COMPLETED',
    source: 'OFFICIAL',
    hasMentor: true,
    weekCount: 15,
    reportDueAt: '2025-06-05T17:00:00Z',
    isExtended: true,
    extensionReason: 'Sinh viên xin thêm thời gian hiệu chỉnh',
    components: [],
  },
];

describe('Lecturer Supervision Components', () => {
  it('renders TermClosedBanner with alert role and term name', () => {
    render(<TermClosedBanner termName="HK2 2024-2025" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Học kỳ "HK2 2024-2025" đã kết thúc và được khóa \(CLOSED\)/i)).toBeInTheDocument();
  });

  it('renders LecturerStatsBar with correct computed metrics', () => {
    render(<LecturerStatsBar placements={mockPlacements} />);
    expect(screen.getByText('Tổng số sinh viên')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Đang thực tập')).toBeInTheDocument();
    expect(screen.getByText('Đã hoàn thành')).toBeInTheDocument();
    expect(screen.getByText('Được gia hạn báo cáo')).toBeInTheDocument();
  });

  it('renders LecturerRosterFilter and handles filter changes', () => {
    const handleChange = vi.fn();
    const handleReset = vi.fn();
    render(
      <LecturerRosterFilter
        years={['2025-2026', '2024-2025']}
        semesters={['HK1', 'HK2']}
        filters={{ academicYear: 'ALL', semester: 'ALL', status: 'ALL', search: '' }}
        onChange={handleChange}
        onReset={handleReset}
      />
    );

    const yearSelect = screen.getByLabelText('Chọn năm học');
    fireEvent.change(yearSelect, { target: { value: '2025-2026' } });
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ academicYear: '2025-2026' }));

    const searchInput = screen.getByLabelText('Tìm kiếm sinh viên');
    fireEvent.change(searchInput, { target: { value: 'Nguyen' } });
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ search: 'Nguyen' }));

    const resetButton = screen.getByRole('button', { name: /Đặt lại bộ lọc/i });
    fireEvent.click(resetButton);
    expect(handleReset).toHaveBeenCalled();
  });

  it('renders LecturerStudentsTable with student rows and navigation link', () => {
    render(<LecturerStudentsTable placements={mockPlacements} />);
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('Tran Thi B')).toBeInTheDocument();
    expect(screen.getByText('FPT Software')).toBeInTheDocument();
    expect(screen.getByText('Học kỳ đóng')).toBeInTheDocument();
    expect(screen.getByText('Đã gia hạn')).toBeInTheDocument();

    const links = screen.getAllByRole('link', { name: /Xem hồ sơ/i });
    expect(links[0]).toHaveAttribute('href', '/lecturer/supervision/p1');
    expect(links[1]).toHaveAttribute('href', '/lecturer/supervision/p2');
  });

  it('handles GrantExtensionModal submission', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();
    const { portfolioApi } = await import('../api');

    render(
      <GrantExtensionModal
        placement={mockPlacements[0]}
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    expect(screen.getByText(/Gia hạn nộp báo cáo thực tập/i)).toBeInTheDocument();

    const reasonInput = screen.getByPlaceholderText(/Nêu rõ lý do/i);
    fireEvent.change(reasonInput, { target: { value: 'Do lỗi hệ thống cần thêm 3 ngày' } });

    const submitBtn = screen.getByRole('button', { name: /Xác nhận gia hạn/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(portfolioApi.grantExtension).toHaveBeenCalledWith('p1', expect.objectContaining({
        reason: 'Do lỗi hệ thống cần thêm 3 ngày',
      }));
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
