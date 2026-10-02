import * as XLSX from 'xlsx';
import { FacultyEvaluationSummary } from '../types/evaluation.types';

export interface ExportEvaluationOptions {
    termName: string;
    facultyName?: string;
    filterDescription?: string;
}

/**
 * Tạo WorkBook Excel từ danh sách đánh giá sinh viên
 */
export function generateEvaluationsWorkbook(
    data: FacultyEvaluationSummary[],
    options: ExportEvaluationOptions
): { workbook: XLSX.WorkBook; filename: string } {
    const { termName, facultyName = 'TRƯỜNG CÔNG NGHỆ THÔNG TIN VÀ TRUYỀN THÔNG', filterDescription } = options;

    const currentDateStr = new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    // 1. Tiêu đề và thông tin chung
    const headerRows = [
        ['TRƯỜNG ĐẠI HỌC CẦN THƠ'],
        [facultyName.toUpperCase()],
        [''],
        ['BẢNG TỔNG HỢP ĐIỂM VÀ ĐÁNH GIÁ KẾT QUẢ THỰC TẬP'],
        [`Kỳ thực tập: ${termName}`],
        [`Thời gian xuất báo cáo: ${currentDateStr}${filterDescription ? ` | Bộ lọc: ${filterDescription}` : ''}`],
        [''],
    ];

    // 2. Tiêu đề các cột dữ liệu
    const columns = [
        'STT',
        'Mã sinh viên',
        'Họ và tên',
        'Lớp',
        'Ngành đào tạo',
        'Đơn vị thực tập',
        'Cán bộ hướng dẫn (Mentor)',
        'Giảng viên phụ trách (GVHD)',
        'Điểm DN (M-TT-04)',
        'Điểm GVHD (M-TT-05)',
        'Điểm hệ 10',
        'Điểm hệ 4',
        'Điểm chữ',
        'Xếp loại',
        'Kết quả',
        'Trạng thái công bố',
        'Nhận xét của Giảng viên hướng dẫn',
        'Nhận xét của Doanh nghiệp',
    ];

    // 3. Chuẩn bị dữ liệu từng dòng
    const dataRows = data.map((item, index) => {
        const resultLabel = item.resultStatus === 'PASSED'
            ? 'ĐẠT'
            : item.resultStatus === 'FAILED'
            ? 'KHÔNG ĐẠT'
            : 'CHỜ XÉT';

        const publishLabel = item.isPublished ? 'Đã công bố' : 'Bản nháp';

        return [
            index + 1,
            item.studentCode || 'Chưa cập nhật',
            item.studentName,
            item.classCode || '',
            item.programName || '',
            item.companyName || 'Doanh nghiệp tự liên hệ',
            item.mentorName || 'Chưa phân công',
            item.lecturerName || 'Chưa phân công',
            item.mentorScore != null ? item.mentorScore : '',
            item.lecturerScore != null ? item.lecturerScore : '',
            item.finalScore != null ? item.finalScore : '',
            item.scoreScale4 != null ? item.scoreScale4 : '',
            item.letterGrade || '',
            item.classification || '',
            resultLabel,
            publishLabel,
            item.lecturerFeedback || '',
            item.mentorFeedback || '',
        ];
    });

    // 4. Thống kê tổng hợp ở cuối bảng
    const totalStudents = data.length;
    const passedCount = data.filter((d) => d.resultStatus === 'PASSED').length;
    const failedCount = data.filter((d) => d.resultStatus === 'FAILED').length;
    const passedRate = totalStudents > 0 ? ((passedCount / totalStudents) * 100).toFixed(1) : '0';

    const scoredItems = data.filter((d) => d.finalScore != null);
    const avgScore10 = scoredItems.length > 0
        ? (scoredItems.reduce((acc, cur) => acc + (cur.finalScore || 0), 0) / scoredItems.length).toFixed(2)
        : 'N/A';

    const summaryRows = [
        [''],
        ['--- THỐNG KÊ KẾT QUẢ THỰC TẬP ---'],
        ['Tổng số sinh viên:', totalStudents],
        ['Số lượng Đạt:', `${passedCount} (${passedRate}%)`],
        ['Số lượng Chưa đạt / Cảnh báo:', `${failedCount} (${(100 - parseFloat(passedRate)).toFixed(1)}%)`],
        ['Điểm trung bình (Thang 10):', avgScore10],
    ];

    // Ghép tất cả các hàng
    const allRows = [...headerRows, columns, ...dataRows, ...summaryRows];

    // Tạo worksheet & workbook
    const ws = XLSX.utils.aoa_to_sheet(allRows);

    // Căn chỉnh độ rộng cột tự động
    const colWidths = [
        { wch: 6 },  // STT
        { wch: 15 }, // MSSV
        { wch: 25 }, // Họ tên
        { wch: 12 }, // Lớp
        { wch: 28 }, // Ngành
        { wch: 32 }, // Công ty
        { wch: 25 }, // Mentor
        { wch: 25 }, // GVHD
        { wch: 16 }, // Điểm DN
        { wch: 18 }, // Điểm GVHD
        { wch: 14 }, // Điểm 10
        { wch: 12 }, // Điểm 4
        { wch: 12 }, // Điểm chữ
        { wch: 16 }, // Xếp loại
        { wch: 14 }, // Kết quả
        { wch: 18 }, // Trạng thái công bố
        { wch: 45 }, // Nhận xét GV
        { wch: 45 }, // Nhận xét DN
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bảng Điểm Tổng Hợp');

    // Tạo tên file chuẩn hóa
    const cleanTermName = termName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `Bang_Diem_Thuc_Tap_${cleanTermName}_${dateStamp}.xlsx`;

    return { workbook: wb, filename };
}

/**
 * Xuất danh sách bảng điểm và đánh giá thực tập của sinh viên ra file Excel (.xlsx)
 */
export function exportEvaluationsToExcel(
    data: FacultyEvaluationSummary[],
    options: ExportEvaluationOptions
): void {
    const { workbook, filename } = generateEvaluationsWorkbook(data, options);
    XLSX.writeFile(workbook, filename);
}
