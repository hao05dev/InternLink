import { Sparkles, X } from "lucide-react";

interface Props { time: string | null; onClear: () => void; onDismiss: () => void }
export function JobDraftNotice({ time, onClear, onDismiss }: Props) {
  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-900">
    <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" />Đã khôi phục bản nháp{time ? ` lúc ${time}` : ""}.</span>
    <div className="flex items-center gap-3"><button type="button" className="text-rose-700 underline" onClick={onClear}>Xóa bản nháp & làm mới</button><button type="button" aria-label="Đóng thông báo nháp" onClick={onDismiss}><X className="h-4 w-4" /></button></div>
  </div>;
}
