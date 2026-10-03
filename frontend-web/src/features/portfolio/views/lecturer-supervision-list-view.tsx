'use client';
import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { portfolioApi, errorText } from '../api';
import type { PlacementMeta } from '../types';
import LecturerStatsBar from '../components/lecturer/lecturer-stats-bar';
import LecturerRosterFilter, { type FilterState } from '../components/lecturer/lecturer-roster-filter';
import LecturerStudentsTable from '../components/lecturer/lecturer-students-table';

const initialFilters: FilterState = {
  academicYear: 'ALL',
  semester: 'ALL',
  status: 'ALL',
  search: '',
};

export default function LecturerSupervisionListView() {
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

  // Compute unique academic years from placements
  const years = useMemo(() => {
    const set = new Set<string>();
    placements.forEach((p) => {
      if (p.academicYear) set.add(p.academicYear);
    });
    return Array.from(set).sort().reverse();
  }, [placements]);

  // Compute semesters based on selected academic year (cascading)
  const semesters = useMemo(() => {
    const set = new Set<string>();
    placements.forEach((p) => {
      if (filters.academicYear === 'ALL' || p.academicYear === filters.academicYear) {
        if (p.semester) set.add(p.semester);
      }
    });
    return Array.from(set).sort();
  }, [placements, filters.academicYear]);

  // Filtered placements
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
            <GraduationCap className="h-6 w-6 text-sky-700" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Danh sách hướng dẫn thực tập</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý, theo dõi tiến độ và đánh giá sinh viên được phân công hướng dẫn theo năm học và học kỳ.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Tải lại danh sách
        </Button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}

      <LecturerStatsBar placements={placements} />

      <LecturerRosterFilter
        years={years}
        semesters={semesters}
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
      />

      {loading ? (
        <div role="status" className="rounded-xl border bg-white p-12 text-center text-sm text-slate-500">
          Đang tải danh sách sinh viên hướng dẫn…
        </div>
      ) : (
        <LecturerStudentsTable placements={filteredPlacements} />
      )}
    </div>
  );
}
