'use client';
import { useCallback, useRef, useState } from 'react';
import { LockKeyhole, Download, Eye, X, FileCheck2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RichEditor, { SafeRichText } from './rich-editor';
import { useDraft } from './use-draft';
import { portfolioApi, downloadFile, errorText } from './api';
import { StatePill } from './journal-panel';
import { CRITERIA, FORM_NAMES, SECTION_TITLES, TRAINING, fieldClass } from './types';
import type { FormContent, FormView, Overview, WeekRow } from './types';

const plain = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default function FormPanel({ form, overview, userId, onRefresh }: { form: FormView; overview: Overview; userId: string; onRefresh: () => Promise<void> }) {
  const p = overview.placement; const [current, setCurrent] = useState(form); const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(''); const [note, setNote] = useState(''); const [preview, setPreview] = useState(false);
  const previewNode = useRef<HTMLDivElement>(null); const signedInput = useRef<HTMLInputElement>(null);
  const editable = current.canEdit && ['DRAFT', 'REVISION_REQUIRED'].includes(current.status) && !current.published && p.status === 'ACTIVE';
  const save = useCallback(async (content: FormContent, version: number | null) => {
    const result = (await portfolioApi.saveForm(p.id, form.kind, content, version)).data!; setCurrent(result);
    await onRefresh().catch(() => undefined); return result;
  }, [p.id, form.kind, onRefresh]);
  const draft = useDraft(`internlink:form:${userId}:${p.id}:${form.kind}`, form.content || {}, form.version, editable && !busy, save);
  const content = draft.value;
  const patch = (change: Partial<FormContent>) => draft.change({ ...content, ...change });
  async function action(name: string) {
    setBusy(true); setNotice('');
    try {
      const version = editable ? (await draft.flush()).version : current.version;
      if (version === null) throw new Error('Hãy lưu biểu mẫu trước.');
      const result = (await portfolioApi.action(p.id, form.kind, name, version, note)).data!;
      setCurrent(result); setNote(''); await onRefresh();
    } catch (error) { setNotice(errorText(error)); } finally { setBusy(false); }
  }
  async function exportDocx(revisionId?: string, showPreview = false) {
    setBusy(true); setNotice('');
    try {
      if (editable) await draft.flush();
      const url = portfolioApi.exportUrl(p.id, form.kind, revisionId);
      if (!showPreview) await downloadFile(url, `M-TT-${form.kind.slice(1)}_${p.studentCode || 'SinhVien'}.docx`);
      else {
        setPreview(true);
        const response = await fetch(url, { credentials: 'include', cache: 'no-store' });
        if (!response.ok) { const body = await response.json(); throw new Error(body.message || 'Không tạo được bản xem trước.'); }
        const data = await response.blob(); const { renderAsync } = await import('docx-preview');
        if (previewNode.current) await renderAsync(data, previewNode.current, undefined, { inWrapper: true, ignoreLastRenderedPageBreak: false, renderHeaders: true, renderFooters: true });
      }
    } catch (error) { setNotice(errorText(error)); setPreview(false); } finally { setBusy(false); }
  }
  async function upload(file?: File) {
    if (!file) return; setBusy(true); setNotice('');
    try { await portfolioApi.uploadSigned(p.id, form.kind, file, current.revisions.find(r => r.downloadable)?.id); await onRefresh(); setNotice('Đã lưu bản có chữ ký.'); }
    catch (error) { setNotice(errorText(error)); } finally { setBusy(false); }
  }
  const offlineOriginal = !p.hasMentor && overview.canConfirmJournal && ['M01', 'M02', 'M03'].includes(form.kind);
  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-5">
      <div><h2 className="font-bold text-slate-900">{FORM_NAMES[form.kind]}</h2><div className="mt-2 flex flex-wrap items-center gap-2"><StatePill status={current.status} /><span className="text-xs text-slate-500">{['M02', 'M03', 'M04'].includes(form.kind) ? current.published ? 'Đã được phép công bố' : 'Chưa công bố' : 'Hồ sơ thực tập'}</span></div></div>
      {current.canRead && <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={busy || draft.saving} onClick={() => void exportDocx(undefined, true)}><Eye className="mr-2 h-4 w-4" />Xem trước DOCX</Button><Button size="sm" disabled={busy || draft.saving} onClick={() => void exportDocx()}><Download className="mr-2 h-4 w-4" />Tải DOCX</Button></div>}
    </div>
    {notice && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{notice}</p>}
    {!current.canRead ? <div className="rounded-xl border bg-white p-10 text-center"><LockKeyhole className="mx-auto mb-3 h-9 w-9 text-slate-400" /><p className="font-semibold">Phiếu chưa được công bố</p><p className="mt-2 text-sm text-slate-500">Bạn có thể theo dõi trạng thái hoàn thành. Nội dung, nhận xét và điểm sẽ hiển thị sau khi được phép công bố.</p></div> : <>
      {draft.recovery && editable && <div className="flex flex-wrap items-center gap-3 rounded-lg bg-amber-50 p-3 text-sm"><span>Có bản nháp trên thiết bị chưa đồng bộ.</span><Button size="sm" onClick={draft.recovery}>Khôi phục</Button><Button variant="ghost" size="sm" onClick={draft.discardRecovery}>Bỏ bản dự phòng</Button></div>}
      {current.feedback && <div className="rounded-xl bg-sky-50 p-4 text-sm"><strong>Góp ý của giảng viên</strong><p className="mt-1 whitespace-pre-wrap">{current.feedback}</p></div>}
      {['M01', 'M02'].includes(form.kind) && <WeeklyForm content={content} editable={editable && !busy} following={form.kind === 'M02'} patch={patch} />}
      {form.kind === 'M03' && <><CompanyAssessment content={content} editable={editable && !busy} patch={patch} /><AcademicScores content={content} editable={editable && !busy} patch={patch} overview={overview} role="COMPANY_MENTOR" /></>}
      {form.kind === 'M04' && <LecturerAssessment content={content} editable={editable && !busy} patch={patch} overview={overview} />}
      {form.kind === 'M05' && <ReportEditor content={content} editable={editable && !busy} patch={patch} overview={overview} />}
      {editable && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4"><span role="status" className="text-xs text-slate-500">{draft.message || 'Nội dung tự lưu khi bạn nhập'}</span><div className="flex gap-2"><Button variant="outline" disabled={busy || draft.saving} onClick={() => void draft.flush().catch(error => setNotice(errorText(error)))}>Lưu nháp</Button><Button isLoading={busy} disabled={draft.saving} onClick={() => void action(form.kind === 'M05' ? 'SUBMIT' : 'COMPLETE')}>{form.kind === 'M05' ? 'Gửi báo cáo cho giảng viên' : 'Hoàn thành phiếu'}</Button></div></div>}
      {current.canReview && current.status === 'SUBMITTED' && <div className="space-y-3 rounded-xl border bg-white p-5"><label className="block text-sm font-semibold">Nhận xét báo cáo<textarea className={`${fieldClass} mt-2`} rows={3} value={note} onChange={e => setNote(e.target.value)} /></label><div className="flex gap-2"><Button isLoading={busy} onClick={() => void action('APPROVE')}>Duyệt báo cáo</Button><Button variant="outline" disabled={busy || !note.trim()} onClick={() => void action('REVISION_REQUIRED')}>Yêu cầu chỉnh sửa</Button></div></div>}
      {current.canEdit && current.status === 'COMPLETED' && !current.published && p.status === 'ACTIVE' && <details className="rounded-xl border bg-white p-4"><summary className="cursor-pointer text-sm font-medium">Mở lại phiếu để chỉnh sửa</summary><label className="mt-3 block text-sm">Lý do mở lại<textarea value={note} onChange={e => setNote(e.target.value)} className={fieldClass} /></label><Button className="mt-2" variant="outline" disabled={busy || !note.trim()} onClick={() => void action('REOPEN')}>Mở lại bản nháp</Button></details>}
      {current.canPublish && ['M02', 'M03', 'M04'].includes(form.kind) && ['COMPLETED', 'APPROVED'].includes(current.status) && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4"><p className="text-sm">Quyền công bố cho sinh viên do Ban quản lý thực tập quyết định.</p><Button disabled={busy} onClick={() => void action(current.published ? 'UNPUBLISH' : 'PUBLISH')}>{current.published ? 'Thu hồi công bố' : 'Cho phép sinh viên xem'}</Button></div>}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-3 rounded-xl border bg-white p-5"><h3 className="flex items-center gap-2 font-semibold"><FileCheck2 className="h-4 w-4" />Bản đã ký</h3><p className="text-xs text-slate-500">Lưu bản scan PDF/PNG/JPEG, tối đa 10 MB. Mỗi bản ký gắn với phiên bản nội dung tương ứng.</p>
          {(!current.published && (offlineOriginal || (current.canEdit && ['COMPLETED', 'SUBMITTED', 'APPROVED'].includes(current.status)))) && <><Button size="sm" variant="outline" disabled={busy} onClick={() => signedInput.current?.click()}>{offlineOriginal ? 'Tiếp nhận phiếu gốc của cơ quan' : 'Tải lên bản đã ký'}</Button><input ref={signedInput} type="file" className="hidden" accept="application/pdf,image/png,image/jpeg" aria-label="Tải bản đã ký" onChange={e => { void upload(e.target.files?.[0]); e.target.value = ''; }} /></>}
          {form.signedFiles.length === 0 && <p className="text-sm text-slate-400">Chưa lưu bản ký.</p>}{form.signedFiles.map(file => <button key={file.id} className="block break-all text-left text-sm text-sky-800 underline" onClick={() => void downloadFile(portfolioApi.signedUrl(p.id, form.kind, file.id), file.name).catch(error => setNotice(errorText(error)))}>{file.name}</button>)}
        </div>
        <details className="rounded-xl border bg-white p-5"><summary className="cursor-pointer font-semibold">Lịch sử gửi, duyệt và xuất bản</summary><div className="mt-3 space-y-3">{form.revisions.length === 0 && <p className="text-sm text-slate-400">Chưa có phiên bản đã gửi.</p>}{form.revisions.map(r => <div key={r.id} className="border-b pb-3 text-xs"><p className="font-semibold">{({ SUBMIT: 'Gửi báo cáo', COMPLETE: 'Hoàn thành', APPROVE: 'Duyệt', REVISION_REQUIRED: 'Yêu cầu chỉnh sửa', PUBLISH: 'Công bố', UNPUBLISH: 'Thu hồi công bố', REOPEN: 'Mở lại', SIGNED_FILE: 'Lưu bản ký', OFFLINE_ORIGINAL: 'Tiếp nhận phiếu gốc' } as Record<string, string>)[r.action] || r.action} · {r.actor}</p><p className="text-slate-500">{new Date(r.createdAt).toLocaleString('vi-VN')}</p>{r.note && <p>{r.note}</p>}{r.downloadable && <button className="mt-1 text-sky-800 underline" disabled={busy} onClick={() => void exportDocx(r.id)}>Tải đúng phiên bản này</button>}</div>)}</div></details>
      </div>
    </>}
    {preview && <dialog ref={node => { if (node && !node.open) node.showModal(); }} onCancel={() => setPreview(false)} className="fixed inset-0 z-50 m-0 flex h-screen max-h-none w-screen max-w-none flex-col bg-slate-100 p-0" aria-label="Xem trước tài liệu Word"><div className="flex items-center justify-between gap-4 border-b bg-white px-5 py-3"><div><h3 className="font-semibold">{FORM_NAMES[form.kind]}</h3><p className="text-xs text-slate-500">Bản xem trước trên web. Word cập nhật mục lục và số trang khi mở tài liệu.</p></div><Button variant="outline" onClick={() => setPreview(false)}><X className="mr-1 h-4 w-4" />Đóng</Button></div><div className="overflow-auto flex-1">{busy && <p role="status" className="p-5 text-center">Đang tạo bản xem trước…</p>}<div ref={previewNode} /></div></dialog>}
  </section>;
}

function WeeklyForm({ content, editable, following, patch }: { content: FormContent; editable: boolean; following: boolean; patch: (v: Partial<FormContent>) => void }) {
  const [selected, setSelected] = useState(1); const row = content.weeks?.find(r => r.week === selected);
  function update(change: Partial<WeekRow>) { patch({ weeks: content.weeks?.map(r => r.week === selected ? { ...r, ...change } : r) }); }
  return <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]"><div className="flex flex-wrap gap-2 self-start rounded-xl border bg-white p-3 lg:flex-col">{content.weeks?.map(r => <button key={r.week} onClick={() => setSelected(r.week)} aria-pressed={selected === r.week} className={`rounded-lg px-3 py-2 text-left text-sm ${selected === r.week ? 'bg-sky-100 font-semibold text-sky-900' : 'hover:bg-slate-50'}`}>Tuần {r.week} {plain(following ? r.comment : r.tasks) ? '✓' : ''}</button>)}</div><div className="space-y-4 rounded-xl border bg-white p-5">{row ? <><h3 className="font-semibold">Tuần {selected}</h3>{following && <p className="text-sm text-slate-500">Công việc lấy từ M-TT-01; số buổi và giờ lấy từ nhật ký ngày đã xác nhận khi lưu phiếu.</p>}
    {editable && !following ? <RichEditor label="Nội dung công việc được giao" value={row.tasks} onChange={tasks => update({ tasks })} compact /> : <div><h4 className="text-sm font-semibold">Công việc được giao</h4><SafeRichText html={row.tasks || '<p>Chưa lập kế hoạch giao việc.</p>'} /></div>}
    {following && (editable ? <RichEditor label="Nhận xét chính thức của cán bộ hướng dẫn" value={row.comment} onChange={comment => update({ comment })} compact /> : <div><h4 className="text-sm font-semibold">Nhận xét cán bộ hướng dẫn</h4><SafeRichText html={row.comment} /></div>)}
    <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Số buổi {following ? 'đã xác nhận' : 'dự kiến'}<input type="number" min="0" max="14" className={`${fieldClass} mt-1`} value={row.sessions} disabled={!editable || following} onChange={e => update({ sessions: Number(e.target.value) })} /></label><label className="text-sm">Số giờ {following ? 'đã xác nhận' : 'dự kiến'}<input type="number" min="0" max="168" step="0.25" className={`${fieldClass} mt-1`} value={row.hours} disabled={!editable || following} onChange={e => update({ hours: Number(e.target.value) })} /></label></div></> : <p>Chưa có dữ liệu tuần.</p>}</div></div>;
}

function CompanyAssessment({ content, editable, patch }: { content: FormContent; editable: boolean; patch: (v: Partial<FormContent>) => void }) {
  const scores = content.scores || {}; const applicable = CRITERIA.map((_, i) => i).filter(i => !content.remote || i >= 3);
  const total = applicable.reduce((sum, i) => sum + Number(scores[String(i)] || 0), 0);
  return <div className="space-y-5 rounded-xl border bg-white p-5"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!content.remote} disabled={!editable} onChange={e => patch({ remote: e.target.checked })} />Thực tập online: không chấm ba tiêu chí I.1–I.3 theo mẫu</label><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-slate-50"><th className="p-3 text-left">Nội dung đánh giá</th><th className="w-32 p-3">Điểm 1–10</th></tr></thead><tbody>{CRITERIA.map((label, i) => <tr key={label} className="border-t"><td className="p-3">{label}</td><td className="p-2">{content.remote && i < 3 ? <span className="text-xs text-slate-500">Không áp dụng</span> : <input type="number" aria-label={label} min="1" max="10" step="0.5" value={scores[String(i)] ?? ''} disabled={!editable} onChange={e => patch({ scores: { ...scores, [String(i)]: e.target.value } })} className={fieldClass} />}</td></tr>)}</tbody><tfoot><tr className="border-t bg-sky-50 font-semibold"><td className="p-3">Tổng các tiêu chí áp dụng</td><td className="p-3">{total} / {applicable.length * 10}</td></tr></tfoot></table></div><p className="text-xs text-slate-500">Điểm học phần được tổng hợp theo phương án khoa phê duyệt. Tổng trên phiếu là điểm các tiêu chí áp dụng.</p>
    <RichEditor label="Nhận xét khác về sinh viên" value={content.comment || ''} onChange={comment => patch({ comment })} compact disabled={!editable} />
    <fieldset className="space-y-2"><legend className="mb-2 text-sm font-semibold">Đánh giá về chương trình đào tạo</legend>{TRAINING.map(label => <label key={label} className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={!editable} checked={content.trainingFeedback?.includes(label) || false} onChange={e => patch({ trainingFeedback: e.target.checked ? [...(content.trainingFeedback || []), label] : content.trainingFeedback?.filter(item => item !== label) })} />{label}</label>)}</fieldset>
    <RichEditor label="Đề xuất góp ý về chương trình đào tạo" value={content.suggestions || ''} onChange={suggestions => patch({ suggestions })} compact disabled={!editable} />
  </div>;
}

