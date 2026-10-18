'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export interface TemplateQuickDownloadProps {
  reportType: string;
  programCode?: string;
  label?: string;
  subLabel?: string;
  termId?: string;
  departmentId?: string;
  variant?: 'pill' | 'button' | 'card';
  className?: string;
}

export function TemplateQuickDownload({
  reportType,
  programCode,
  label,
  subLabel,
  termId,
  departmentId,
  variant = 'button',
  className = '',
}: TemplateQuickDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (reportType === 'M04' && termId) {
        // Phân phối chính xác biểu mẫu đánh giá M-TT-04 theo đúng ngành sinh viên
        const query = new URLSearchParams({ termId });
        if (programCode) query.set('programCode', programCode);
        const res = await apiClient.get<{ id: string; fileName: string }>(`/api/v1/organization/templates/evaluation-form?${query.toString()}`);
        if (res.data?.id) {
          window.open(`/api/v1/organization/templates/${res.data.id}/download`, '_blank');
          return;
        }
      }

      const query = new URLSearchParams();
      if (termId) query.set('termId', termId);
      if (departmentId) query.set('departmentId', departmentId);
      query.set('activeOnly', 'true');
      const url = `/api/v1/organization/templates?${query.toString()}`;
      const res = await apiClient.get<Array<{ id: string; reportType: string; fileUrl: string; fileName: string; programCode?: string }>>(url);

      // Ưu tiên khớp chính xác reportType và programCode
      let matched = res.data?.find((t) => t.reportType === reportType && t.programCode === programCode);
      if (!matched) {
        matched = res.data?.find((t) => t.reportType === reportType && (t.programCode === 'DEFAULT' || t.programCode === 'ALL'));
      }
      if (!matched) {
        matched = res.data?.find((t) => t.reportType === reportType);
      }

      if (matched) {
        window.open(`/api/v1/organization/templates/${matched.id}/download`, '_blank');
      } else {
        window.open(`/api/v1/organization/templates/fallback/${reportType}`, '_blank');
      }
    } catch {
      window.open(`/api/v1/organization/templates/fallback/${reportType}`, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const defaultLabel = label || `Tải biểu mẫu ${reportType} (.doc)`;

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer ${className}`}
        title="Tải biểu mẫu chính thức từ Khoa"
      >
        {isDownloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
        <span>{defaultLabel}</span>
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-3.5 rounded-xl border border-sky-100 bg-sky-50/40 flex items-center justify-between gap-3 text-xs ${className}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{defaultLabel}</p>
            {subLabel && <p className="text-slate-500 text-[11px] mt-0.5">{subLabel}</p>}
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleDownload}
          disabled={isDownloading}
          className="gap-1.5 text-xs bg-white cursor-pointer"
        >
          {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          <span>Tải file .doc</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleDownload}
      disabled={isDownloading}
      className={`gap-1.5 text-xs bg-white hover:bg-slate-50 cursor-pointer ${className}`}
    >
      {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
      <span>{defaultLabel}</span>
    </Button>
  );
}
