'use client';
import { useState } from 'react';
import { CalendarClock, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { portfolioApi, errorText } from '../../api';
import { fieldClass } from '../../types';
import type { PlacementMeta } from '../../types';

interface GrantExtensionModalProps {
  placement: PlacementMeta;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: PlacementMeta) => void;
}

export default function GrantExtensionModal({ placement, isOpen, onClose, onSuccess }: GrantExtensionModalProps) {
  const [newDueAt, setNewDueAt] = useState(() => {
    if (placement.reportDueAt) {
      const d = new Date(placement.reportDueAt);
      return !isNaN(d.getTime()) ? d.toISOString().slice(0, 16) : '';
    }
    return '';
  });
  const [reason, setReason] = useState(placement.extensionReason || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDueAt) { setError('Vui lòng chọn hạn nộp báo cáo mới.'); return; }
    if (!reason.trim()) { setError('Vui lòng nhập lý do gia hạn.'); return; }

    setBusy(true);
    setError('');
    try {
      const isoString = new Date(newDueAt).toISOString();
      const res = await portfolioApi.grantExtension(placement.id, { newReportDueAt: isoString, reason: reason.trim() });
      if (res.data) onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 text-slate-900">
            <CalendarClock className="h-5 w-5 text-sky-600" />
            <h3 className="font-semibold text-base">Gia hạn nộp báo cáo thực tập</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-lg bg-sky-50 p-3 text-xs text-sky-900 space-y-1">
            <p><strong>Sinh viên:</strong> {placement.studentName} ({placement.studentCode || 'N/A'})</p>
            <p><strong>Đơn vị thực tập:</strong> {placement.companyName}</p>
            {placement.reportDueAt && <p><strong>Hạn nộp hiện tại:</strong> {new Date(placement.reportDueAt).toLocaleString('vi-VN')}</p>}
          </div>

          {error && <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span></div>}

          <div>
            <label className="block text-xs font-semibold text-slate-700">Hạn nộp mới <span className="text-rose-500">*</span></label>
            <input type="datetime-local" className={`${fieldClass} mt-1`} value={newDueAt} onChange={e => setNewDueAt(e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Lý do gia hạn <span className="text-rose-500">*</span></label>
            <textarea className={`${fieldClass} mt-1`} rows={3} placeholder="Nêu rõ lý do (trục trặc thiết bị, cơ quan phê duyệt muộn, hoàn cảnh đặc biệt...)" value={reason} onChange={e => setReason(e.target.value)} required />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={busy}>Hủy bỏ</Button>
            <Button type="submit" size="sm" isLoading={busy}>Xác nhận gia hạn</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
