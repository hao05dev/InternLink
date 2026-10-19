'use client';
import Link from 'next/link';
import { ArrowRight, Building2, User, Award } from 'lucide-react';
import { StatePill } from '@/features/portfolio/journal-panel';
import { dateLabel } from '@/features/portfolio/types';
import type { PlacementMeta } from '@/features/portfolio/types';

interface LecturerGradingTableProps {
  placements: PlacementMeta[];
}

export default function LecturerGradingTable({ placements }: LecturerGradingTableProps) {
  if (placements.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <User className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 font-semibold text-slate-700">Không tìm thấy sinh viên cần chấm điểm</p>
        <p className="mt-1 text-xs text-slate-500">Vui lòng thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Sinh viên</th>
              <th className="px-4 py-3">Đơn vị & Hướng dẫn</th>
              <th className="px-4 py-3">Học kỳ & Đợt</th>
              <th className="px-4 py-3">Thời gian thực tập</th>
              <th className="px-4 py-3">Trạng thái hồ sơ</th>
              <th className="px-4 py-3 text-right">Thao tác chấm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {placements.map((p) => {
              const isTermClosed = p.termStatus === 'CLOSED';
              return (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-900">{p.studentName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-slate-500">{p.studentCode || 'Chưa cập nhật MSSV'}</span>
                      {p.programName && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
                          {p.programName}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium">{p.companyName}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">CBHD: {p.mentorName || 'Chưa phân công'}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-800">{p.termName}</p>
                    <span className={`mt-1 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                      isTermClosed ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {isTermClosed ? 'Học kỳ đóng' : 'Học kỳ mở'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">
                    <p>{dateLabel(p.startDate)} – {dateLabel(p.endDate)}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{p.weekCount} tuần</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatePill status={p.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/lecturer/grading/${p.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition-colors"
                    >
                      <Award className="h-3.5 w-3.5" />
                      <span>{isTermClosed ? 'Xem bảng điểm' : 'Chấm điểm'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
