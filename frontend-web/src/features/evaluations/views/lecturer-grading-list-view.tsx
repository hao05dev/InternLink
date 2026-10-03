'use client';
import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { portfolioApi, errorText } from '@/features/portfolio/api';
import type { PlacementMeta } from '@/features/portfolio/types';
import LecturerRosterFilter, { type FilterState } from '@/features/portfolio/components/lecturer/lecturer-roster-filter';
import LecturerGradingStats from '../components/lecturer/lecturer-grading-stats';
import LecturerGradingTable from '../components/lecturer/lecturer-grading-table';

const initialFilters: FilterState = {
  academicYear: 'ALL',
  semester: 'ALL',
  status: 'ALL',
  search: '',
};

export default function LecturerGradingListView() {
  const [placements, setPlacements] = useState<PlacementMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await portfolioApi.placements();
      setPlacements(res.data || []);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const years = useMemo(() => {
    const set = new Set<string>();
    placements.forEach((p) => { if (p.academicYear) set.add(p.academicYear); });
    return Array.from(set).sort().reverse();
  }, [placements]);

  const semesters = useMemo(() => {
    const set = new Set<string>();
    placements.forEach((p) => {
      if (filters.academicYear === 'ALL' || p.academicYear === filters.academicYear) {
        if (p.semester) set.add(p.semester);
      }
    });
    return Array.from(set).sort();
  }, [placements, filters.academicYear]);

  const filteredPlacements = useMemo(() => {
    return placements.filter((p) => {
      if (filters.academicYear !== 'ALL' && p.academicYear !== filters.academicYear) return false;
      if (filters.semester !== 'ALL' && p.semester !== filters.semester) return false;
      if (filters.status === 'ACTIVE' && !['ACTIVE', 'PREPARING'].includes(p.status)) return false;
      if (filters.status === 'COMPLETED' && !['COMPLETED', 'APPROVED', 'APPROVED_BY_LECTURER'].includes(p.status)) return false;
      if (filters.status === 'EXTENDED' && !p.isExtended) return false;
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const sName = (p.studentName || '').toLowerCase();
        const sCode = (p.studentCode || '').toLowerCase();
        const cName = (p.companyName || '').toLowerCase();
        if (!sName.includes(q) && !sCode.includes(q) && !cName.includes(q)) return false;
      }
      return true;
    });
  }, [placements, filters]);

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-sky-700" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Chấm điểm & Báo cáo CLO (Lecturer Grading)</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Đánh giá báo cáo thực tập, chấm điểm Rubric của Giảng viên hướng dẫn và tổng hợp chuẩn đầu ra học phần.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Tải lại danh sách
        </Button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}

      <LecturerGradingStats placements={placements} />

      <LecturerRosterFilter
        years={years}
        semesters={semesters}
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
      />

      {loading ? (
        <div role="status" className="rounded-xl border bg-white p-12 text-center text-sm text-slate-500">
          Đang tải danh sách sinh viên chấm điểm…
        </div>
      ) : (
        <LecturerGradingTable placements={filteredPlacements} />
      )}
    </div>
  );
}
