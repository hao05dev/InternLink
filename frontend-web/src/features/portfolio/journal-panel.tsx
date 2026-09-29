'use client';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import RichEditor, { SafeRichText } from './rich-editor';
import { errorText, portfolioApi } from './api';
import { useDraft } from './use-draft';
import { ATTENDANCE_NAMES, STATUS_NAMES, dateLabel, fieldClass, todayVN } from './types';
import type { Attendance, Journal, JournalInput, Overview } from './types';

export function StatePill({ status }: { status: string }) {
  const color = ['CONFIRMED', 'COMPLETED', 'APPROVED', 'APPROVED_BY_MENTOR', 'APPROVED_BY_LECTURER'].includes(status) ? 'bg-emerald-50 text-emerald-800' : ['SUBMITTED', 'REVISION_REQUIRED', 'REVISION_REQUESTED'].includes(status) ? 'bg-amber-50 text-amber-900' : 'bg-slate-100 text-slate-600';
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${color}`}>{STATUS_NAMES[status] || status}</span>;
}

export default function JournalPanel({ overview, days, userId, onRefresh }: {
  overview: Overview; days: Journal[]; userId: string; onRefresh: () => Promise<void>;
}) {
  const p = overview.placement;
  const initialDate = todayVN() < p.startDate ? p.startDate : todayVN() > p.endDate ? p.endDate : todayVN();
  const [date, setDate] = useState(initialDate);
  const week = overview.weeks.find(w => date >= w.start && date <= w.end) || overview.weeks[0];
  const selected = days.find(day => day.workDate === date);
  const dates: string[] = [];
  if (week) for (let cursor = new Date(`${week.start}T12:00:00`); cursor <= new Date(`${week.end}T12:00:00`); cursor.setDate(cursor.getDate() + 1)) dates.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`);
  const plan = overview.forms.find(f => f.kind === 'M01')?.content?.weeks?.find(row => row.week === week?.number);
  return <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
    <aside className="space-y-3 rounded-xl border bg-white p-4 self-start">
      <label className="block text-sm font-semibold">Tuần thực tập<select className={`${fieldClass} mt-2`} value={week?.number || 1} onChange={e => { const selectedWeek = overview.weeks.find(w => w.number === Number(e.target.value)); if (selectedWeek) setDate(selectedWeek.start); }}>{overview.weeks.map(w => <option key={w.number} value={w.number}>Tuần {w.number} · {dateLabel(w.start)}</option>)}</select></label>
      <label className="block text-sm font-semibold">Chọn ngày<input className={`${fieldClass} mt-2`} type="date" min={p.startDate} max={p.endDate} value={date} onChange={e => { if (e.target.value >= p.startDate && e.target.value <= p.endDate) setDate(e.target.value); }} /></label>
      <div className="space-y-2">{dates.map(day => { const entry = days.find(j => j.workDate === day); return <button key={day} type="button" onClick={() => setDate(day)} aria-pressed={day === date} className={`w-full rounded-lg border p-3 text-left ${day === date ? 'border-sky-400 bg-sky-50' : 'border-slate-100 hover:bg-slate-50'}`}><span className="mb-1 block text-sm font-semibold">{new Date(`${day}T12:00:00`).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}</span>{entry ? <StatePill status={entry.status} /> : <span className="text-xs text-slate-500">{day > todayVN() ? 'Chưa đến ngày' : 'Chưa ghi nhận'}</span>}</button>; })}</div>
      <p className="text-xs leading-relaxed text-slate-500">Ngày chưa có nhật ký chưa được xác định là vắng. Số buổi và giờ chỉ được tổng hợp sau khi người hướng dẫn xác nhận.</p>
    </aside>
    <div className="space-y-4">
      {plan?.tasks && <details className="rounded-xl border border-sky-100 bg-sky-50 p-4"><summary className="cursor-pointer text-sm font-semibold text-sky-900">Công việc được giao trong tuần {week?.number}</summary><SafeRichText html={plan.tasks} className="mt-3" /></details>}
      <JournalEditor key={`${p.id}:${date}:${selected?.status || 'DRAFT'}`} date={date} entry={selected} overview={overview} userId={userId} onRefresh={onRefresh} />
    </div>
  </div>;
}

