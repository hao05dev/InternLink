import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LecturerGradingStats from '../components/lecturer/lecturer-grading-stats';
import LecturerGradingTable from '../components/lecturer/lecturer-grading-table';
import LecturerRecordsTable from '@/features/portfolio/components/lecturer/lecturer-records-table';
import type { PlacementMeta } from '@/features/portfolio/types';

const mockPlacements: PlacementMeta[] = [
  {
    id: 'p1',
    studentName: 'Nguyen Van A',
    studentCode: 'B2100001',
    companyName: 'FPT Telecom',
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
    studentCode: 'B2100002',
    companyName: 'VNPT Can Tho',
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
    extensionReason: 'Xin thêm thời gian chỉnh sửa',
    components: [],
  },
];

describe('Lecturer Grading & Records Master-Detail Components', () => {
  it('renders LecturerGradingStats with correct metric calculations', () => {
    render(<LecturerGradingStats placements={mockPlacements} />);
    expect(screen.getByText('Tổng số sinh viên')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Đã hoàn thành điểm')).toBeInTheDocument();
    expect(screen.getByText('Chưa hoàn tất chấm')).toBeInTheDocument();
    expect(screen.getByText('Hồ sơ đã gia hạn')).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBe(3);
  });

  it('renders LecturerGradingTable with student rows and navigation links to /lecturer/grading/[id]', () => {
    render(<LecturerGradingTable placements={mockPlacements} />);
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('B2100001')).toBeInTheDocument();
    expect(screen.getByText('FPT Telecom')).toBeInTheDocument();
    expect(screen.getByText('Học kỳ đóng')).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    const gradingLinks = links.filter(l => l.getAttribute('href')?.startsWith('/lecturer/grading/'));
    expect(gradingLinks.length).toBe(2);
    expect(gradingLinks[0]).toHaveAttribute('href', '/lecturer/grading/p1');
    expect(gradingLinks[1]).toHaveAttribute('href', '/lecturer/grading/p2');
  });

  it('renders LecturerRecordsTable with student rows and navigation links to /lecturer/internship-record/[id]', () => {
    render(<LecturerRecordsTable placements={mockPlacements} />);
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('Tran Thi B')).toBeInTheDocument();
    expect(screen.getByText('VNPT Can Tho')).toBeInTheDocument();
    expect(screen.getByText('Đã gia hạn')).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    const recordLinks = links.filter(l => l.getAttribute('href')?.startsWith('/lecturer/internship-record/'));
    expect(recordLinks.length).toBe(2);
    expect(recordLinks[0]).toHaveAttribute('href', '/lecturer/internship-record/p1');
    expect(recordLinks[1]).toHaveAttribute('href', '/lecturer/internship-record/p2');
  });
});
