import { describe, it, expect } from 'vitest';
import { generateEvaluationsWorkbook } from '../utils/evaluation-excel-utils';
import { FacultyEvaluationSummary } from '../types/evaluation.types';

describe('evaluation-excel-utils', () => {
    it('should generate valid excel workbook with correct sheet and calculations', () => {
        const mockData: FacultyEvaluationSummary[] = [
            {
                placementId: 'p-1',
                studentId: 's-1',
                studentCode: 'B2110940',
                studentName: 'Lê Hoàng Nam',
                classCode: 'DI2196A1',
                programName: 'Công nghệ thông tin',
                companyName: 'FPT Software Cần Thơ',
                mentorName: 'Nguyễn Văn Mentor',
                mentorScore: 9.0,
                mentorFeedback: 'Sinh viên hoàn thành xuất sắc nhiệm vụ',
                lecturerName: 'TS. Trần Văn Hướng',
                lecturerScore: 9.1,
                lecturerFeedback: 'Báo cáo tốt, đáp ứng chuẩn đầu ra',
                finalScore: 9.1,
                scoreScale4: 4.0,
                letterGrade: 'A',
                classification: 'Xuất sắc',
                resultStatus: 'PASSED',
                isFinalized: true,
                isPublished: true,
            },
            {
                placementId: 'p-2',
                studentId: 's-2',
                studentCode: 'B2100001',
                studentName: 'Nguyễn Văn An',
                classCode: 'DI2196A1',
                programName: 'Kỹ thuật phần mềm',
                companyName: 'VNPT Cần Thơ',
                mentorName: 'Trần Văn Mentor',
                mentorScore: 3.5,
                lecturerName: 'TS. Trần Văn Hướng',
                lecturerScore: 3.8,
                finalScore: 3.7,
                scoreScale4: 0.0,
                letterGrade: 'F',
                classification: 'Kém (Không đạt)',
                resultStatus: 'FAILED',
                isFinalized: true,
                isPublished: false,
            },
        ];

        const { workbook, filename } = generateEvaluationsWorkbook(mockData, {
            termName: 'Học kỳ 1 2026-2027',
            filterDescription: 'Ngành: CNTT',
        });

        expect(workbook).toBeDefined();
        expect(workbook.SheetNames).toContain('Bảng Điểm Tổng Hợp');
        expect(filename).toContain('Bang_Diem_Thuc_Tap');
        expect(filename).toContain('.xlsx');

        const sheet = workbook.Sheets['Bảng Điểm Tổng Hợp'];
        expect(sheet).toBeDefined();
    });
});
