import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MentorRosterFilter from '../components/mentor/mentor-roster-filter';
import MentorRecordsTable from '../components/mentor/mentor-records-table';
import MentorWeeklyTable from '../components/mentor/mentor-weekly-table';
import MentorAssessmentTable from '../components/mentor/mentor-assessment-table';
import type { PlacementMeta } from '../types';

const mockPlacements: PlacementMeta[] = [
  {
    id: 'p1',
    studentName: 'Le Hoang C',
    studentCode: 'B2100003',
    companyName: 'VNPT Software',
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
    studentName: 'Pham Van D',
    studentCode: 'B2100004',
    companyName: 'VNPT Software',
    mentorName: 'Tran Mentor',
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
    components: [],
  },
];

describe('Mentor Supervision Master-Detail Components', () => {
  it('renders MentorRosterFilter and handles filter and search triggers', () => {
    const handleChange = vi.fn();
    const handleReset = vi.fn();

    render(
      <MentorRosterFilter
        years={['2025', '2024']}
        terms={['HK1 2025-2026', 'HK2 2024-2025']}
        filters={{ year: 'ALL', term: 'ALL', status: 'ALL', search: '' }}
        onChange={handleChange}
        onReset={handleReset}
      />
    );

    const yearSelect = screen.getByLabelText('Chọn năm thực tập');
    fireEvent.change(yearSelect, { target: { value: '2025' } });
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ year: '2025' }));

    const searchInput = screen.getByLabelText('Tìm kiếm thực tập sinh');
    fireEvent.change(searchInput, { target: { value: 'Pham' } });
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ search: 'Pham' }));

    const resetBtn = screen.getByRole('button', { name: /Đặt lại bộ lọc/i });
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalled();
  });

  it('renders MentorRecordsTable with navigation links to /mentor/internship-record/[id]', () => {
    render(<MentorRecordsTable placements={mockPlacements} />);
    expect(screen.getByText('Le Hoang C')).toBeInTheDocument();
    expect(screen.getByText('Pham Van D')).toBeInTheDocument();
    expect(screen.getByText('Học kỳ đóng')).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    const recordLinks = links.filter(l => l.getAttribute('href')?.startsWith('/mentor/internship-record/'));
    expect(recordLinks.length).toBe(2);
    expect(recordLinks[0]).toHaveAttribute('href', '/mentor/internship-record/p1');
    expect(recordLinks[1]).toHaveAttribute('href', '/mentor/internship-record/p2');
  });

  it('renders MentorWeeklyTable with navigation links to /mentor/weekly-evaluations/[id]', () => {
    render(<MentorWeeklyTable placements={mockPlacements} />);
    expect(screen.getByText('Le Hoang C')).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    const weeklyLinks = links.filter(l => l.getAttribute('href')?.startsWith('/mentor/weekly-evaluations/'));
    expect(weeklyLinks.length).toBe(2);
    expect(weeklyLinks[0]).toHaveAttribute('href', '/mentor/weekly-evaluations/p1');
    expect(weeklyLinks[1]).toHaveAttribute('href', '/mentor/weekly-evaluations/p2');
  });

  it('renders MentorAssessmentTable with navigation links to /mentor/final-assessment/[id]', () => {
    render(<MentorAssessmentTable placements={mockPlacements} />);
    expect(screen.getByText('Pham Van D')).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    const assessmentLinks = links.filter(l => l.getAttribute('href')?.startsWith('/mentor/final-assessment/'));
    expect(assessmentLinks.length).toBe(2);
    expect(assessmentLinks[0]).toHaveAttribute('href', '/mentor/final-assessment/p1');
    expect(assessmentLinks[1]).toHaveAttribute('href', '/mentor/final-assessment/p2');
  });
});
