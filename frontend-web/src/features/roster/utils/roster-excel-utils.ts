import * as XLSX from 'xlsx';
import { AcademicProgramOption } from '../types/roster.types';
import { deriveAcademicYear, deriveEmail } from './roster-helpers';

export interface StudentRosterImportPayload {
    programId: string;
    studentCode: string;
    fullName: string;
    officialEmail: string;
    academicYear: string;
    internshipCourseCode: string;
    classCode?: string;
    eligibilityStatus: 'ELIGIBLE' | 'INELIGIBLE';
    eligibilityNote?: string;
    lecturerCode?: string;
    lecturerName?: string;
    lecturerEmail?: string;
}

export interface ParsedRosterRow {
    rowNumber: number;
    studentCode: string;
    fullName: string;
    officialEmail: string;
    programCode: string;
    programName?: string;
    programId?: string;
    academicYear: string;
    internshipCourseCode: string;
    classCode?: string;
    eligibilityStatus: 'ELIGIBLE' | 'INELIGIBLE';
    eligibilityNote?: string;
    lecturerCode?: string;
    lecturerName?: string;
    lecturerEmail?: string;
    isValid: boolean;
    errors: string[];
}

export interface ParseRosterResult {
    rows: ParsedRosterRow[];
    validPayloads: StudentRosterImportPayload[];
    totalRows: number;
    validCount: number;
    errorCount: number;
}

function normalizeHeader(header: string): string {
    return header
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}

