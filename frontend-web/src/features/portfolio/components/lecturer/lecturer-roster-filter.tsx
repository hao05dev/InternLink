'use client';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fieldClass } from '../../types';

export interface FilterState {
  academicYear: string;
  semester: string;
  status: string;
  search: string;
}

interface LecturerRosterFilterProps {
  years: string[];
  semesters: string[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export default function LecturerRosterFilter({
  years,
  semesters,
  filters,
  onChange,
  onReset,
}: LecturerRosterFilterProps) {
  const update = (patch: Partial<FilterState>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <Filter className="h-3.5 w-3.5" />
        <span>Bộ lọc phân công hướng dẫn</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tier 1: Academic Year */}
        <div>
          <label className="block text-xs font-medium text-slate-600">Năm học</label>
          <select
            aria-label="Chọn năm học"
            className={`${fieldClass} mt-1`}
            value={filters.academicYear}
            onChange={(e) => update({ academicYear: e.target.value, semester: 'ALL' })}
          >
            <option value="ALL">Tất cả năm học</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Tier 2: Semester */}
        <div>
          <label className="block text-xs font-medium text-slate-600">Học kỳ</label>
          <select
            aria-label="Chọn học kỳ"
            className={`${fieldClass} mt-1`}
            value={filters.semester}
            onChange={(e) => update({ semester: e.target.value })}
          >
            <option value="ALL">Tất cả học kỳ</option>
            {semesters.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Tier 3: Status */}
        <div>
          <label className="block text-xs font-medium text-slate-600">Trạng thái thực tập</label>
          <select
            aria-label="Chọn trạng thái"
            className={`${fieldClass} mt-1`}
            value={filters.status}
            onChange={(e) => update({ status: e.target.value })}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang thực tập (ACTIVE)</option>
            <option value="COMPLETED">Đã hoàn thành</option>
            <option value="EXTENDED">Được gia hạn báo cáo</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-xs font-medium text-slate-600">Tìm kiếm</label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tên, MSSV, đơn vị..."
              aria-label="Tìm kiếm sinh viên"
              className={`${fieldClass} pl-9`}
              value={filters.search}
              onChange={(e) => update({ search: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button variant="ghost" size="sm" onClick={onReset} className="text-xs text-slate-500 hover:text-slate-800">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Đặt lại bộ lọc
        </Button>
      </div>
    </div>
  );
}
