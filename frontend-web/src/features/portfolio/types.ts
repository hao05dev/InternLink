export type FormKind = 'M01' | 'M02' | 'M03' | 'M04' | 'M05';
export type Attendance = 'PRESENT' | 'REMOTE' | 'LEAVE' | 'ABSENT' | 'DAY_OFF';
export interface PlacementMeta {
  id: string; studentName: string; studentCode?: string; companyName: string; mentorName: string;
  lecturerName: string; termName: string; startDate: string; endDate: string; status: string; source: string;
  hasMentor: boolean; weekCount: number; requiredWeeks?: number; reportDueAt?: string; schemeReference?: string;
  programName?: string; courseCode?: string; components: { code: string; name: string; weight: number; assessorRole: string; criteria?: { code: string; name: string; weight: number }[] }[];
}
export interface JournalInput {
  attendance: Attendance; startTime: string | null; endTime: string | null; breakMinutes: number; sessions: number;
  tasks: string; results: string; reflection: string; evidence: string;
}
export interface Journal extends JournalInput {
  id: string; workDate: string; status: string; version: number; hours: number;
  reviewNote?: string; reviewer?: string; submittedAt?: string; reviewedAt?: string;
}
export interface WeekSummary {
  number: number; start: string; end: string; submittedDays: number; confirmedDays: number; sessions: number;
  hours: number; tasks: string; results: string; reflection: string; status: string; logbookId?: string;
}
export interface WeekRow { week: number; tasks: string; comment: string; sessions: number; hours: number }
export interface FormContent {
  weeks?: WeekRow[]; sections?: Record<string, string>; scores?: Record<string, number | string>;
  remote?: boolean; comment?: string; suggestions?: string; trainingFeedback?: string[];
  courseName?: string; place?: string; paperSize?: 'A4' | 'LETTER';
  academicScores?: Record<string, { score?: number | string; criteriaScores?: Record<string, number | string> }>;
  academicTotals?: Record<string, number>;
}
export interface FormView {
  id: string | null; kind: FormKind; status: string; version: number | null; templateVersion: string; published: boolean;
  canRead: boolean; canEdit: boolean; canReview: boolean; canPublish: boolean; content: FormContent | null;
  feedback?: string; updatedAt?: string;
  revisions: { id: string; action: string; actor: string; note?: string; createdAt: string; downloadable: boolean }[];
  signedFiles: { id: string; name: string; revisionId: string; uploadedAt: string }[];
}
export interface Overview {
  placement: PlacementMeta; canWriteJournal: boolean; canConfirmJournal: boolean; forms: FormView[]; weeks: WeekSummary[];
}
export const FORM_NAMES: Record<FormKind, string> = {
  M01: 'M-TT-01 · Kế hoạch giao việc', M02: 'M-TT-02 · Phiếu theo dõi', M03: 'M-TT-03 · Đánh giá của cơ quan',
  M04: 'M-TT-04 · Giảng viên chấm báo cáo', M05: 'M-TT-05 · Báo cáo cuối kỳ',
};
export const SECTION_TITLES: Record<string, string> = {
  thanks: 'Lời cảm ơn', organization: 'I. Tìm hiểu cơ quan thực tập', work: 'II. Nội dung công việc',
  method: 'III. Phương pháp thực hiện', outcomes: 'IV. Kết quả đạt được',
};
export const CRITERIA = [
  'I.1. Thực hiện nội quy của cơ quan', 'I.2. Chấp hành giờ giấc làm việc', 'I.3. Thái độ giao tiếp với cán bộ trong đơn vị',
  'I.4. Tích cực trong công việc', 'II.1. Đáp ứng yêu cầu công việc', 'II.2. Tinh thần học hỏi, nâng cao chuyên môn',
  'II.3. Có đề xuất, sáng kiến, năng động trong công việc', 'III.1. Báo cáo tiến độ mỗi tuần một lần',
  'III.2. Hoàn thành công việc được giao', 'III.3. Kết quả có đóng góp cho cơ quan',
];
export const TRAINING = ['Phù hợp với thực tế', 'Không phù hợp với thực tế', 'Tăng cường kỹ năng mềm', 'Tăng cường ngoại ngữ', 'Tăng cường kỹ năng làm việc nhóm'];
export const ATTENDANCE_NAMES: Record<Attendance, string> = { PRESENT: 'Có mặt tại cơ quan', REMOTE: 'Làm từ xa', LEAVE: 'Nghỉ phép', ABSENT: 'Vắng', DAY_OFF: 'Ngày nghỉ theo lịch' };
export const STATUS_NAMES: Record<string, string> = { DRAFT: 'Bản nháp', SUBMITTED: 'Chờ duyệt', CONFIRMED: 'Đã xác nhận', REVISION_REQUIRED: 'Cần bổ sung', REVISION_REQUESTED: 'Cần bổ sung', COMPLETED: 'Đã hoàn thành', APPROVED: 'Đã duyệt', APPROVED_BY_MENTOR: 'Mentor đã duyệt', APPROVED_BY_LECTURER: 'Giảng viên đã duyệt', NOT_SUBMITTED: 'Chưa nộp', ACTIVE: 'Đang thực tập', PREPARING: 'Đang chuẩn bị', PAUSED: 'Tạm dừng' };
export const fieldClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50';
export function todayVN() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()); }
export function dateLabel(date: string) { return new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString('vi-VN'); }
