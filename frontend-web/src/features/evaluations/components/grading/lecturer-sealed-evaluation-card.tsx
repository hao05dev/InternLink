'use client';

import React from 'react';
import { Award, FileCheck, ShieldCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LecturerSealedEvaluationCardProps {
  mentorScore: number | null;
  proofUrl?: string;
  isPaperDigitized: boolean;
  isTermClosed: boolean;
  onOpenPaperModal: () => void;
}

export function LecturerSealedEvaluationCard({
  mentorScore,
  proofUrl,
  isPaperDigitized,
  isTermClosed,
  onOpenPaperModal,
}: LecturerSealedEvaluationCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Điểm Đánh Giá của Cán Bộ Cơ Quan (Mẫu M-TT-04 · Trọng số 40%)
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span>Điểm cơ quan:</span>
            <strong className="text-sm text-sky-700">
              {mentorScore !== null ? `${mentorScore.toFixed(1)}/10` : 'Chưa có điểm'}
            </strong>
            {isPaperDigitized ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Đã số hóa phiếu niêm phong bản giấy
              </span>
            ) : mentorScore !== null ? (
              <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-800">
                Đánh giá trực tuyến qua hệ thống
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                Chờ nhận phong bì niêm phong từ SV
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {proofUrl && (
            <a
              href={proofUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-sky-700 hover:underline px-2 py-1 rounded bg-white border border-slate-200"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Xem minh chứng</span>
            </a>
          )}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onOpenPaperModal}
            disabled={isTermClosed}
            className="text-xs gap-1.5 bg-white border border-slate-200 hover:bg-slate-100 shadow-2xs"
          >
            <FileCheck className="h-3.5 w-3.5 text-amber-600" />
            <span>{mentorScore !== null ? 'Cập nhật/Xem phiếu niêm phong' : 'Xác nhận & Nhập điểm phiếu giấy'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
