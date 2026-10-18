'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, CheckCircle2 } from 'lucide-react';

interface LecturerGradingSummaryCardProps {
  comments: string;
  onCommentsChange: (val: string) => void;
  weightedScore: number;
  mentorScore: number | null;
  totalPenalty: number;
  finalCourseGrade: number;
  isSubmitting: boolean;
  isTermClosed: boolean;
}

export function LecturerGradingSummaryCard({
  comments,
  onCommentsChange,
  weightedScore,
  mentorScore,
  totalPenalty,
  finalCourseGrade,
  isSubmitting,
  isTermClosed,
}: LecturerGradingSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Nhận xét chi tiết của Giảng viên hướng dẫn</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          rows={3}
          value={comments}
          onChange={(e) => onCommentsChange(e.target.value)}
          disabled={isTermClosed}
          placeholder="Ghi nhận xét và kiến nghị..."
          required
        />

        {/* Grade Breakdown Summary Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Điểm GVHD (60%)</p>
            <p className="text-base font-extrabold text-blue-900">{weightedScore.toFixed(2)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Điểm DN (40%)</p>
            <p className="text-base font-extrabold text-sky-900">
              {mentorScore !== null ? mentorScore.toFixed(2) : '--'}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-rose-500 uppercase">Điểm trừ vi phạm</p>
            <p className="text-base font-extrabold text-rose-700">
              {totalPenalty > 0 ? `-${totalPenalty.toFixed(1)}` : '0.0'}
            </p>
          </div>
          <div className="space-y-0.5 bg-emerald-100/60 rounded-xl p-1 border border-emerald-300">
            <p className="text-[10px] font-bold text-emerald-800 uppercase">Tổng điểm HP</p>
            <p className="text-lg font-black text-emerald-900">{finalCourseGrade.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isTermClosed}
          title={isTermClosed ? 'Học kỳ đã kết thúc (CLOSED)' : undefined}
          className="gap-2 px-6 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Lưu điểm đánh giá GVHD</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
