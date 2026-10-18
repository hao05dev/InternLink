'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LecturerGradingHeaderProps {
  message: { type: 'success' | 'error'; text: string } | null;
  onClearMessage: () => void;
  isTermClosed: boolean;
  hasScoreDiscrepancy: boolean;
}

export function LecturerGradingHeader({
  message,
  onClearMessage,
  isTermClosed,
  hasScoreDiscrepancy,
}: LecturerGradingHeaderProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Chấm Điểm & Báo Cáo CLO (Lecturer Grading)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Đánh giá báo cáo thực tập, chấm điểm Rubric của Giảng viên hướng dẫn và tổng hợp chuẩn đầu ra học phần.
        </p>
      </div>

      {message && (
        <div
          role="alert"
          aria-live="polite"
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={onClearMessage}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Đóng thông báo"
          >
            &times;
          </button>
        </div>
      )}

      {isTermClosed && (
        <div className="p-4 rounded-xl flex items-center gap-3 text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Học kỳ này đã kết thúc (CLOSED). Điểm số đã bị khóa và không thể chỉnh sửa thêm.</span>
        </div>
      )}

      {hasScoreDiscrepancy && (
        <div className="p-4 rounded-xl flex items-center gap-3 text-xs font-medium bg-rose-50 text-rose-900 border border-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>Cảnh báo: Điểm của Doanh nghiệp và Giảng viên có sự chênh lệch lớn (&ge; 3.0 điểm). Vui lòng kiểm tra lại trước khi lưu.</span>
        </div>
      )}
    </div>
  );
}
