'use client';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { portfolioApi, errorText } from './api';
import { dateLabel, fieldClass } from './types';
import type { Overview, WeekSummary } from './types';
import { StatePill } from './journal-panel';

export default function WeeksPanel({ overview, onRefresh }: { overview: Overview; onRefresh: () => Promise<void> }) {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [note, setNote] = useState(''); const [selected, setSelected] = useState(1);
  const week = overview.weeks.find(w => w.number === selected); const p = overview.placement;
  async function act(w: WeekSummary, decision: string) {
    setBusy(true); setError('');
    try {
      if (decision === 'SUBMIT') await portfolioApi.submitWeek(p.id, w.number);
      else {
        const mentor = p.hasMentor; const status = decision === 'APPROVE' ? mentor ? 'APPROVED_BY_MENTOR' : 'APPROVED_BY_LECTURER' : 'REVISION_REQUESTED';
        const params = new URLSearchParams({ status, [mentor ? 'mentorFeedback' : 'feedback']: note });
        await apiClient.patch(`/api/v1/logbooks/${w.logbookId}/${mentor ? 'mentor-review' : 'lecturer-review'}?${params}`);
      }
      await onRefresh(); setNote('');
    } catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  }
  return <div className="space-y-4 rounded-xl border bg-white p-5">
    <div><h2 className="text-lg font-bold">Tổng hợp nhật ký tuần</h2><p className="text-sm text-slate-500">Số buổi/giờ và nội dung được lấy từ các nhật ký ngày đã xác nhận.</p></div>
    {error && <p role="alert" className="rounded bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{['Tuần', 'Thời gian', 'Ngày xác nhận', 'Buổi / giờ', 'Trạng thái'].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{overview.weeks.map(w => <tr key={w.number} className={`border-t ${selected === w.number ? 'bg-sky-50' : ''}`}><td className="p-3"><button className="font-semibold text-sky-800 underline" onClick={() => setSelected(w.number)}>Tuần {w.number}</button></td><td className="p-3 whitespace-nowrap">{dateLabel(w.start)} – {dateLabel(w.end)}</td><td className="p-3">{w.confirmedDays}</td><td className="p-3">{w.sessions} buổi / {w.hours} giờ</td><td className="p-3"><StatePill status={w.status} /></td></tr>)}</tbody></table></div>
    {week && <div className="space-y-3 rounded-xl border p-4"><h3 className="font-semibold">Nội dung tổng hợp tuần {week.number}</h3>{[['Công việc', week.tasks], ['Kết quả', week.results], ['Bài học', week.reflection]].map(([title, content]) => <div key={title}><h4 className="text-sm font-semibold text-slate-600">{title}</h4><p className="whitespace-pre-wrap text-sm leading-relaxed">{content || 'Chưa có nhật ký ngày được xác nhận.'}</p></div>)}
      {overview.canWriteJournal && ['NOT_SUBMITTED', 'REVISION_REQUESTED'].includes(week.status) && <Button isLoading={busy} onClick={() => void act(week, 'SUBMIT')}>Gửi tổng hợp tuần {week.number}</Button>}
      {overview.canConfirmJournal && week.status === 'SUBMITTED' && <div className="space-y-2"><label className="block text-sm">Phản hồi<textarea className={fieldClass} value={note} onChange={e => setNote(e.target.value)} /></label><div className="flex gap-2"><Button isLoading={busy} onClick={() => void act(week, 'APPROVE')}>Duyệt tuần</Button><Button disabled={busy || !note.trim()} variant="outline" onClick={() => void act(week, 'REVISION')}>Yêu cầu bổ sung</Button></div></div>}
    </div>}
  </div>;
}
