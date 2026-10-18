'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import type { ReportTemplateItem } from './hooks/use-faculty-templates';

interface FacultyTemplateCardProps {
  template: ReportTemplateItem;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
}

export function FacultyTemplateCard({
  template,
  onToggleActive,
  onDelete,
}: FacultyTemplateCardProps) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getProgramBadge = (code?: string) => {
    switch (code) {
      case 'CS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Khoa học Máy tính (KHMT)</span>;
      case 'NE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Mạng MT & TT (MMT)</span>;
      case 'ALL':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Toàn khoa</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Mẫu chuẩn chung</span>;
    }
  };

  return (
    <Card className="hover:border-slate-300 transition-colors shadow-2xs">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 shrink-0">
            <FileText className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">{template.title}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {template.reportType}
              </span>
              {getProgramBadge(template.programCode)}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                v{template.versionNumber}
              </span>
              {template.isActive ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Đang áp dụng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                  <XCircle className="w-3 h-3" />
                  Tạm ngưng
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500">
              Tệp: <span className="font-mono text-slate-700">{template.fileName}</span> ({formatSize(template.fileSizeBytes)})
              {template.uploadedByName && ` · Người cập nhật: ${template.uploadedByName}`}
            </p>

            {template.description && (
              <p className="text-xs text-slate-600 italic mt-0.5">{template.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => window.open(`/api/v1/organization/templates/${template.id}/download`, '_blank')}
            className="gap-1.5 text-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải về</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onToggleActive(template.id)}
            className="text-xs cursor-pointer"
          >
            {template.isActive ? 'Tắt' : 'Bật'}
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              if (window.confirm(`Bạn có chắc muốn xóa biểu mẫu "${template.title}"?`)) {
                onDelete(template.id);
              }
            }}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
