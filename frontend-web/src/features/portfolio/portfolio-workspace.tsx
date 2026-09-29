'use client';
import { useCallback, useEffect, useState } from 'react';
import { BookOpen, CalendarDays, ClipboardList, FileText, RefreshCw } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { portfolioApi, errorText } from './api';
import { FORM_NAMES, dateLabel, fieldClass } from './types';
import type { FormKind, Journal, Overview, PlacementMeta } from './types';
import JournalPanel, { StatePill } from './journal-panel';
import WeeksPanel from './weeks-panel';
import FormPanel from './form-panel';

type Tab = 'overview' | 'days' | 'weeks' | 'forms';
export default function PortfolioWorkspace({ initialTab = 'overview', initialKind = 'M01' }: { initialTab?: Tab; initialKind?: FormKind }) {
  const { user } = useAuth(); const [placements, setPlacements] = useState<PlacementMeta[]>([]);
  const [placementId, setPlacementId] = useState(''); const [overview, setOverview] = useState<Overview | null>(null);
  const [days, setDays] = useState<Journal[]>([]); const [tab, setTab] = useState<Tab>(initialTab); const [kind, setKind] = useState<FormKind>(initialKind);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    let active = true;
    portfolioApi.placements().then(result => { if (active) { setPlacements(result.data || []); setPlacementId(result.data?.find(p => p.status === 'ACTIVE')?.id || result.data?.[0]?.id || ''); setLoading(false); } }).catch(e => { if (active) { setError(errorText(e)); setLoading(false); } });
    return () => { active = false; };
  }, [user?.id]);
  useEffect(() => {
    if (!placementId) return; let active = true; setLoading(true); setError(''); setOverview(null); setDays([]);
    Promise.all([portfolioApi.overview(placementId), portfolioApi.days(placementId)]).then(([o, d]) => { if (active) { setOverview(o.data!); setDays(d.data || []); } }).catch(e => { if (active) setError(errorText(e)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [placementId, refreshKey]);
  const refresh = useCallback(async () => {
    const [o, d] = await Promise.all([portfolioApi.overview(placementId), portfolioApi.days(placementId)]);
    setOverview(o.data!); setDays(d.data || []);
  }, [placementId]);
  const form = overview?.forms.find(f => f.kind === kind);
  const tabs = [{ key: 'overview', name: 'Tổng quan', icon: BookOpen }, { key: 'days', name: 'Nhật ký ngày', icon: CalendarDays }, { key: 'weeks', name: 'Tổng hợp tuần', icon: ClipboardList }, { key: 'forms', name: 'Biểu mẫu & báo cáo', icon: FileText }] as const;
  return <div className="mx-auto max-w-screen-2xl space-y-5 pb-10">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Hồ sơ thực tập</h1><p className="mt-1 text-sm text-slate-500">Giao việc, ghi nhật ký mỗi ngày, theo dõi tiến độ và hoàn thiện báo cáo.</p></div><Button variant="outline" size="sm" onClick={() => setRefreshKey(key => key + 1)} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />Tải lại</Button></div>
    {placements.length > 0 && <label className="block max-w-xl text-sm font-medium">Hồ sơ đang xem<select aria-label="Chọn hồ sơ thực tập" className={`${fieldClass} mt-2`} value={placementId} onChange={e => setPlacementId(e.target.value)}>{placements.map(p => <option key={p.id} value={p.id}>{p.studentName} {p.studentCode ? `· ${p.studentCode}` : ''} · {p.termName} · {p.companyName}</option>)}</select></label>}
    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
    {loading && <div role="status" className="rounded-xl border bg-white p-10 text-center text-slate-500">Đang tải hồ sơ thực tập…</div>}
    {!loading && placements.length === 0 && !error && <div className="rounded-xl border bg-white p-10 text-center"><BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" /><p className="font-semibold">Chưa có hồ sơ thực tập được phân công</p><p className="mt-2 text-sm text-slate-500">Hồ sơ sẽ xuất hiện khi lần thực tập được khởi tạo và phân công người hướng dẫn.</p></div>}
    {overview && !loading && <>
      <div className="grid gap-3 rounded-xl border bg-white p-5 text-sm sm:grid-cols-2 xl:grid-cols-4"><div><p className="text-xs text-slate-500">Sinh viên</p><p className="mt-1 font-semibold">{overview.placement.studentName}</p><p>{overview.placement.studentCode}</p></div><div><p className="text-xs text-slate-500">Đơn vị thực tập</p><p className="mt-1 font-semibold">{overview.placement.companyName}</p><p className="text-xs text-slate-500">CBHD: {overview.placement.mentorName}</p></div><div><p className="text-xs text-slate-500">Thời gian · {overview.placement.weekCount} tuần</p><p className="mt-1">{dateLabel(overview.placement.startDate)} – {dateLabel(overview.placement.endDate)}</p><p className="text-xs text-slate-500">GVHD: {overview.placement.lecturerName}</p></div><div><StatePill status={overview.placement.status} />{overview.placement.reportDueAt && <p className="mt-2 text-xs text-slate-500">Hạn báo cáo: {new Date(overview.placement.reportDueAt).toLocaleString('vi-VN')}</p>}</div></div>
      <div role="tablist" aria-label="Các phần hồ sơ" className="flex flex-wrap gap-1 rounded-xl border bg-white p-1">{tabs.map(({ key, name, icon: Icon }) => <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${tab === key ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Icon className="h-4 w-4" />{name}</button>)}</div>
      {tab === 'overview' && <OverviewPanel overview={overview} days={days} onNavigate={(next, formKind) => { setTab(next); if (formKind) setKind(formKind); }} />}
      {tab === 'days' && <JournalPanel key={placementId} overview={overview} days={days} userId={user?.id || ''} onRefresh={refresh} />}
      {tab === 'weeks' && <WeeksPanel overview={overview} onRefresh={refresh} />}
      {tab === 'forms' && <div className="space-y-4"><div className="flex flex-wrap gap-2">{overview.forms.map(f => <button key={f.kind} aria-pressed={kind === f.kind} onClick={() => setKind(f.kind)} className={`rounded-lg border px-3 py-2 text-sm ${kind === f.kind ? 'border-sky-400 bg-sky-50 font-semibold text-sky-900' : 'bg-white text-slate-600'}`}>{FORM_NAMES[f.kind]}</button>)}</div>{form && <FormPanel key={`${placementId}:${kind}:${form.status}:${form.published}`} form={form} overview={overview} userId={user?.id || ''} onRefresh={refresh} />}</div>}
    </>}
  </div>;
}

function OverviewPanel({ overview, days, onNavigate }: { overview: Overview; days: Journal[]; onNavigate: (tab: Tab, kind?: FormKind) => void }) {
  const confirmed = days.filter(d => d.status === 'CONFIRMED');
  return <div className="space-y-5"><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[
    ['Ngày đã ghi', days.length], ['Ngày chờ xác nhận', days.filter(d => d.status === 'SUBMITTED').length],
    ['Buổi đã xác nhận', confirmed.reduce((sum, d) => sum + d.sessions, 0)], ['Giờ đã xác nhận', confirmed.reduce((sum, d) => sum + Number(d.hours), 0).toFixed(2)],
  ].map(([label, value]) => <div key={label} className="rounded-xl border bg-white p-5"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-sky-900">{value}</p></div>)}</div>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 p-5"><div><h2 className="font-semibold text-sky-950">{overview.canWriteJournal ? 'Ghi lại ngày thực tập của bạn' : 'Theo dõi nhật ký và sự tham gia'}</h2><p className="mt-1 text-sm text-sky-800">Công việc, kết quả và thời gian thực tập được tổng hợp từ nhật ký ngày đã xác nhận.</p></div><Button onClick={() => onNavigate('days')}>{overview.canWriteJournal ? 'Viết nhật ký ngày' : 'Mở nhật ký ngày'}</Button></div>
    <div className="grid gap-3 md:grid-cols-2">{overview.forms.map(f => <button key={f.kind} className="rounded-xl border bg-white p-5 text-left hover:border-sky-300" onClick={() => onNavigate('forms', f.kind)}><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{FORM_NAMES[f.kind]}</h3><StatePill status={f.status} /></div><p className="mt-2 text-sm text-slate-500">{f.canEdit ? 'Bạn phụ trách hoàn thiện biểu mẫu này.' : !f.canRead ? 'Chỉ hiển thị nội dung sau khi được phép công bố.' : 'Xem nội dung và tải biểu mẫu theo quyền.'}</p></button>)}</div>
  </div>;
}