function LecturerAssessment({ content, editable, patch, overview }: { content: FormContent; editable: boolean; patch: (v: Partial<FormContent>) => void; overview: Overview }) {
  return <div className="space-y-4"><AcademicScores content={content} editable={editable} patch={patch} overview={overview} role="LECTURER" /><div className="rounded-xl border bg-white p-5"><RichEditor label="Nhận xét báo cáo của giảng viên" value={content.comment || ''} onChange={comment => patch({ comment })} disabled={!editable} compact /></div></div>;
}

function AcademicScores({ content, editable, patch, overview, role }: { content: FormContent; editable: boolean; patch: (v: Partial<FormContent>) => void; overview: Overview; role: string }) {
  const components = overview.placement.components.filter(c => c.assessorRole === role);
  function update(code: string, criterion: string | null, value: string) {
    const previous = content.academicScores?.[code] || {};
    patch({ academicScores: { ...content.academicScores, [code]: criterion ? { ...previous, criteriaScores: { ...previous.criteriaScores, [criterion]: value } } : { ...previous, score: value } } });
  }
  return <section className="space-y-4 rounded-xl border bg-white p-5"><h3 className="font-semibold">Điểm học phần theo phương án được duyệt</h3><p className="text-sm text-slate-500">{overview.placement.schemeReference || 'Chưa được gán phương án đánh giá.'} Điểm được ghi nhận khi hoàn thành phiếu và khóa theo quy trình chấm điểm.</p>
    {components.length === 0 && <p className="text-sm text-slate-500">Chưa có thành phần điểm được giao.</p>}
    {components.map(c => <fieldset key={c.code} className="space-y-3 rounded-lg border p-4"><legend className="px-1 text-sm font-semibold">{c.name} · {Math.round(c.weight * 100)}%</legend>
      {c.criteria?.length ? c.criteria.map(criterion => <label key={criterion.code} className="flex items-center justify-between gap-3 text-sm"><span>{criterion.name} · {Math.round(criterion.weight * 100)}%</span><input type="number" min="0" max="10" step="0.1" className={`${fieldClass} max-w-28`} value={content.academicScores?.[c.code]?.criteriaScores?.[criterion.code] ?? ''} disabled={!editable} onChange={e => update(c.code, criterion.code, e.target.value)} /></label>) : <label className="flex items-center justify-between gap-3 text-sm"><span>Điểm thành phần (0–10)</span><input type="number" min="0" max="10" step="0.1" className={`${fieldClass} max-w-28`} value={content.academicScores?.[c.code]?.score ?? content.academicTotals?.[c.code] ?? ''} disabled={!editable} onChange={e => update(c.code, null, e.target.value)} /></label>}
      {content.academicTotals?.[c.code] !== undefined && <p className="text-sm font-semibold text-emerald-800">Điểm đã ghi nhận: {content.academicTotals[c.code]}/10</p>}
    </fieldset>)}
  </section>;
}

