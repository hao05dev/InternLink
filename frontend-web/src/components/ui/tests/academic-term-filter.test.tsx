import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AcademicTermFilter, formatSemesterLabel } from '../academic-term-filter';

describe('AcademicTermFilter Component', () => {
    const mockTerms = [
        {
            id: 'term-1',
            code: 'HK1_2026_2027',
            termName: 'Học kỳ 1 - Năm học 2026-2027',
            academicYear: '2026-2027',
            semester: '1',
            status: 'ACTIVE',
        },
        {
            id: 'term-2',
            code: 'HK2_2026_2027',
            termName: 'Học kỳ 2 - Năm học 2026-2027',
            academicYear: '2026-2027',
            semester: '2',
            status: 'DRAFT',
        },
        {
            id: 'term-3',
            code: 'HK1_2025_2026',
            termName: 'Học kỳ 1 - Năm học 2025-2026',
            academicYear: '2025-2026',
            semester: '1',
            status: 'CLOSED',
        },
    ];

    it('formats semester labels cleanly', () => {
        expect(formatSemesterLabel({ id: '1', semester: '1' })).toBe('Học kỳ 1');
        expect(formatSemesterLabel({ id: '2', semester: '2' })).toBe('Học kỳ 2');
        expect(formatSemesterLabel({ id: '3', semester: '3' })).toBe('Học kỳ Hè (HK3)');
        expect(formatSemesterLabel({ id: '4', semester: 'SUMMER' })).toBe('Học kỳ Hè (HK3)');
    });

    it('renders separate year and semester select options', () => {
        const handleTermChange = vi.fn();
        render(
            <AcademicTermFilter
                terms={mockTerms}
                selectedTermId="term-1"
                onTermChange={handleTermChange}
                variant="stacked"
            />
        );

        const yearSelect = screen.getByLabelText('Chọn năm học');
        const semesterSelect = screen.getByLabelText('Chọn học kỳ');

        expect(yearSelect).toBeInTheDocument();
        expect(semesterSelect).toBeInTheDocument();
        expect(yearSelect).toHaveValue('2026-2027');
        expect(semesterSelect).toHaveValue('term-1');
    });

    it('switches academic year and triggers onTermChange with a term from that year', () => {
        const handleTermChange = vi.fn();
        render(
            <AcademicTermFilter
                terms={mockTerms}
                selectedTermId="term-1"
                onTermChange={handleTermChange}
                variant="inline"
            />
        );

        const yearSelect = screen.getByLabelText('Chọn năm học');
        fireEvent.change(yearSelect, { target: { value: '2025-2026' } });

        expect(handleTermChange).toHaveBeenCalledWith('term-3');
    });

    it('changes semester within the same academic year', () => {
        const handleTermChange = vi.fn();
        render(
            <AcademicTermFilter
                terms={mockTerms}
                selectedTermId="term-1"
                onTermChange={handleTermChange}
                variant="grid"
            />
        );

        const semesterSelect = screen.getByLabelText('Chọn học kỳ');
        fireEvent.change(semesterSelect, { target: { value: 'term-2' } });

        expect(handleTermChange).toHaveBeenCalledWith('term-2');
    });
});
