/**
 * Danh mục mã lỗi và thông điệp chuẩn toàn cục của InternLink (Frontend).
 * Đồng bộ 1-1 với ErrorCode enum (snake_case) từ Spring Boot backend-core.
 */

export const ERROR_CODES = {
  // === HỆ THỐNG & CHUNG (SYS) ===
  INTERNAL_SERVER_ERROR: 'sys_internal_error',
  INVALID_INPUT_DATA: 'sys_invalid_input',
  RESOURCE_NOT_FOUND: 'sys_resource_not_found',
  OPTIMISTIC_LOCK_CONFLICT: 'sys_conflict_data',
  TOO_MANY_REQUESTS: 'sys_rate_limit_exceeded',

  // === XÁC THỰC & PHÂN QUYỀN (AUTH) ===
  UNAUTHORIZED: 'auth_unauthorized',
  FORBIDDEN_ACCESS: 'auth_forbidden',
  ACCOUNT_LOCKED: 'auth_account_locked',

  // === TÀI LIỆU & TỆP TIN (DOC) ===
  DOCUMENT_NOT_FOUND: 'doc_not_found',
  DOCUMENT_OWNERSHIP_INVALID: 'doc_ownership_invalid',
  DOCUMENT_TOO_LARGE: 'document_too_large',
  DOCUMENT_TEXT_TOO_LARGE: 'document_text_too_large',
  DOCUMENT_MALWARE_DETECTED: 'doc_malware_detected',
  UNSUPPORTED_DOCUMENT_TYPE: 'unsupported_document_type',
  DOCUMENT_UNREADABLE: 'unreadable_document',
  TOO_MANY_PAGES: 'too_many_pages',

  // === AI MICROSERVICE & XỬ LÝ CV (AI) ===
  AI_SERVICE_UNAVAILABLE: 'ai_unavailable',
  AI_CLOUD_CONSENT_REQUIRED: 'ai_cloud_consent_required',
  AI_OCR_REQUIRED: 'ocr_required',
  AI_ENCRYPTED_PDF: 'encrypted_pdf',
  AI_EMPTY_RESPONSE: 'empty_response',
  AI_CV_TEXT_LENGTH_INVALID: 'ai_cv_text_invalid',
  AI_RETRY_NOT_ALLOWED: 'ai_retry_not_allowed',
  AI_RUN_ALREADY_REPROCESSED: 'ai_run_already_reprocessed',
  AI_UNSUPPORTED_QUOTE: 'ai_unsupported_quote',

  // === TUYỂN DỤNG & ỨNG TUYỂN (JOB) ===
  JOB_POSITION_CLOSED: 'job_closed',
  ALREADY_APPLIED: 'job_already_applied',
  TERM_NOT_ACTIVE: 'term_not_active',
} as const;

export type ErrorCodeType = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export const ERROR_MESSAGES: Record<ErrorCodeType, string> = {
  // SYS
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau',
  [ERROR_CODES.INVALID_INPUT_DATA]: 'Dữ liệu đầu vào không hợp lệ',
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Không tìm thấy tài nguyên yêu cầu',
  [ERROR_CODES.OPTIMISTIC_LOCK_CONFLICT]: 'Dữ liệu đã thay đổi hoặc bị trùng lặp. Vui lòng tải lại trang',
  [ERROR_CODES.TOO_MANY_REQUESTS]: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau giây lát',

  // AUTH
  [ERROR_CODES.UNAUTHORIZED]: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ',
  [ERROR_CODES.FORBIDDEN_ACCESS]: 'Bạn không có quyền thực hiện thao tác này',
  [ERROR_CODES.ACCOUNT_LOCKED]: 'Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần',

  // DOC
  [ERROR_CODES.DOCUMENT_NOT_FOUND]: 'Tài liệu không tồn tại trên hệ thống',
  [ERROR_CODES.DOCUMENT_OWNERSHIP_INVALID]: 'Tài liệu nguồn phải là CV thuộc sở hữu của sinh viên',
  [ERROR_CODES.DOCUMENT_TOO_LARGE]: 'Dung lượng tệp vượt quá giới hạn 10MB cho phép',
  [ERROR_CODES.DOCUMENT_TEXT_TOO_LARGE]: 'Nội dung văn bản trong tài liệu vượt quá giới hạn xử lý',
  [ERROR_CODES.DOCUMENT_MALWARE_DETECTED]: 'Tệp tin bị chặn do phát hiện mã độc',
  [ERROR_CODES.UNSUPPORTED_DOCUMENT_TYPE]: 'Định dạng tệp không được hỗ trợ (chỉ nhận PDF và DOCX)',
  [ERROR_CODES.DOCUMENT_UNREADABLE]: 'Không thể đọc nội dung tệp tin do tệp bị hỏng',
  [ERROR_CODES.TOO_MANY_PAGES]: 'Tài liệu vượt quá số trang cho phép (tối đa 50 trang)',

  // AI
  [ERROR_CODES.AI_SERVICE_UNAVAILABLE]: 'Dịch vụ AI hiện không phản hồi. Hệ thống đã kích hoạt chế độ dự phòng',
  [ERROR_CODES.AI_CLOUD_CONSENT_REQUIRED]: 'Cần có sự đồng ý của sinh viên để gửi tài liệu lên dịch vụ AI đám mây',
  [ERROR_CODES.AI_OCR_REQUIRED]: 'Tài liệu PDF scan dạng ảnh cần được nhận dạng ký tự (OCR)',
  [ERROR_CODES.AI_ENCRYPTED_PDF]: 'Tệp PDF bị đặt mật khẩu bảo vệ, vui lòng gỡ mật khẩu trước khi tải lên',
  [ERROR_CODES.AI_EMPTY_RESPONSE]: 'Dịch vụ AI không trả về dữ liệu phân tích',
  [ERROR_CODES.AI_CV_TEXT_LENGTH_INVALID]: 'Nội dung CV phải có độ dài từ 1 đến 100.000 ký tự',
  [ERROR_CODES.AI_RETRY_NOT_ALLOWED]: 'Chỉ có thể xử lý lại các lượt trích xuất CV bị lỗi có sinh viên nguồn',
  [ERROR_CODES.AI_RUN_ALREADY_REPROCESSED]: 'Lượt xử lý này đã được chạy lại trước đó',
  [ERROR_CODES.AI_UNSUPPORTED_QUOTE]: 'Đoạn trích dẫn kỹ năng không tồn tại trong tài liệu gốc',

  // JOB
  [ERROR_CODES.JOB_POSITION_CLOSED]: 'Vị trí tuyển dụng đã đóng hoặc hết hạn tiếp nhận hồ sơ',
  [ERROR_CODES.ALREADY_APPLIED]: 'Sinh viên đã nộp hồ sơ ứng tuyển vào vị trí này',
  [ERROR_CODES.TERM_NOT_ACTIVE]: 'Kỳ thực tập hiện tại chưa mở hoặc đã kết thúc giai đoạn ứng tuyển',
};

/**
 * Trợ thủ lấy thông điệp thân thiện theo mã lỗi trả về từ Backend.
 */
export function getErrorMessage(code?: string, fallbackMessage?: string): string {
  if (code && code in ERROR_MESSAGES) {
    return ERROR_MESSAGES[code as ErrorCodeType];
  }
  return fallbackMessage || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
}
