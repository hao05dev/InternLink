'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, GraduationCap, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlacementMeta } from '@/features/portfolio/types';

interface LecturerStudentInfoBarProps {
  placement: PlacementMeta;
  placementId: string;
  badgeLabel: string;
  programKey: 'KHMT' | 'MMT' | 'DEFAULT';
}

export function LecturerStudentInfoBar({
  placement,
  placementId,
  badgeLabel,
  programKey,
}: LecturerStudentInfoBarProps) {
  const badgeColors = {
    KHMT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    MMT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DEFAULT: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  return (
    <div className="rounded-xl border bg-white p-5 space-y-3 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {placement.studentName} {placement.studentCode ? `(${placement.studentCode})` : ''}
            </h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${badgeColors[programKey]}`}>
              {badgeLabel}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {placement.companyName || 'Cơ quan tự liên hệ'}
            </span>
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              Học kỳ: {placement.termName || 'Hiện tại'}
            </span>
          </div>
        </div>

        <Link href={`/lecturer/internship-record/${placementId}`}>
          <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5 text-sky-600" />
            <span>Xem báo cáo thực tập (M-TT-05)</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
