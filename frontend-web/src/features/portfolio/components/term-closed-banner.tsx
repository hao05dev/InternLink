'use client';
import { AlertTriangle, Lock } from 'lucide-react';

interface TermClosedBannerProps {
  termName?: string;
  className?: string;
}

export default function TermClosedBanner({ termName, className = '' }: TermClosedBannerProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm ${className}`}
    >
      <div className="rounded-lg bg-amber-200/70 p-2 text-amber-950">
        <Lock className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-1.5 font-semibold text-amber-950">
          <AlertTriangle className="h-4 w-4" />
          <span>Học kỳ {termName ? `"${termName}"` : ''} đã kết thúc và được khóa (CLOSED)</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Tất cả dữ liệu nhật ký, tuần và biểu mẫu thực tập đã chuyển sang chế độ <strong>Chỉ đọc (Read-only)</strong>.
          Mọi chỉnh sửa, xác nhận hoặc cấp quyền gia hạn đã bị vô hiệu hóa để đảm bảo tính toàn vẹn của đợt thực tập.
        </p>
      </div>
    </div>
  );
}
