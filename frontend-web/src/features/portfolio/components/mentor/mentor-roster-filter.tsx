'use client';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fieldClass } from '../../types';

export interface MentorFilterState {
  year: string;
  term: string;
  status: string;
  search: string;
}

interface MentorRosterFilterProps {
  years: string[];
  terms: string[];
  filters: MentorFilterState;
  onChange: (filters: MentorFilterState) => void;
  onReset: () => void;
}

export default function MentorRosterFilter({
  years,
  terms,
  filters,
  onChange,
  onReset,
}: MentorRosterFilterProps) {
  const update = (patch: Partial<MentorFilterState>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <Filter className="h-3.5 w-3.5" />
        <span>Bộ lọc thực tập sinh Doanh nghiệp</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tier 1: Year */}
        <div>
          <label className="block text-xs font-medium text-slate-600">Năm thực tập / tiếp nhận</label>
          <select
            aria-label="Chọn năm thực tập"
            className={`${fieldClass} mt-1`}
            value={filters.year}
            onChange={(e) => update({ year: e.target.value, term: 'ALL' })}
          >
            <option value="ALL">Tất cả các năm</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Tier 2: Batch / Term */}
        <div>
          <label className="block text-xs font-medium text-slate-600">Đợt / Học kỳ thực tập</label>
          <select
            aria-label="Chọn đợt thực tập"
            className={`${fieldClass} mt-1`}
            value={filters.term}
            onChange={(e) => update({ term: e.target.value })}
          >
            <option value="ALL">Tất cả các đợt</option>
            {terms.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Tier 3: Status */}
        <div>
          <label className="block text-xs font-medium text-slate-600">Trạng thái thực tập</label>
          <select
            aria-label="Chọn trạng thái thực tập"
            className={`${fieldClass} mt-1`}
            value={filters.status}
            onChange={(e) => update({ status: e.target.value })}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang thực tập (ACTIVE)</option>
            <option value="COMPLETED">Đã hoàn thành (COMPLETED)</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-xs font-medium text-slate-600">Tìm kiếm</label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tên, MSSV..."
              aria-label="Tìm kiếm thực tập sinh"
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
