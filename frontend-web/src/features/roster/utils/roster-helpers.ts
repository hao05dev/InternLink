/**
 * Helper utilities for student roster auto-fill and data transformations
 */

/** Bỏ dấu tiếng Việt, giữ a-z0-9 */
export function removeDiacritics(str: string): string {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}

/**
 * Tạo email CTU từ họ tên + MSSV
 * VD: "Nguyễn Hoàng Hào" + "B2306614" → "haob2306614@student.ctu.edu.vn"
 */
export function deriveEmail(fullName: string, studentCode: string): string {
    const parts = fullName.trim().split(/\s+/);
    const givenName = parts.length > 0 ? removeDiacritics(parts[parts.length - 1]) : '';
    const code = studentCode.trim().toLowerCase();
    if (!givenName || !code) return '';
    return `${givenName}${code}@student.ctu.edu.vn`;
}

/**
 * Tính Khóa học từ MSSV
 * B23xxxx → Khóa 49   (23 + 26 = 49)
 * B24xxxx → Khóa 50
 */
export function deriveAcademicYear(studentCode: string): string {
    const match = studentCode.trim().match(/[A-Za-z]+(\d{2})/);
    if (!match) return '';
    const yearSuffix = parseInt(match[1], 10);
    return `Khóa ${yearSuffix + 26}`;
}