export function downloadRosterTemplate(programs: AcademicProgramOption[] = []) {
    const templateData = [
        {
            'MSSV (*)': 'B2100001',
            'Họ và tên (*)': 'Nguyễn Văn An',
            'Email': 'anb2100001@student.ctu.edu.vn',
            'Mã ngành (*)': programs[0]?.code || 'CNTT',
            'Khóa học (*)': 'Khóa 47',
            'Mã lớp': 'DI2196A1',
            'Mã học phần (*)': 'CT250',
            'Trạng thái': 'ELIGIBLE',
            'Mã GVHD': 'CB001',
            'Họ tên GVHD': 'TS. Nguyễn Văn Hướng Dẫn',
            'Email GVHD': 'lecturer@ctu.edu.vn',
            'Ghi chú': 'Đủ điều kiện tín chỉ',
        },
        {
            'MSSV (*)': 'B2100002',
            'Họ và tên (*)': 'Trần Thị Bình',
            'Email': '',
            'Mã ngành (*)': programs[1]?.code || programs[0]?.code || 'KTPM',
            'Khóa học (*)': 'Khóa 47',
            'Mã lớp': 'DI2196A2',
            'Mã học phần (*)': 'CT250',
            'Trạng thái': 'ELIGIBLE',
            'Mã GVHD': 'CB002',
            'Họ tên GVHD': 'ThS. Trần Giảng Viên',
            'Email GVHD': 'tgvien@ctu.edu.vn',
            'Ghi chú': '',
        }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    worksheet['!cols'] = [
        { wch: 14 }, { wch: 22 }, { wch: 30 }, { wch: 14 }, { wch: 12 },
        { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 24 },
        { wch: 26 }, { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachSinhVien');

    if (programs.length > 0) {
        const guideData = programs.map(p => ({
            'Mã ngành': p.code,
            'Tên ngành đào tạo': p.name,
        }));
        const guideSheet = XLSX.utils.json_to_sheet(guideData);
        guideSheet['!cols'] = [{ wch: 15 }, { wch: 40 }];
        XLSX.utils.book_append_sheet(workbook, guideSheet, 'DanhMucNganh');
    }

    XLSX.writeFile(workbook, 'Mau_Import_Sinh_Vien_Thuc_Tap.xlsx');
}

export async function parseRosterExcelFile(
    file: File,
    programs: AcademicProgramOption[]
): Promise<ParseRosterResult> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    if (workbook.SheetNames.length === 0) throw new Error('Tệp Excel không chứa trang tính (sheet) nào.');

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    if (!rawRows || rawRows.length === 0) throw new Error('Tệp Excel không có dữ liệu sinh viên.');

    const programMap = new Map<string, AcademicProgramOption>();
    for (const p of programs) {
        programMap.set(p.code.toUpperCase().trim(), p);
        programMap.set(normalizeHeader(p.code), p);
        programMap.set(normalizeHeader(p.name), p);
    }

    const parsedRows: ParsedRosterRow[] = [];
    const validPayloads: StudentRosterImportPayload[] = [];
    const seenStudentCodes = new Set<string>();

    const rawKeys = Object.keys(rawRows[0] || {});
    const headerMapping: Record<string, string> = {};

    for (const key of rawKeys) {
        const norm = normalizeHeader(key);
        if (norm.includes('mssv') || norm.includes('studentcode') || norm.includes('masv') || norm.includes('maso')) {
            headerMapping['studentCode'] = key;
        } else if (norm.includes('emailgv') || norm.includes('lectureremail') || norm.includes('emailgiangvien')) {
            headerMapping['lecturerEmail'] = key;
        } else if (norm.includes('magv') || norm.includes('lecturercode') || norm.includes('macanbo')) {
            headerMapping['lecturerCode'] = key;
        } else if (norm.includes('tengv') || norm.includes('lecturername') || norm.includes('gvhd') || norm.includes('tengiangvien')) {
            headerMapping['lecturerName'] = key;
        } else if (norm.includes('hoten') || norm.includes('fullname') || norm.includes('ten') || norm.includes('sinhvien')) {
            headerMapping['fullName'] = key;
        } else if (norm.includes('email') || norm.includes('officialemail')) {
            headerMapping['officialEmail'] = key;
        } else if (norm.includes('manganh') || norm.includes('programcode') || norm.includes('nganh')) {
            headerMapping['programCode'] = key;
        } else if (norm.includes('khoahoc') || norm.includes('academicyear') || norm.includes('khoa')) {
            headerMapping['academicYear'] = key;
        } else if (norm.includes('lop') || norm.includes('classcode') || norm.includes('malop')) {
            headerMapping['classCode'] = key;
        } else if (norm.includes('mahocphan') || norm.includes('internshipcoursecode') || norm.includes('hocphan') || norm.includes('monhoc')) {
            headerMapping['internshipCourseCode'] = key;
        } else if (norm.includes('trangthai') || norm.includes('eligibilitystatus') || norm.includes('dieukien')) {
            headerMapping['eligibilityStatus'] = key;
        } else if (norm.includes('ghichu') || norm.includes('eligibilitynote') || norm.includes('note')) {
            headerMapping['eligibilityNote'] = key;
        }
    }

    rawRows.forEach((row, index) => {
        const rowNumber = index + 2;
        const errors: string[] = [];

        const rawCode = String(row[headerMapping['studentCode']] ?? '').trim().toUpperCase();
        const rawFullName = String(row[headerMapping['fullName']] ?? '').trim();
        let rawEmail = String(row[headerMapping['officialEmail']] ?? '').trim();
        const rawProgram = String(row[headerMapping['programCode']] ?? '').trim();
        let rawYear = String(row[headerMapping['academicYear']] ?? '').trim();
        const rawClass = String(row[headerMapping['classCode']] ?? '').trim();
        const rawCourse = String(row[headerMapping['internshipCourseCode']] ?? '').trim();
        const rawStatus = String(row[headerMapping['eligibilityStatus']] ?? '').trim().toUpperCase();
        const rawNote = String(row[headerMapping['eligibilityNote']] ?? '').trim();
        const rawLecCode = String(row[headerMapping['lecturerCode']] ?? '').trim();
        const rawLecName = String(row[headerMapping['lecturerName']] ?? '').trim();
        const rawLecEmail = String(row[headerMapping['lecturerEmail']] ?? '').trim();

        if (!rawCode) errors.push('Thiếu MSSV');
        else if (seenStudentCodes.has(rawCode)) errors.push(`MSSV ${rawCode} bị trùng lặp`);
        else seenStudentCodes.add(rawCode);

        if (!rawFullName) errors.push('Thiếu Họ và tên');

        if (!rawEmail && rawFullName && rawCode) {
            rawEmail = deriveEmail(rawFullName, rawCode);
        } else if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
            errors.push('Email không đúng định dạng');
        }

        let matchedProgram: AcademicProgramOption | undefined;
        if (!rawProgram) {
            errors.push('Thiếu Mã ngành');
        } else {
            matchedProgram = programMap.get(rawProgram.toUpperCase()) || programMap.get(normalizeHeader(rawProgram));
            if (!matchedProgram) errors.push(`Không tìm thấy ngành "${rawProgram}" trong khoa`);
        }

        if (!rawYear && rawCode) rawYear = deriveAcademicYear(rawCode) || 'Khóa 47';
        const internshipCourseCode = rawCourse || 'CT250';
        const eligibilityStatus: 'ELIGIBLE' | 'INELIGIBLE' = 
            rawStatus.includes('INELIGIBLE') || rawStatus.includes('KHONG') ? 'INELIGIBLE' : 'ELIGIBLE';

        const isValid = errors.length === 0 && !!matchedProgram;

        const parsedRow: ParsedRosterRow = {
            rowNumber, studentCode: rawCode, fullName: rawFullName, officialEmail: rawEmail,
            programCode: rawProgram, programName: matchedProgram?.name, programId: matchedProgram?.id,
            academicYear: rawYear, internshipCourseCode, classCode: rawClass || undefined,
            eligibilityStatus, eligibilityNote: rawNote || undefined,
            lecturerCode: rawLecCode || undefined, lecturerName: rawLecName || undefined,
            lecturerEmail: rawLecEmail || undefined, isValid, errors,
        };

        parsedRows.push(parsedRow);

        if (isValid && matchedProgram) {
            validPayloads.push({
                programId: matchedProgram.id, studentCode: rawCode, fullName: rawFullName,
                officialEmail: rawEmail, academicYear: rawYear, internshipCourseCode,
                classCode: rawClass || undefined, eligibilityStatus, eligibilityNote: rawNote || undefined,
                lecturerCode: rawLecCode || undefined, lecturerName: rawLecName || undefined,
                lecturerEmail: rawLecEmail || undefined,
            });
        }
    });

    return {
        rows: parsedRows, validPayloads, totalRows: parsedRows.length,
        validCount: validPayloads.length, errorCount: parsedRows.length - validPayloads.length,
    };
}

export function downloadProvisionedAccountsExcel(
    accounts: { studentCode: string; fullName: string; officialEmail: string; defaultPassword?: string; isNewlyCreated: boolean }[],
    termName: string = 'KyThucTap'
) {
    const data = accounts.map((acc, index) => ({
        'STT': index + 1,
        'MSSV': acc.studentCode,
        'Họ và tên': acc.fullName,
        'Email đăng nhập': acc.officialEmail,
        'Mật khẩu tạm thời (đã gửi mail)': acc.defaultPassword || '(Tài khoản đã có từ trước)',
        'Trạng thái': acc.isNewlyCreated ? 'Tạo mới (đã gửi mail mật khẩu ngẫu nhiên)' : 'Liên kết tài khoản cũ',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
        { wch: 6 }, { wch: 14 }, { wch: 26 }, { wch: 34 }, { wch: 32 }, { wch: 36 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TaiKhoanSinhVien');
    const safeTermName = termName.replace(/[^a-zA-Z0-9_-]/g, '_');
    XLSX.writeFile(workbook, `Danh_Sach_Tai_Khoan_${safeTermName}.xlsx`);
}
