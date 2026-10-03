'use client';
import { Users, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import type { PlacementMeta } from '@/features/portfolio/types';

interface LecturerGradingStatsProps {
  placements: PlacementMeta[];
}

export default function LecturerGradingStats({ placements }: LecturerGradingStatsProps) {
  const total = placements.length;
  const completedGrading = placements.filter(p => ['COMPLETED', 'APPROVED', 'APPROVED_BY_LECTURER'].includes(p.status)).length;
  const pendingGrading = placements.filter(p => !['COMPLETED', 'APPROVED', 'APPROVED_BY_LECTURER'].includes(p.status)).length;
  const isExtendedCount = placements.filter(p => !!p.isExtended).length;

  const stats = [
    { label: 'Tổng số sinh viên', value: total, icon: Users, color: 'text-sky-700', bg: 'bg-sky-50' },
    { label: 'Đã hoàn thành điểm', value: completedGrading, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Chưa hoàn tất chấm', value: pendingGrading, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Hồ sơ đã gia hạn', value: isExtendedCount, icon: AlertTriangle, color: 'text-indigo-700', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{item.label}</span>
              <div className={`rounded-lg p-2 ${item.bg} ${item.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{item.value}</p>
          </div>
        );
      })}
    </div>
  );
}
