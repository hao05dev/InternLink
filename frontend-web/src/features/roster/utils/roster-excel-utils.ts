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

/**
 * Chuẩn hóa tên cột header để nhận diện linh hoạt
 */
function normalizeHeader(header: string): string {
    return header
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}

/**
 * Tạo và tải về file Excel mẫu
 */
export function downloadRosterTemplate(programs: AcademicProgramOption[] = []) {
    const samplePrograms = programs.length > 0 
        ? programs.map(p => `${p.code} (${p.name})`).join(', ')
        : 'CNTT, KTPM, HTTT, KHMT, MMT, ATTT';

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
            'Ghi chú': 'Đủ điều kiện tín chỉ',
        },
        {
            'MSSV (*)': 'B2100002',
            'Họ và tên (*)': 'Trần Thị Bình',
            'Email': '', // để trống để test tính năng tự động tạo email
            'Mã ngành (*)': programs[1]?.code || programs[0]?.code || 'KTPM',
            'Khóa học (*)': 'Khóa 47',
            'Mã lớp': 'DI2196A2',
            'Mã học phần (*)': 'CT250',
            'Trạng thái': 'ELIGIBLE',
            'Ghi chú': '',
        }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Thiết lập độ rộng cột
    worksheet['!cols'] = [
        { wch: 14 }, // MSSV
        { wch: 24 }, // Họ tên
        { wch: 34 }, // Email
        { wch: 15 }, // Mã ngành
        { wch: 14 }, // Khóa học
        { wch: 14 }, // Lớp
        { wch: 16 }, // Mã học phần
        { wch: 14 }, // Trạng thái
        { wch: 25 }, // Ghi chú
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachSinhVien');

    // Thêm sheet hướng dẫn mã ngành có sẵn
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

/**
 * Đọc và parse dữ liệu từ file Excel / CSV
 */
export async function parseRosterExcelFile(
    file: File,
    programs: AcademicProgramOption[]
): Promise<ParseRosterResult> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });

    if (workbook.SheetNames.length === 0) {
        throw new Error('Tệp Excel không chứa trang tính (sheet) nào.');
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
        throw new Error('Tệp Excel không có dữ liệu sinh viên.');
    }

    // Tạo Map để tra cứu ngành học
    const programMap = new Map<string, AcademicProgramOption>();
    for (const p of programs) {
        programMap.set(p.code.toUpperCase().trim(), p);
        programMap.set(normalizeHeader(p.code), p);
        programMap.set(normalizeHeader(p.name), p);
    }

    const parsedRows: ParsedRosterRow[] = [];
    const validPayloads: StudentRosterImportPayload[] = [];
    const seenStudentCodes = new Set<string>();

    // Chuẩn hóa Header mapping
    const rawKeys = Object.keys(rawRows[0] || {});
    const headerMapping: Record<string, string> = {};

    for (const key of rawKeys) {
        const norm = normalizeHeader(key);
        if (norm.includes('mssv') || norm.includes('studentcode') || norm.includes('masv') || norm.includes('maso')) {
            headerMapping['studentCode'] = key;
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
        const rowNumber = index + 2; // Dòng 1 là header
        const errors: string[] = [];

        // Lấy dữ liệu theo header mapping
        const rawCode = String(row[headerMapping['studentCode']] ?? '').trim().toUpperCase();
        const rawFullName = String(row[headerMapping['fullName']] ?? '').trim();
        let rawEmail = String(row[headerMapping['officialEmail']] ?? '').trim();
        const rawProgram = String(row[headerMapping['programCode']] ?? '').trim();
        let rawYear = String(row[headerMapping['academicYear']] ?? '').trim();
        const rawClass = String(row[headerMapping['classCode']] ?? '').trim();
        const rawCourse = String(row[headerMapping['internshipCourseCode']] ?? '').trim();
        const rawStatus = String(row[headerMapping['eligibilityStatus']] ?? '').trim().toUpperCase();
        const rawNote = String(row[headerMapping['eligibilityNote']] ?? '').trim();

        // 1. Validate MSSV
        if (!rawCode) {
            errors.push('Thiếu MSSV');
        } else if (seenStudentCodes.has(rawCode)) {
            errors.push(`MSSV ${rawCode} bị trùng lặp`);
        } else {
            seenStudentCodes.add(rawCode);
        }

        // 2. Validate Họ tên
        if (!rawFullName) {
            errors.push('Thiếu Họ và tên');
        }

        // 3. Tự sinh Email nếu trống
        if (!rawEmail && rawFullName && rawCode) {
            rawEmail = deriveEmail(rawFullName, rawCode);
        } else if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
            errors.push('Email không đúng định dạng');
        }

        // 4. Validate Ngành học
        let matchedProgram: AcademicProgramOption | undefined;
        if (!rawProgram) {
            errors.push('Thiếu Mã ngành');
        } else {
            matchedProgram = programMap.get(rawProgram.toUpperCase()) || 
                             programMap.get(normalizeHeader(rawProgram));
            if (!matchedProgram) {
                errors.push(`Không tìm thấy ngành "${rawProgram}" trong khoa`);
            }
        }

        // 5. Tự sinh Khóa học nếu trống
        if (!rawYear && rawCode) {
            rawYear = deriveAcademicYear(rawCode) || 'Khóa 47';
        }

        // 6. Validate Mã học phần
        const internshipCourseCode = rawCourse || 'CT250';

        // 7. Validate Trạng thái điều kiện
        const eligibilityStatus: 'ELIGIBLE' | 'INELIGIBLE' = 
            rawStatus.includes('INELIGIBLE') || rawStatus.includes('KHONG') 
                ? 'INELIGIBLE' 
                : 'ELIGIBLE';

        const isValid = errors.length === 0 && !!matchedProgram;

        const parsedRow: ParsedRosterRow = {
            rowNumber,
            studentCode: rawCode,
            fullName: rawFullName,
            officialEmail: rawEmail,
            programCode: rawProgram,
            programName: matchedProgram?.name,
            programId: matchedProgram?.id,
            academicYear: rawYear,
            internshipCourseCode,
            classCode: rawClass || undefined,
            eligibilityStatus,
            eligibilityNote: rawNote || undefined,
            isValid,
            errors,
        };

        parsedRows.push(parsedRow);

        if (isValid && matchedProgram) {
            validPayloads.push({
                programId: matchedProgram.id,
                studentCode: rawCode,
                fullName: rawFullName,
                officialEmail: rawEmail,
                academicYear: rawYear,
                internshipCourseCode,
                classCode: rawClass || undefined,
                eligibilityStatus,
                eligibilityNote: rawNote || undefined,
            });
        }
    });

    return {
        rows: parsedRows,
        validPayloads,
        totalRows: parsedRows.length,
        validCount: validPayloads.length,
        errorCount: parsedRows.length - validPayloads.length,
    };
}

/**
 * Xuất danh sách tài khoản đã cấp phát ra file Excel
 */
export function downloadProvisionedAccountsExcel(
    accounts: { studentCode: string; fullName: string; officialEmail: string; defaultPassword?: string; isNewlyCreated: boolean }[],
    termName: string = 'KyThucTap'
) {
    const data = accounts.map((acc, index) => ({
        'STT': index + 1,
        'MSSV': acc.studentCode,
        'Họ và tên': acc.fullName,
        'Email đăng nhập': acc.officialEmail,
        'Mật khẩu khởi tạo': acc.defaultPassword || '(Tài khoản đã có từ trước)',
        'Loại': acc.isNewlyCreated ? 'Tạo mới' : 'Liên kết tài khoản cũ',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
        { wch: 6 },
        { wch: 14 },
        { wch: 26 },
        { wch: 34 },
        { wch: 22 },
        { wch: 22 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TaiKhoanSinhVien');
    const safeTermName = termName.replace(/[^a-zA-Z0-9_-]/g, '_');
    XLSX.writeFile(workbook, `Danh_Sach_Tai_Khoan_${safeTermName}.xlsx`);
}