function JournalEditor({ date, entry, overview, userId, onRefresh }: { date: string; entry?: Journal; overview: Overview; userId: string; onRefresh: () => Promise<void> }) {
  const p = overview.placement; const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [reviewNote, setReviewNote] = useState('');
  const editable = overview.canWriteJournal && p.status === 'ACTIVE' && date <= todayVN() && (!entry || ['DRAFT', 'REVISION_REQUIRED'].includes(entry.status));
  const initial: JournalInput = entry ? { attendance: entry.attendance, startTime: entry.startTime, endTime: entry.endTime, breakMinutes: entry.breakMinutes, sessions: entry.sessions, tasks: entry.tasks, results: entry.results, reflection: entry.reflection, evidence: entry.evidence } : { attendance: 'PRESENT', startTime: '08:00', endTime: '17:00', breakMinutes: 60, sessions: 2, tasks: '', results: '', reflection: '', evidence: '' };
  const save = useCallback(async (value: JournalInput, version: number | null) => {
    const result = (await portfolioApi.saveDay(p.id, date, value, version)).data!;
    await onRefresh().catch(() => undefined); return result;
  }, [p.id, date, onRefresh]);
  const draft = useDraft(`internlink:journal:${userId}:${p.id}:${date}`, initial, entry?.version ?? null, editable && !busy, save);
  const value = draft.value; const working = ['PRESENT', 'REMOTE'].includes(value.attendance);
  const update = (patch: Partial<JournalInput>) => draft.change({ ...value, ...patch });
  async function submit() {
    setBusy(true); setError('');
    try { const saved = await draft.flush(); await portfolioApi.saveDay(p.id, date, draft.value, saved.version, true); await onRefresh(); }
    catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  }
  async function review(decision: string) {
    if (!entry) return; setBusy(true); setError('');
    try { await portfolioApi.reviewDay(p.id, date, decision, reviewNote, entry.version); await onRefresh(); }
    catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  }
  return <section className="space-y-5 rounded-xl border bg-white p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-bold text-slate-900">Nhật ký ngày {dateLabel(date)}</h2><p className="text-sm text-slate-500">Ghi lại công việc, kết quả và tình trạng tham gia trong ngày.</p></div><StatePill status={entry?.status || 'DRAFT'} /></div>
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    {draft.recovery && editable && <div className="flex flex-wrap items-center gap-3 rounded-lg bg-amber-50 p-3 text-sm"><span>Có bản nháp chưa đồng bộ trên thiết bị.</span><Button size="sm" onClick={draft.recovery}>Khôi phục</Button><Button size="sm" variant="ghost" onClick={draft.discardRecovery}>Bỏ bản dự phòng</Button></div>}
    {!entry && !overview.canWriteJournal ? <p className="py-8 text-center text-slate-500">Sinh viên chưa ghi nhật ký cho ngày này.</p> : <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm font-medium">Tình trạng tham gia<select className={`${fieldClass} mt-1`} value={value.attendance} disabled={!editable || busy} onChange={e => update({ attendance: e.target.value as Attendance })}>{Object.entries(ATTENDANCE_NAMES).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>
        {working && <><label className="text-sm font-medium">Bắt đầu<input type="time" className={`${fieldClass} mt-1`} value={value.startTime || ''} disabled={!editable || busy} onChange={e => update({ startTime: e.target.value })} /></label><label className="text-sm font-medium">Kết thúc<input type="time" className={`${fieldClass} mt-1`} value={value.endTime || ''} disabled={!editable || busy} onChange={e => update({ endTime: e.target.value })} /></label><label className="text-sm font-medium">Thời gian nghỉ (phút)<input type="number" min="0" max="720" className={`${fieldClass} mt-1`} value={value.breakMinutes} disabled={!editable || busy} onChange={e => update({ breakMinutes: Number(e.target.value) })} /></label><label className="text-sm font-medium">Số buổi<select className={`${fieldClass} mt-1`} value={value.sessions} disabled={!editable || busy} onChange={e => update({ sessions: Number(e.target.value) })}><option value="1">1 buổi</option><option value="2">2 buổi</option></select></label></>}
      </div>
      {editable ? <><RichEditor label="Công việc đã làm trong ngày" value={value.tasks} onChange={tasks => update({ tasks })} compact disabled={busy} /><RichEditor label="Kết quả và tiến độ đạt được" value={value.results} onChange={results => update({ results })} compact disabled={busy} /><RichEditor label={working ? 'Khó khăn, bài học và nội dung cần hỗ trợ' : 'Lý do nghỉ/vắng và ghi chú'} value={value.reflection} onChange={reflection => update({ reflection })} compact disabled={busy} /><label className="block text-sm font-semibold">Liên kết minh chứng<textarea rows={2} className={`${fieldClass} mt-1`} value={value.evidence} onChange={e => update({ evidence: e.target.value })} disabled={busy} placeholder="Liên kết sản phẩm, nhiệm vụ hoặc tài liệu; có thể chèn ảnh trong nội dung trên." /></label></> : <div className="space-y-5">{[['Công việc đã làm', value.tasks], ['Kết quả đạt được', value.results], ['Bài học và ghi chú', value.reflection]].map(([label, html]) => <div key={label}><h3 className="mb-2 text-sm font-semibold">{label}</h3><SafeRichText html={html || '<p>Chưa có nội dung.</p>'} /></div>)}{value.evidence && <p className="whitespace-pre-wrap break-words text-sm">Minh chứng: {value.evidence}</p>}</div>}
      {entry?.reviewNote && <div className="rounded-lg bg-sky-50 p-3 text-sm"><strong>Phản hồi về nhật ký:</strong><p className="whitespace-pre-wrap">{entry.reviewNote}</p>{entry.reviewer && <p className="mt-1 text-xs text-slate-500">{entry.reviewer}</p>}</div>}
      {editable && <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"><span role="status" className="text-xs text-slate-500">{draft.message || 'Bản nháp tự lưu khi bạn nhập nội dung'}</span><div className="flex gap-2"><Button variant="outline" disabled={busy || draft.saving} onClick={() => void draft.flush().catch(e => setError(errorText(e)))}>Lưu nháp</Button><Button isLoading={busy} disabled={draft.saving} onClick={() => void submit()}>Gửi nhật ký ngày</Button></div></div>}
      {overview.canConfirmJournal && entry && ['SUBMITTED', 'CONFIRMED'].includes(entry.status) && p.status === 'ACTIVE' && <div className="space-y-3 border-t pt-4"><label className="block text-sm font-semibold">Phản hồi cho sinh viên<textarea rows={3} className={`${fieldClass} mt-1`} value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Nội dung cần bổ sung hoặc phản hồi về ngày thực tập." /></label><div className="flex flex-wrap gap-2">{entry.status === 'SUBMITTED' && <Button isLoading={busy} onClick={() => void review('CONFIRMED')}>Xác nhận nhật ký và tham gia</Button>}<Button variant="outline" disabled={busy || !reviewNote.trim()} onClick={() => void review('REVISION_REQUIRED')}>Yêu cầu bổ sung</Button></div></div>}
    </>}
  </section>;
}
