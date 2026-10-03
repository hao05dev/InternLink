'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CalendarDays, ClipboardList, FileText, CalendarClock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { portfolioApi, errorText } from '../api';
import { FORM_NAMES, dateLabel } from '../types';
import type { FormKind, Journal, Overview, PlacementMeta } from '../types';
import JournalPanel, { StatePill } from '../journal-panel';
import WeeksPanel from '../weeks-panel';
import FormPanel from '../form-panel';
import TermClosedBanner from '../components/term-closed-banner';
import GrantExtensionModal from '../components/modals/grant-extension-modal';

type Tab = 'overview' | 'days' | 'weeks' | 'forms';

export default function LecturerStudentDetailView({ placementId }: { placementId: string }) {
  const { user } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [days, setDays] = useState<Journal[]>([]);
  const [tab, setTab] = useState<Tab>('overview');
  const [kind, setKind] = useState<FormKind>('M01');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExtensionOpen, setIsExtensionOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!placementId) return;
    setLoading(true);
    setError('');
    try {
      const [o, d] = await Promise.all([portfolioApi.overview(placementId), portfolioApi.days(placementId)]);
      setOverview(o.data!);
      setDays(d.data || []);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [placementId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExtensionSuccess = (updated: PlacementMeta) => {
    if (overview) {
      setOverview({ ...overview, placement: updated });
    }
  };

  const isTermClosed = overview?.placement.termStatus === 'CLOSED';
  const form = overview?.forms.find(f => f.kind === kind);
  const tabs = [
    { key: 'overview', name: 'Tổng quan', icon: BookOpen },
    { key: 'days', name: 'Nhật ký ngày', icon: CalendarDays },
    { key: 'weeks', name: 'Tổng hợp tuần', icon: ClipboardList },
    { key: 'forms', name: 'Biểu mẫu & báo cáo', icon: FileText },
  ] as const;

  return (
    <div className="mx-auto max-w-screen-2xl space-y-5 pb-12">
      {/* Navigation Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/lecturer/supervision"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại danh sách phân công</span>
        </Link>
        <div className="flex items-center gap-2">
          {overview && !isTermClosed && (
            <Button size="sm" variant="outline" onClick={() => setIsExtensionOpen(true)}>
              <CalendarClock className="mr-1.5 h-4 w-4 text-sky-600" />
              Gia hạn nộp báo cáo
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Tải lại
          </Button>
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
      {loading && <div role="status" className="rounded-xl border bg-white p-12 text-center text-slate-500">Đang tải hồ sơ sinh viên…</div>}

      {overview && !loading && (
        <>
          {isTermClosed && <TermClosedBanner termName={overview.placement.termName} />}

          {/* Student Info Card */}
          <div className="grid gap-4 rounded-xl border bg-white p-5 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">Sinh viên hướng dẫn</p>
              <p className="mt-1 text-base font-bold text-slate-900">{overview.placement.studentName}</p>
              <p className="text-xs text-slate-600">MSSV: {overview.placement.studentCode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Đơn vị thực tập</p>
              <p className="mt-1 font-semibold text-slate-800">{overview.placement.companyName}</p>
              <p className="text-xs text-slate-500">CBHD: {overview.placement.mentorName || 'Chưa phân công'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Thời gian · {overview.placement.weekCount} tuần</p>
              <p className="mt-1 text-slate-800">{dateLabel(overview.placement.startDate)} – {dateLabel(overview.placement.endDate)}</p>
              <p className="text-xs text-slate-500">Học kỳ: {overview.placement.termName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Trạng thái hồ sơ</p>
              <div className="mt-1"><StatePill status={overview.placement.status} /></div>
              {overview.placement.reportDueAt && (
                <p className="mt-2 text-xs text-slate-600">
                  Hạn nộp: {new Date(overview.placement.reportDueAt).toLocaleDateString('vi-VN')}
                  {overview.placement.isExtended && <span className="ml-1 font-semibold text-indigo-700">(Đã gia hạn)</span>}
                </p>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div role="tablist" aria-label="Các phần hồ sơ" className="flex flex-wrap gap-1 rounded-xl border bg-white p-1">
            {tabs.map(({ key, name, icon: Icon }) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  tab === key ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {tab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  ['Ngày đã ghi', days.length],
                  ['Ngày chờ xác nhận', days.filter(d => d.status === 'SUBMITTED').length],
                  ['Buổi đã xác nhận', days.filter(d => d.status === 'CONFIRMED').reduce((s, d) => s + d.sessions, 0)],
                  ['Giờ đã xác nhận', days.filter(d => d.status === 'CONFIRMED').reduce((s, d) => s + Number(d.hours), 0).toFixed(2)],
                ].map(([lbl, val]) => (
                  <div key={lbl as string} className="rounded-xl border bg-white p-4">
                    <p className="text-xs text-slate-500">{lbl}</p>
                    <p className="mt-1 text-2xl font-bold text-sky-900">{val}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {overview.forms.map(f => (
                  <button
                    key={f.kind}
                    className="rounded-xl border bg-white p-4 text-left hover:border-sky-300 transition-colors"
                    onClick={() => { setTab('forms'); setKind(f.kind); }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm text-slate-900">{FORM_NAMES[f.kind]}</h3>
                      <StatePill status={f.status} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {f.canEdit ? 'Bạn phụ trách hoàn thiện biểu mẫu này.' : !f.canRead ? 'Chỉ hiển thị sau khi công bố.' : 'Xem nội dung và tải biểu mẫu theo quyền.'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {tab === 'days' && <JournalPanel key={placementId} overview={overview} days={days} userId={user?.id || ''} onRefresh={loadData} />}
          {tab === 'weeks' && <WeeksPanel overview={overview} onRefresh={loadData} />}
          {tab === 'forms' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {overview.forms.map(f => (
                  <button
                    key={f.kind}
                    aria-pressed={kind === f.kind}
                    onClick={() => setKind(f.kind)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      kind === f.kind ? 'border-sky-400 bg-sky-50 text-sky-900 font-semibold' : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {FORM_NAMES[f.kind]}
                  </button>
                ))}
              </div>
              {form && <FormPanel key={`${placementId}:${kind}:${form.status}:${form.published}`} form={form} overview={overview} userId={user?.id || ''} onRefresh={loadData} />}
            </div>
          )}

          {/* Extension Modal */}
          <GrantExtensionModal
            placement={overview.placement}
            isOpen={isExtensionOpen}
            onClose={() => setIsExtensionOpen(false)}
            onSuccess={handleExtensionSuccess}
          />
        </>
      )}
    </div>
  );
}
