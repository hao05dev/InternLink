import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CompanyCandidateFilterBar } from '../components/company/company-candidate-filter-bar';

describe('CompanyCandidateFilterBar Component', () => {
    const mockProps = {
        searchTerm: '',
        onSearchChange: vi.fn(),
        selectedAcademicYear: 'ALL',
        academicYearsList: ['2026-2027', '2025-2026'],
        onAcademicYearChange: vi.fn(),
        selectedTermId: 'ALL',
        termsList: [
            { id: 'term-1', name: 'Học kỳ Fall 2026', academicYear: '2026-2027' },
            { id: 'term-2', name: 'Học kỳ Spring 2026', academicYear: '2025-2026' },
        ],
        onTermChange: vi.fn(),
        selectedJobId: 'ALL',
        jobsList: [
            { id: 'job-1', title: 'Backend Intern' },
            { id: 'job-2', title: 'Frontend Intern' },
        ],
        onJobChange: vi.fn(),
        statusFilter: 'ALL',
        statusStages: [
            { id: 'PENDING', label: 'Hồ sơ mới' },
            { id: 'SHORTLISTED', label: 'Đang xem xét' },
        ],
        onStatusFilterChange: vi.fn(),
        totalCount: 15,
        filteredCount: 10,
        hasActiveFilters: false,
        onResetFilters: vi.fn(),
    };

    it('renders all filter controls with counts correctly', () => {
        render(<CompanyCandidateFilterBar {...mockProps} />);

        // Counter check
        expect(screen.getByText(/Đang lọc:/i)).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText(/15 ứng viên/i)).toBeInTheDocument();

        // Search input
        expect(screen.getByPlaceholderText(/Tìm ứng viên theo tên, MSSV, vị trí, kỹ năng.../i)).toBeInTheDocument();

        // Labels
        expect(screen.getByText('Niên khóa')).toBeInTheDocument();
        expect(screen.getByText('Học kỳ')).toBeInTheDocument();
        expect(screen.getByText('Vị trí tuyển dụng')).toBeInTheDocument();
        expect(screen.getByText('Trạng thái ứng tuyển')).toBeInTheDocument();

        // Options
        expect(screen.getByText('Tất cả niên khóa (2)')).toBeInTheDocument();
        expect(screen.getByText('Niên khóa 2026-2027')).toBeInTheDocument();
        expect(screen.getByText('Backend Intern')).toBeInTheDocument();
        expect(screen.getByText('Học kỳ Fall 2026')).toBeInTheDocument();
    });

    it('triggers callbacks on user input and selection changes', () => {
        render(<CompanyCandidateFilterBar {...mockProps} />);

        // Search input change
        const searchInput = screen.getByPlaceholderText(/Tìm ứng viên/i);
        fireEvent.change(searchInput, { target: { value: 'Nguyen Van A' } });
        expect(mockProps.onSearchChange).toHaveBeenCalledWith('Nguyen Van A');

        // Select academic year
        const yearSelect = screen.getByDisplayValue('Tất cả niên khóa (2)');
        fireEvent.change(yearSelect, { target: { value: '2026-2027' } });
        expect(mockProps.onAcademicYearChange).toHaveBeenCalledWith('2026-2027');

        // Select term
        const termSelect = screen.getByDisplayValue('Tất cả học kỳ (2)');
        fireEvent.change(termSelect, { target: { value: 'term-1' } });
        expect(mockProps.onTermChange).toHaveBeenCalledWith('term-1');

        // Select job
        const jobSelect = screen.getByDisplayValue('Tất cả vị trí (2)');
        fireEvent.change(jobSelect, { target: { value: 'job-1' } });
        expect(mockProps.onJobChange).toHaveBeenCalledWith('job-1');

        // Select status
        const statusSelect = screen.getByDisplayValue('Tất cả trạng thái');
        fireEvent.change(statusSelect, { target: { value: 'PENDING' } });
        expect(mockProps.onStatusFilterChange).toHaveBeenCalledWith('PENDING');
    });

    it('displays reset button when active filters exist and triggers callback on click', () => {
        const { rerender } = render(<CompanyCandidateFilterBar {...mockProps} hasActiveFilters={false} />);
        expect(screen.queryByText('Đặt lại bộ lọc')).not.toBeInTheDocument();

        rerender(<CompanyCandidateFilterBar {...mockProps} hasActiveFilters={true} />);
        const resetBtn = screen.getByText('Đặt lại bộ lọc');
        expect(resetBtn).toBeInTheDocument();

        fireEvent.click(resetBtn);
        expect(mockProps.onResetFilters).toHaveBeenCalledTimes(1);
    });
});
