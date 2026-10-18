'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Upload, FileUp, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

const REPORT_TYPE_OPTIONS = [
  { value: 'M04', label: 'M-TT-04 · Phiếu đánh giá của GVHD' },
  { value: 'M05', label: 'M-TT-05 · Mẫu báo cáo kết quả thực tập' },
  { value: 'M01', label: 'M-TT-01 · Phiếu kế hoạch giao việc' },
  { value: 'M02', label: 'M-TT-02 · Phiếu theo dõi sinh viên' },
  { value: 'M03', label: 'M-TT-03 · Phiếu đánh giá của cơ quan' },
  { value: 'FORM_04_RECEPTION_8W', label: '04 - Phiếu tiếp nhận SV (8 tuần)' },
  { value: 'FORM_04_RECEPTION_12W', label: '04 - Phiếu tiếp nhận SV (12 tuần)' },
  { value: 'OTHER', label: 'Tài liệu hướng dẫn khác' },
];

const PROGRAM_SCOPE_OPTIONS = [
  { value: 'DEFAULT', label: 'Mẫu chuẩn chung (KTPM, HTTT, CNTT, ATTT...)' },
  { value: 'CS', label: 'Khoa học máy tính (KHMT)' },
  { value: 'NE', label: 'Mạng máy tính & Truyền thông dữ liệu (MMT)' },
  { value: 'ALL', label: 'Áp dụng cho toàn bộ các ngành' },
];

interface FacultyTemplateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  termId: string;
  onSuccess: () => void;
}

export function FacultyTemplateUploadModal({
  isOpen,
  onClose,
  termId,
  onSuccess,
}: FacultyTemplateUploadModalProps) {
  const [reportType, setReportType] = useState('M04');
  const [programCode, setProgramCode] = useState('DEFAULT');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Vui lòng chọn tệp tin (.doc, .docx hoặc .pdf) để tải lên.');
      return;
    }
    if (!termId) {
      setError('Vui lòng chọn học kỳ áp dụng.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('termId', termId);
    formData.append('reportType', reportType);
    formData.append('programCode', programCode);
    formData.append('title', title || file.name);
    formData.append('description', description);
    formData.append('isMandatory', 'true');
    formData.append('file', file);

    try {
      await apiClient.post('/api/v1/organization/templates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải lên biểu mẫu lên Cloudflare R2 thất bại.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tải Lên Biểu Mẫu Thực Tập (Cloudflare R2)"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Select
          label="Loại biểu mẫu quy định"
          id="reportTypeSelect"
          value={reportType}
          onChange={(e) => {
            setReportType(e.target.value);
            const opt = REPORT_TYPE_OPTIONS.find((o) => o.value === e.target.value);
            if (opt && !title) setTitle(opt.label);
          }}
          options={REPORT_TYPE_OPTIONS}
        />

        <Select
          label="Phạm vi ngành đào tạo áp dụng"
          id="programScopeSelect"
          value={programCode}
          onChange={(e) => setProgramCode(e.target.value)}
          options={PROGRAM_SCOPE_OPTIONS}
        />

        <Input
          label="Tên hiển thị biểu mẫu"
          id="titleInput"
          placeholder="VD: Phiếu đánh giá của GVHD (Khoa học Máy tính) - M-TT-04"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Ghi chú / Hướng dẫn áp dụng"
          id="descriptionInput"
          placeholder="Mô tả ngắn về phiên bản, quy chế hoặc lưu ý khi điền biểu mẫu..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Tệp tin Word / PDF (.doc, .docx, .pdf) *</label>
          <div className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-xl p-4 text-center cursor-pointer bg-slate-50/50 hover:bg-sky-50/30 transition-colors">
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept=".doc,.docx,.pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                  if (!title) setTitle(e.target.files[0].name);
                }
              }}
            />
            <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-2">
              <FileUp className="w-6 h-6 text-slate-400" />
              {file ? (
                <span className="text-xs font-semibold text-sky-700">{file.name}</span>
              ) : (
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-sky-600">Nhấn để chọn tệp</span> hoặc kéo thả vào đây
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} className="gap-2">
            <Upload className="w-4 h-4" />
            <span>Phát hành phiên bản mới</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
