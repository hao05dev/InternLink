'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, MinusCircle } from 'lucide-react';

interface LecturerPenaltyChecklistCardProps {
  missedBriefing: boolean;
  onToggleMissedBriefing: (checked: boolean) => void;
  lateM01Submission: boolean;
  onToggleLateM01Submission: (checked: boolean) => void;
  totalPenalty: number;
  isTermClosed: boolean;
}

export function LecturerPenaltyChecklistCard({
  missedBriefing,
  onToggleMissedBriefing,
  lateM01Submission,
  onToggleLateM01Submission,
  totalPenalty,
  isTermClosed,
}: LecturerPenaltyChecklistCardProps) {
  return (
    <Card className="border-rose-100 bg-rose-50/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2 text-rose-900">
              <MinusCircle className="w-4 h-4 text-rose-600" />
              <span>Quy Tắc Trừ Điểm Vi Phạm Quy Chế (Theo M-TT-04)</span>
            </CardTitle>
            <CardDescription className="text-xs text-rose-700/80">
              Căn cứ theo mục Lưu ý trên Phiếu đánh giá M-TT-04 của Khoa Công nghệ Thông tin & Truyền thông
            </CardDescription>
          </div>

          {totalPenalty > 0 && (
            <div className="px-3 py-1.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-bold">
              Tổng điểm trừ: -{totalPenalty.toFixed(1)} điểm
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-rose-200/80 cursor-pointer hover:bg-rose-50/40 transition-colors">
          <input
            type="checkbox"
            checked={missedBriefing}
            onChange={(e) => onToggleMissedBriefing(e.target.checked)}
            disabled={isTermClosed}
            className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
          />
          <div className="space-y-0.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">Không dự họp để nghe phổ biến thực tập thực tế</span>
              <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[10px]">
                -1.0 điểm
              </span>
            </div>
            <p className="text-slate-500">
              Sinh viên vắng mặt không lý do chính đáng trong buổi họp phổ biến học phần đầu kỳ của Khoa/Bộ môn.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-rose-200/80 cursor-pointer hover:bg-rose-50/40 transition-colors">
          <input
            type="checkbox"
            checked={lateM01Submission}
            onChange={(e) => onToggleLateM01Submission(e.target.checked)}
            disabled={isTermClosed}
            className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
          />
          <div className="space-y-0.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">Không gửi Phiếu giao việc (M-TT-01) về Khoa đúng hạn</span>
              <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[10px]">
                -1.0 điểm
              </span>
            </div>
            <p className="text-slate-500">
              Sinh viên không nộp bản scan Phiếu giao việc có đủ mộc dấu của công ty trong tuần đầu thực tập theo quy định.
            </p>
          </div>
        </label>

        {totalPenalty === 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic p-1">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Sinh viên chấp hành tốt kỷ luật thực tập, không vi phạm các điều khoản trừ điểm.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
