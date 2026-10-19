export interface RubricCriterion {
  id: string;
  title: string;
  weight: number;
  description: string;
}

/**
 * 1. Mẫu đánh giá ngành Khoa học máy tính (KHMT / CS):
 * Tập trung vào khảo sát bài toán, giải thuật, mô hình AI/dữ liệu và chất lượng mã nguồn phần mềm.
 */
export const KHMT_CRITERIA: RubricCriterion[] = [
  {
    id: 'crit-cs-1',
    title: '1. Nghiên cứu giải thuật, phân tích bài toán & mô hình kiến trúc dữ liệu',
    weight: 30,
    description: 'Cấu trúc báo cáo khoa học, phân tích bài toán chuyên sâu, khảo sát mô hình thuật toán / AI / cấu trúc dữ liệu phù hợp thực tế.',
  },
  {
    id: 'crit-cs-2',
    title: '2. Năng lực triển khai mã nguồn & Hoàn thiện sản phẩm phần mềm',
    weight: 40,
    description: 'Chất lượng code, tối ưu hóa độ phức tạp giải thuật, mức độ hoàn thiện các module phần mềm và kiểm thử đáp ứng yêu cầu của cơ quan.',
  },
  {
    id: 'crit-cs-3',
    title: '3. Khả năng thuyết minh chuyên môn & Trả lời câu hỏi phản biện',
    weight: 30,
    description: 'Nắm vững kiến thức khoa học máy tính, lập luận logic, giải trình rõ ràng các quyết định kỹ thuật và bảo vệ kết quả trước GVHD.',
  },
];

/**
 * 2. Mẫu đánh giá ngành Mạng máy tính & Truyền thông dữ liệu (MMT / NE):
 * Tập trung vào khảo sát hạ tầng, thiết kế topo mạng, cấu hình thiết bị viễn thông và an toàn thông tin.
 */
export const MMT_CRITERIA: RubricCriterion[] = [
  {
    id: 'crit-ne-1',
    title: '1. Khảo sát hiện trạng & Thiết kế kiến trúc hệ thống mạng / viễn thông',
    weight: 30,
    description: 'Báo cáo khảo sát chi tiết hạ tầng, sơ đồ topo mạng, phân bổ dải địa chỉ IP, tính toán băng thông và phương án triển khai dịch vụ mạng.',
  },
  {
    id: 'crit-ne-2',
    title: '2. Kỹ năng cấu hình thiết bị, triển khai dịch vụ & An toàn thông tin',
    weight: 40,
    description: 'Mức độ đáp ứng thực tế trong việc cấu hình thiết bị mạng (Router/Switch/Firewall), triển khai dịch vụ máy chủ, an ninh bảo mật và giám sát hệ thống.',
  },
  {
    id: 'crit-ne-3',
    title: '3. Khả năng xử lý sự cố mạng & Trả lời câu hỏi phản biện',
    weight: 30,
    description: 'Quy trình và phương pháp chẩn đoán lỗi mạng, kỹ năng xử lý sự cố viễn thông thực tế và trả lời câu hỏi chuyên môn của GVHD.',
  },
];

/**
 * 3. Mẫu đánh giá chuẩn chung toàn khoa (DEFAULT - áp dụng cho KTPM, HTTT, CNTT...):
 * Mẫu M-TT-04/05 tiêu chuẩn của Khoa CNTT&TT - ĐH Cần Thơ.
 */
export const DEFAULT_CRITERIA: RubricCriterion[] = [
  {
    id: 'crit-gen-1',
    title: '1. Nội dung báo cáo tổng kết thực tập & Phương pháp thực hiện',
    weight: 30,
    description: 'Cấu trúc báo cáo khoa học, trình bày rõ ràng, mô tả đầy đủ công việc thực tập, nhật ký và kết quả thực tế tại đơn vị.',
  },
  {
    id: 'crit-gen-2',
    title: '2. Năng lực giải quyết bài toán nghiệp vụ & Chất lượng sản phẩm hoàn thành',
    weight: 40,
    description: 'Mức độ đáp ứng yêu cầu kỹ thuật thực tế của cơ quan, khối lượng công việc hoàn thành và chất lượng bàn giao cho doanh nghiệp.',
  },
  {
    id: 'crit-gen-3',
    title: '3. Khả năng thuyết minh, trả lời câu hỏi phản biện & Tác phong làm việc',
    weight: 30,
    description: 'Nắm vững chuyên môn, giải trình rõ ràng các nội dung báo cáo, bảo vệ kết quả trước GVHD và ý thức kỷ luật thực tập.',
  },
];

export function getCriteriaForProgram(programCode?: string, programName?: string): {
  criteria: RubricCriterion[];
  badgeLabel: string;
  programKey: 'KHMT' | 'MMT' | 'DEFAULT';
  versionTag: string;
} {
  const code = (programCode || '').toUpperCase().trim();
  const name = (programName || '').toLowerCase().trim();

  if (code === 'KHMT' || code === 'CS' || name.includes('khoa học máy tính') || name.includes('computer science')) {
    return {
      criteria: KHMT_CRITERIA,
      badgeLabel: 'Mẫu Rubric: Khoa học máy tính (KHMT)',
      programKey: 'KHMT',
      versionTag: 'CICT-LECTURER-KHMT-2026',
    };
  }

  if (code === 'MMT' || code === 'NE' || name.includes('mạng máy tính') || name.includes('truyền thông')) {
    return {
      criteria: MMT_CRITERIA,
      badgeLabel: 'Mẫu Rubric: Mạng máy tính & TT (MMT)',
      programKey: 'MMT',
      versionTag: 'CICT-LECTURER-MMT-2026',
    };
  }

  return {
    criteria: DEFAULT_CRITERIA,
    badgeLabel: 'Mẫu Rubric: Tiêu chuẩn chung toàn khoa',
    programKey: 'DEFAULT',
    versionTag: 'CICT-LECTURER-DEFAULT-2026',
  };
}
