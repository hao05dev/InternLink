'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Award } from 'lucide-react';

export interface LecturerRubricCriterion {
  id: string;
  title: string;
  weight: number;
  description: string;
  defaultScore: number;
}

interface LecturerRubricTableProps {
  criteria: LecturerRubricCriterion[];
  scores: Record<string, number>;
  onScoreChange: (criterionId: string, val: string) => void;
  weightedScore: number;
  isTermClosed: boolean;
}

export function LecturerRubricTable({
  criteria,
  scores,
  onScoreChange,
  weightedScore,
  isTermClosed,
}: LecturerRubricTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Tiêu chí đánh giá của Giảng viên (Thang 10)</span>
            </CardTitle>
            <CardDescription>Trọng số điểm GVHD chiếm 60% tổng điểm học phần thực tập</CardDescription>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl self-start sm:self-auto">
            <p className="text-[10px] font-bold text-blue-700 uppercase">Điểm GVHD (60%):</p>
            <p className="text-xl font-black text-blue-900">
              {weightedScore.toFixed(2)} <span className="text-xs font-normal text-blue-700">/ 10</span>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="divide-y divide-slate-100">
          {criteria.map((crit) => (
            <div key={crit.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900">{crit.title}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Trọng số: {crit.weight}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {crit.description}
                </p>
              </div>

              <div className="w-32 flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={scores[crit.id] ?? crit.defaultScore}
                  onChange={(e) => onScoreChange(crit.id, e.target.value)}
                  disabled={isTermClosed}
                  className="text-center font-bold text-slate-900"
                  required
                />
                <span className="text-xs text-slate-400">/ 10</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
