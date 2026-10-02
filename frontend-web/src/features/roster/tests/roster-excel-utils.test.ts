import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { parseRosterExcelFile, downloadRosterTemplate } from '../utils/roster-excel-utils';
import { AcademicProgramOption } from '../types/roster.types';

describe('Roster Excel Utilities', () => {
    const mockPrograms: AcademicProgramOption[] = [
        { id: 'prog-1', code: 'CNTT', name: 'Công nghệ thông tin' },
        { id: 'prog-2', code: 'KTPM', name: 'Kỹ thuật phần mềm' },
    ];

    it('creates and parses a valid Excel workbook with auto email derivation', async () => {
        const rows = [
            {
                'MSSV': 'B2100001',
                'Họ và tên': 'Nguyễn Văn An',
                'Email': '', // Empty to test derivation
                'Mã ngành': 'CNTT',
                'Khóa học': 'Khóa 47',
                'Mã lớp': 'DI2196A1',
                'Mã học phần': 'CT250',
                'Trạng thái': 'ELIGIBLE',
                'Ghi chú': 'Đủ điều kiện',
            },
            {
                'MSSV': 'B2100002',
                'Họ và tên': 'Trần Thị Bình',
                'Email': 'binhb2100002@student.ctu.edu.vn',
                'Mã ngành': 'KTPM',
                'Khóa học': '', // Empty to test derivation
                'Mã lớp': 'DI2196A2',
                'Mã học phần': 'CT250',
                'Trạng thái': 'ELIGIBLE',
                'Ghi chú': '',
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
        const file = new File([buffer], 'test_roster.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const result = await parseRosterExcelFile(file, mockPrograms);

        expect(result.totalRows).toBe(2);
        expect(result.validCount).toBe(2);
        expect(result.errorCount).toBe(0);

        // Check derived email
        expect(result.validPayloads[0].officialEmail).toBe('anb2100001@student.ctu.edu.vn');
        expect(result.validPayloads[0].programId).toBe('prog-1');

        // Check derived academic year
        expect(result.validPayloads[1].academicYear).toBe('Khóa 47');
        expect(result.validPayloads[1].programId).toBe('prog-2');
    });

    it('catches validation errors for duplicate MSSV and invalid program code', async () => {
        const rows = [
            {
                'MSSV': 'B2100001',
                'Họ và tên': 'Nguyễn Văn An',
                'Mã ngành': 'CNTT',
            },
            {
                'MSSV': 'B2100001', // Duplicate MSSV
                'Họ và tên': 'Nguyễn Văn An 2',
                'Mã ngành': 'CNTT',
            },
            {
                'MSSV': 'B2100003',
                'Họ và tên': 'Lê Văn C',
                'Mã ngành': 'INVALID_CODE', // Invalid program
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
        const file = new File([buffer], 'test_errors.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const result = await parseRosterExcelFile(file, mockPrograms);

        expect(result.totalRows).toBe(3);
        expect(result.validCount).toBe(1);
        expect(result.errorCount).toBe(2);
        expect(result.rows[1].isValid).toBe(false);
        expect(result.rows[1].errors.some(e => e.includes('trùng lặp'))).toBe(true);
        expect(result.rows[2].isValid).toBe(false);
        expect(result.rows[2].errors.some(e => e.includes('Không tìm thấy ngành'))).toBe(true);
    });
});
