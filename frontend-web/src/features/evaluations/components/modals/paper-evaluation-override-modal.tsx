'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileCheck, AlertCircle, Camera, CheckCircle2, ShieldCheck, FileText, Loader2 } from 'lucide-react';
import type { InternshipPlacement } from '@/features/placements/types/placement.types';
import { apiClient } from '@/lib/api-client';

interface PaperEvaluationOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    placementId: string;
    mentorScore: number;
    mentorFeedback: string;
    proofUrl: string;
    evidenceDocumentId?: string;
  }) => Promise<void>;
  placement: InternshipPlacement | {
    id: string;
    studentName?: string;
    studentCode?: string;
    companyName?: string;
    mentorName?: string;
  } | null;
  isLoading?: boolean;
}

export function PaperEvaluationOverrideModal({
  isOpen,
  onClose,
  onConfirm,
  placement,
  isLoading = false,
}: PaperEvaluationOverrideModalProps) {
  const [mentorScore, setMentorScore] = useState('8.5');
  const [mentorFeedback, setMentorFeedback] = useState('Sinh viên chấp hành tốt nội quy cơ quan, hoàn thành các nhiệm vụ được phân công.');
  const [proofUrl, setProofUrl] = useState('');
  const [evidenceDocId, setEvidenceDocId] = useState<string | undefined>();
  const [isSealedConfirmed, setIsSealedConfirmed] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!placement) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.upload<{ id: string; fileUrl?: string; storagePath?: string }>(
        `/api/v1/documents/upload?contextType=PLACEMENT&contextId=${placement.id}&docType=EXTERNAL_EVALUATION`,
        formData
      );
      const doc = res.data;
      setEvidenceDocId(doc.id);
      setUploadedFileName(file.name);
      if (doc.fileUrl) {
        setProofUrl(doc.fileUrl);
      } else {
        setProofUrl(`/api/v1/documents/${doc.id}/download`);
      }
    } catch {
      setError('Tải lên ảnh chụp phiếu niêm phong không thành công. Bạn có thể dán đường link URL bên dưới.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSealedConfirmed) {
      setError('Vui lòng tích xác nhận đã nhận bản giấy niêm phong từ sinh viên.');
      return;
    }
    const scoreNum = parseFloat(mentorScore);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
      setError('Điểm số của cơ quan phải từ 0.0 đến 10.0.');
      return;
    }

    setError(null);
    await onConfirm({
      placementId: placement.id,
      mentorScore: scoreNum,
      mentorFeedback,
      proofUrl: proofUrl.trim(),
      evidenceDocumentId: evidenceDocId,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Số Hóa Phiếu Đánh Giá Cơ Quan (Bản Giấy Niêm Phong)"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Banner xác nhận niêm phong */}
        <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-sky-900">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Quy trình số hóa Phiếu đánh giá của Cán bộ cơ quan (Mẫu M-TT-04/DN)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Sinh viên nộp phong bì niêm phong phiếu đánh giá bản giấy (có đóng dấu mộc đỏ cơ quan) về cho GVHD. GVHD mở niêm phong, kiểm tra tính xác thực, chụp hình/scan đính kèm và nhập điểm vào hệ thống.
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
          <p><strong>Sinh viên:</strong> {placement.studentName} {placement.studentCode ? `(${placement.studentCode})` : ''}</p>
          <p><strong>Cơ quan thực tập:</strong> {placement.companyName || 'Cơ quan tự liên hệ'}</p>
          <p><strong>Cán bộ hướng dẫn:</strong> {placement.mentorName || 'Ghi trên phiếu mộc đỏ'}</p>
        </div>

        {/* Checkbox xác nhận niêm phong */}
        <label className="flex items-start gap-2.5 p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 cursor-pointer">
          <input
            type="checkbox"
            checked={isSealedConfirmed}
            onChange={(e) => setIsSealedConfirmed(e.target.checked)}
            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
          />
          <div className="text-xs text-emerald-950 font-medium">
            <span>GVHD xác nhận đã nhận phong bì dán kín niêm phong bản giấy và mộc đỏ của cơ quan.</span>
          </div>
        </label>

        {/* Upload ảnh chụp / scan phiếu */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-800">
            Chụp hình / Tải file scan Phiếu đánh giá mộc đỏ (Hệ thống sẽ số hóa)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,application/pdf"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile || isLoading}
              className="text-xs gap-1.5"
            >
              {uploadingFile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5 text-sky-600" />}
              <span>{uploadingFile ? 'Đang tải file lên…' : 'Chụp hình / Chọn ảnh chụp phiếu'}</span>
            </Button>
            {uploadedFileName && (
              <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                <FileCheck className="w-3.5 h-3.5" />
                {uploadedFileName} (Đã số hóa)
              </span>
            )}
          </div>
          <Input
            id="proofUrl"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            placeholder="URL file minh chứng hoặc link lưu trữ số hóa..."
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <Input
              label="Điểm cơ quan (Thang 10)"
              id="mentorScore"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={mentorScore}
              onChange={(e) => setMentorScore(e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Nhận xét của Cán bộ cơ quan ghi trên phiếu"
              id="mentorFeedback"
              value={mentorFeedback}
              onChange={(e) => setMentorFeedback(e.target.value)}
              rows={2}
              required
            />
          </div>
        </div>

        {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} className="gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Xác nhận & Lưu điểm số hóa</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
