'use client';

import React from 'react';
import { AlertTriangle, Send, Save, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { RubricCriterion } from '../../utils/program-rubric-criteria';

interface LecturerProgramRubricFormProps {
  criteria: RubricCriterion[];
  scores: Record<string, string>;
  onScoreChange: (criterionId: string, value: string) => void;
  comments: string;
  onCommentsChange: (value: string) => void;
  mentorScore: number | null;
  savedStatus: string | null;
  isLocked: boolean;
  isTermClosed: boolean;
  submitting: boolean;
  onSave: (status: 'DRAFT' | 'SUBMITTED') => Promise<void>;
}

export function LecturerProgramRubricForm({
  criteria,
  scores,
  onScoreChange,
  comments,
  onCommentsChange,
  mentorScore,
  savedStatus,
  isLocked,
  isTermClosed,
  submitting,
  onSave,
}: LecturerProgramRubricFormProps) {
  const isSubmitted = savedStatus === 'SUBMITTED';

  const parsed = criteria.map((c) => {
    const raw = scores[c.id];
    const value = raw === undefined || raw.trim() === '' ? null : Number(raw);
    return {
      ...c,
      value: value !== null && Number.isFinite(value) && value >= 0 && value <= 10 ? value : null,
      raw,
    };
  });

  const isComplete = parsed.every((c) => c.value !== null);
  const weightedScore = isComplete
    ? parseFloat(parsed.reduce((sum, c) => sum + (c.value as number) * (c.weight / 100), 0).toFixed(2))
    : null;

  const finalScore =
    weightedScore !== null && mentorScore !== null
      ? parseFloat((mentorScore * 0.4 + weightedScore * 0.6).toFixed(2))
      : null;

  const hasDiscrepancy =
    mentorScore !== null && weightedScore !== null && Math.abs(mentorScore - weightedScore) >= 3.0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSave('SUBMITTED');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {hasDiscrepancy && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold text-sm text-amber-900">
              Cảnh báo: Có sự chênh lệch điểm số đáng kể (&ge; 3.0 điểm)
            </p>
            <p>
              Điểm Doanh nghiệp: {mentorScore?.toFixed(1)}/10 &bull; Điểm GVHD: {weightedScore?.toFixed(1)}/10. GVHD nên rà soát kỹ báo cáo và giải trình trước khi chốt điểm.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-white p-5 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between border-b pb-3 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Phiếu Chấm Điểm của Giảng Viên Hướng Dẫn (Trọng số 60% học phần)
            </h3>
            {savedStatus && (
              <span
                className={`inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  isSubmitted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                Trạng thái: {isSubmitted ? 'Đã nộp chính thức' : 'Bản nháp (chưa nộp)'}
              </span>
            )}
          </div>
          <div className="flex gap-2 text-xs">
            <span className="rounded-lg bg-sky-50 px-3 py-1 font-bold text-sky-800 border border-sky-100">
              Điểm GVHD: {weightedScore !== null ? `${weightedScore.toFixed(2)}/10` : 'Chưa chấm đủ'}
            </span>
            <span className="rounded-lg bg-emerald-50 px-3 py-1 font-bold text-emerald-800 border border-emerald-100">
              Tổng điểm HP (10): {finalScore !== null ? `${finalScore.toFixed(2)}/10` : 'Chờ hoàn tất'}
            </span>
          </div>
        </div>

        {/* Danh sách tiêu chí Rubric */}
        <div className="space-y-4 divide-y divide-slate-100">
          {criteria.map((c) => (
            <div key={c.id} className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 max-w-xl">
                <p className="text-sm font-semibold text-slate-800">
                  {c.title} <span className="text-xs text-sky-600 font-medium">({c.weight}%)</span>
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">{c.description}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="0.0"
                  value={scores[c.id] ?? ''}
                  disabled={isLocked}
                  onChange={(e) => onScoreChange(c.id, e.target.value)}
                  className="w-20 rounded-lg border border-slate-300 px-3 py-1.5 text-center font-bold text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
                />
                <span className="text-xs text-slate-400 font-medium">/ 10</span>
              </div>
            </div>
          ))}
        </div>

        {/* Nhận xét của GVHD */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-800">
            Nhận xét & Đánh giá tổng quát của Giảng viên hướng dẫn
          </label>
          <Textarea
            value={comments}
            disabled={isLocked}
            onChange={(e) => onCommentsChange(e.target.value)}
            rows={3}
            placeholder="Nhập nhận xét về thái độ, năng lực thực tế, tiến độ hoàn thành và kết quả thực tập của sinh viên..."
          />
        </div>

        {/* Nút hành động */}
        {!isLocked && (
          <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting || isTermClosed}
              onClick={() => void onSave('DRAFT')}
              className="gap-1.5 text-xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Lưu bản nháp</span>
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting || !isComplete || isTermClosed}
              className="gap-1.5 text-xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Nộp bảng điểm chính thức</span>
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
