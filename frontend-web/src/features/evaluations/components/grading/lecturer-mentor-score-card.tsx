'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, FileCheck } from 'lucide-react';

interface LecturerMentorScoreCardProps {
  mentorScore: number | null;
  onOpenPaperModal: () => void;
  isTermClosed: boolean;
}

export function LecturerMentorScoreCard({
  mentorScore,
  onOpenPaperModal,
  isTermClosed,
}: LecturerMentorScoreCardProps) {
  return (
    <Card className="border-sky-100 bg-sky-50/30">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 rounded-lg text-sky-700">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                Điểm Đánh Giá của Doanh Nghiệp (M-TT-03 · 40% tổng điểm)
              </p>
              <div className="mt-0.5">
                {mentorScore !== null ? (
                  <span className="text-slate-600">
                    Điểm số đã ghi nhận:{' '}
                    <strong className="text-sky-800 text-sm font-bold">{mentorScore.toFixed(2)} / 10</strong>
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Doanh nghiệp chưa hoàn thành chấm điểm trên hệ thống</span>
                )}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onOpenPaperModal}
            disabled={isTermClosed}
            title={isTermClosed ? 'Học kỳ đã kết thúc (CLOSED)' : undefined}
            className="text-xs gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>{mentorScore !== null ? 'Sửa điểm phiếu giấy' : 'Nhập điểm thay bằng phiếu giấy'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