function ReportEditor({ content, editable, patch, overview }: { content: FormContent; editable: boolean; patch: (v: Partial<FormContent>) => void; overview: Overview }) {
  const [section, setSection] = useState('thanks'); const [week, setWeek] = useState(1); const sections = content.sections || {};
  const source = overview.weeks.find(w => w.number === week); const p = overview.placement;
  function insertWeek() { if (!source) return; const text = section === 'outcomes' ? source.results : section === 'method' ? source.reflection : source.tasks; patch({ sections: { ...sections, [section]: (sections[section] || '') + `<p><strong>Tuần ${week}</strong></p>` + text.split('\n').map(line => `<p>${escape(line)}</p>`).join('') } }); }
  return <div className="grid gap-4 xl:grid-cols-[230px_minmax(0,1fr)]"><aside className="space-y-3 rounded-xl border bg-white p-4 self-start"><h3 className="text-sm font-semibold">Mục lục báo cáo</h3><p className="text-xs text-slate-500">Bìa và thông tin sinh viên được điền tự động. Phiếu chấm M-TT-04 được chèn với ô điểm trống.</p><div className="space-y-1">{Object.entries(SECTION_TITLES).map(([key, label]) => <button key={key} aria-pressed={section === key} onClick={() => setSection(key)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${section === key ? 'bg-sky-100 font-semibold text-sky-900' : 'hover:bg-slate-50'}`}>{label} {plain(sections[key] || '') ? '✓' : ''}</button>)}</div><p className="border-t pt-3 text-xs text-slate-500">Đã viết {Object.keys(SECTION_TITLES).filter(key => plain(sections[key] || '')).length}/5 mục</p><label className="block text-xs">Khổ giấy<select className={`${fieldClass} mt-1`} disabled={!editable} value={content.paperSize || 'LETTER'} onChange={e => patch({ paperSize: e.target.value as 'A4' | 'LETTER' })}><option value="LETTER">Letter (file tham khảo)</option><option value="A4">A4</option></select></label></aside>
    <div className="space-y-4 rounded-xl border bg-white p-4 sm:p-6"><details><summary className="cursor-pointer text-sm font-semibold">Thông tin trang bìa</summary><div className="mt-3 space-y-2 text-sm"><p>{p.studentName} · {p.studentCode}</p><p>{p.companyName}</p><p>CBHD: {p.mentorName} · GVHD: {p.lecturerName}</p><label className="block">Tên học phần<input className={`${fieldClass} mt-1`} value={content.courseName || ''} disabled={!editable} onChange={e => patch({ courseName: e.target.value })} placeholder="Thực tập doanh nghiệp" /></label></div></details>
      {editable && <details className="rounded-lg bg-slate-50 p-3"><summary className="cursor-pointer text-sm font-medium">Đưa nội dung từ nhật ký vào mục đang viết</summary><div className="mt-3 flex flex-wrap gap-2"><select aria-label="Tuần cần đưa vào báo cáo" className={`${fieldClass} max-w-44`} value={week} onChange={e => setWeek(Number(e.target.value))}>{overview.weeks.map(w => <option key={w.number} value={w.number}>Tuần {w.number}</option>)}</select><Button size="sm" variant="outline" disabled={!source?.confirmedDays} onClick={insertWeek}>Chèn nội dung đã xác nhận</Button></div><p className="mt-2 text-xs text-slate-500">Bạn có thể biên tập lại nội dung sau khi chèn.</p></details>}
      <RichEditor key={section} label={SECTION_TITLES[section]} value={sections[section] || ''} onChange={html => patch({ sections: { ...sections, [section]: html } })} disabled={!editable} />
    </div></div>;
}
