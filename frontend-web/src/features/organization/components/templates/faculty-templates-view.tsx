'use client';

import React, { useState } from 'react';
import { useFacultyTemplates } from './hooks/use-faculty-templates';
import { FacultyTemplatesFilterBar } from './faculty-templates-filter-bar';
import { FacultyTemplateCard } from './faculty-template-card';
import { FacultyTemplateUploadModal } from './faculty-template-upload-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { CheckCircle2, FileStack } from 'lucide-react';

export default function FacultyTemplatesView() {
  const {
    terms,
    selectedTermId,
    setSelectedTermId,
    templates,
    isLoading,
    message,
    setMessage,
    fetchTemplates,
    toggleActive,
    deleteTemplate,
  } = useFacultyTemplates();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileStack className="w-6 h-6 text-sky-600" />
            <span>Quản Lý Biểu Mẫu Thực Tập (Cloudflare R2)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản trị và phát hành các file biểu mẫu Word (.doc/.docx) chính thức cho sinh viên, doanh nghiệp và giảng viên theo từng học kỳ.
          </p>
        </div>
      </div>

      {message && (
        <div
          role="alert"
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
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      <FacultyTemplatesFilterBar
        terms={terms}
        selectedTermId={selectedTermId}
        onSelectTerm={setSelectedTermId}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          title="Chưa có biểu mẫu nào trong học kỳ này"
          description="Khoa có thể tải lên các file mẫu (.doc, .docx) như 04-Phiếu nhận SV, M-TT-01 đến M-TT-05 lên Cloudflare R2 để sinh viên và doanh nghiệp tải về."
          action={
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 cursor-pointer"
            >
              Tải lên biểu mẫu đầu tiên
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {templates.map((tpl) => (
            <FacultyTemplateCard
              key={tpl.id}
              template={tpl}
              onToggleActive={toggleActive}
              onDelete={deleteTemplate}
            />
          ))}
        </div>
      )}

      <FacultyTemplateUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        termId={selectedTermId}
        onSuccess={() => {
          setMessage({ type: 'success', text: 'Tải lên biểu mẫu thành công và đã sẵn sàng trên Cloudflare R2!' });
          fetchTemplates();
        }}
      />
    </div>
  );
}
