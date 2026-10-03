'use client';
import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { portfolioApi, errorText } from '../api';
import type { PlacementMeta } from '../types';
import LecturerStatsBar from '../components/lecturer/lecturer-stats-bar';
import MentorRosterFilter, { type MentorFilterState } from '../components/mentor/mentor-roster-filter';
import MentorAssessmentTable from '../components/mentor/mentor-assessment-table';

const initialFilters: MentorFilterState = {
  year: 'ALL',
  term: 'ALL',
  status: 'ALL',
  search: '',
};

export default function MentorAssessmentListView() {
  const [placements, setPlacements] = useState<PlacementMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<MentorFilterState>(initialFilters);

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

  useEffect(() => { loadData(); }, []);

  const years = useMemo(() => {
    const set = new Set<string>();
    placements.forEach((p) => {
      const y = p.startDate ? p.startDate.slice(0, 4) : p.academicYear ? p.academicYear.slice(0, 4) : '';
      if (y) set.add(y);
    });
    return Array.from(set).sort().reverse();
  }, [placements]);

  const terms = useMemo(() => {
    const set = new Set<string>();
    placements.forEach((p) => {
      const y = p.startDate ? p.startDate.slice(0, 4) : p.academicYear ? p.academicYear.slice(0, 4) : '';
      if (filters.year === 'ALL' || y === filters.year) {
        if (p.termName) set.add(p.termName);
      }
    });
    return Array.from(set).sort();
  }, [placements, filters.year]);

  const filteredPlacements = useMemo(() => {
    return placements.filter((p) => {
      const y = p.startDate ? p.startDate.slice(0, 4) : p.academicYear ? p.academicYear.slice(0, 4) : '';
      if (filters.year !== 'ALL' && y !== filters.year) return false;
      if (filters.term !== 'ALL' && p.termName !== filters.term) return false;
      if (filters.status === 'ACTIVE' && !['ACTIVE', 'PREPARING'].includes(p.status)) return false;
      if (filters.status === 'COMPLETED' && !['COMPLETED', 'APPROVED', 'APPROVED_BY_LECTURER', 'APPROVED_BY_MENTOR'].includes(p.status)) return false;
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const sName = (p.studentName || '').toLowerCase();
        const sCode = (p.studentCode || '').toLowerCase();
        if (!sName.includes(q) && !sCode.includes(q)) return false;
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đánh giá kết quả thực tập (Phiếu M-TT-03)</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Chấm điểm các tiêu chí chấp hành nội quy, năng lực chuyên môn và nhận xét đánh giá sinh viên khi kết thúc kỳ thực tập.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Tải lại danh sách
        </Button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}

      <LecturerStatsBar placements={placements} />

      <MentorRosterFilter
        years={years}
        terms={terms}
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
      />

      {loading ? (
        <div role="status" className="rounded-xl border bg-white p-12 text-center text-sm text-slate-500">
          Đang tải danh sách thực tập sinh…
        </div>
      ) : (
        <MentorAssessmentTable placements={filteredPlacements} />
      )}
    </div>
  );
}
