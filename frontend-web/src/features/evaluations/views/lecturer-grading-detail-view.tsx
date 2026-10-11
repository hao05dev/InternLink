'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Award, FileText, CheckCircle2, AlertTriangle, Send, FileCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { portfolioApi, errorText } from '@/features/portfolio/api';
import type { Overview } from '@/features/portfolio/types';
import TermClosedBanner from '@/features/portfolio/components/term-closed-banner';
import { PaperEvaluationOverrideModal } from '../components/modals/paper-evaluation-override-modal';
import type { RubricEvaluation } from '../types/evaluation.types';

interface RubricCriterion { id: string; title: string; weight: number; description: string; }
const CRITERIA: RubricCriterion[] = [
  { id: 'crit-1', title: '1. Nội dung báo cáo tổng kết thực tập', weight: 30, description: 'Cấu trúc báo cáo, trình bày khoa học, đầy đủ phần phân tích hệ thống và kết quả.' },
  { id: 'crit-2', title: '2. Năng lực giải quyết bài toán & Sản phẩm hoàn thành', weight: 40, description: 'Mức độ đáp ứng yêu cầu kỹ thuật thực tế, kiến trúc phần mềm và chất lượng mã nguồn.' },
  { id: 'crit-3', title: '3. Khả năng thuyết minh & Trả lời câu hỏi phản biện', weight: 30, description: 'Nắm vững kiến thức chuyên môn, trả lời rõ ràng các câu hỏi của GVHD.' },
];

type ScoreInput = Record<string, string>;

function isFinalBy(e: RubricEvaluation, role: 'COMPANY_MENTOR' | 'LECTURER') {
  return e.evaluatorRole === role && e.evaluationStage === 'FINAL';
}

export default function LecturerGradingDetailView({ placementId }: { placementId: string }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mentorScore, setMentorScore] = useState<number | null>(null);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [isPaperSubmitting, setIsPaperSubmitting] = useState(false);
  const [scores, setScores] = useState<ScoreInput>({});
  const [comments, setComments] = useState('');
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!placementId) return;
    setLoading(true); setError('');
    try {
      const [overviewRes, evaluationsRes] = await Promise.all([
        portfolioApi.overview(placementId),
        apiClient.get<RubricEvaluation[]>(`/api/v1/evaluations/placement/${placementId}`),
      ]);
      setOverview(overviewRes.data!);
      const evaluations = evaluationsRes.data ?? [];

      const mentor = evaluations.find(e => isFinalBy(e, 'COMPANY_MENTOR') && e.status === 'SUBMITTED');
      setMentorScore(mentor?.finalScore != null ? Number(mentor.finalScore) : null);

      const mine = evaluations.find(e => isFinalBy(e, 'LECTURER'));
      const loaded: ScoreInput = {};
      for (const c of mine?.criteriaScores ?? []) {
        if (c.score != null) loaded[c.criterionId] = String(c.score);
      }
      setScores(loaded);
      setComments(mine?.qualitativeFeedback ?? '');
      setSavedStatus(mine?.status ?? null);
    } catch (err) { setError(errorText(err)); } finally { setLoading(false); }
  }, [placementId]);

  useEffect(() => { loadData(); }, [loadData]);

  const p = overview?.placement;
  const isTermClosed = p?.termStatus === 'CLOSED';
  const isSubmitted = savedStatus === 'SUBMITTED';
  const isLocked = isTermClosed || isSubmitted;

  const parsed = CRITERIA.map(c => {
    const raw = scores[c.id];
    const value = raw === undefined || raw.trim() === '' ? null : Number(raw);
    return { ...c, value: value !== null && Number.isFinite(value) && value >= 0 && value <= 10 ? value : null, raw };
  });
  const isComplete = parsed.every(c => c.value !== null);
  const weightedScore = isComplete
    ? parseFloat(parsed.reduce((sum, c) => sum + (c.value as number) * (c.weight / 100), 0).toFixed(2))
    : null;
  const finalScore = weightedScore !== null && mentorScore !== null
    ? parseFloat((mentorScore * 0.4 + weightedScore * 0.6).toFixed(2))
    : null;
  const hasDiscrepancy = mentorScore !== null && weightedScore !== null && Math.abs(mentorScore - weightedScore) >= 3.0;

  const save = async (status: 'DRAFT' | 'SUBMITTED') => {
    if (isTermClosed) { setError('Học kỳ đã kết thúc (CLOSED). Không thể lưu điểm.'); return; }
    if (status === 'SUBMITTED') {
      if (!isComplete) { setError('Vui lòng nhập đủ điểm hợp lệ (0–10) cho tất cả tiêu chí trước khi nộp.'); return; }
      if (!comments.trim()) { setError('Vui lòng nhập nhận xét trước khi nộp.'); return; }
      if (!window.confirm(`Nộp điểm GVHD ${weightedScore?.toFixed(2)}/10? Sau khi nộp sẽ không thể sửa trực tiếp.`)) return;
    }
    setSubmitting(true); setError(''); setSuccess('');
    try {
      await apiClient.post('/api/v1/evaluations', {
        placementId, evaluationStage: 'FINAL', rubricVersion: 'CICT-LECTURER-2026',
        criteriaScores: parsed.filter(c => c.value !== null)
          .map(c => ({ criterionId: c.id, criterionName: c.title, weight: c.weight, score: c.value })),
        finalScore: weightedScore, qualitativeFeedback: comments.trim() || null, status,
      });
      setSuccess(status === 'SUBMITTED'
        ? `Đã nộp bảng điểm đánh giá của GVHD (${weightedScore?.toFixed(2)}/10 điểm).`
        : 'Đã lưu nháp. Điểm nháp chưa được tính vào kết quả.');
      await loadData();
    } catch (err) { setError(errorText(err)); } finally { setSubmitting(false); }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); void save('SUBMITTED'); };

  const handlePaperOverride = async (payload: { placementId: string; mentorScore: number; mentorFeedback: string; proofUrl: string }) => {
    setIsPaperSubmitting(true);
    try {
      await apiClient.post('/api/v1/evaluations/paper-override', payload);
      setMentorScore(payload.mentorScore); setSuccess(`Đã cập nhật điểm phiếu giấy của Doanh nghiệp (${payload.mentorScore}/10).`); setIsPaperModalOpen(false);
    } catch (err) { setError(errorText(err)); } finally { setIsPaperSubmitting(false); }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/lecturer/grading" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /><span>Quay lại danh sách chấm điểm</span>
        </Link>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Tải lại</Button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
      {success && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /><span>{success}</span></p>}
      {loading && <div role="status" className="rounded-xl border bg-white p-12 text-center text-slate-500">Đang tải thông tin chấm điểm…</div>}

      {p && !loading && (
        <>
          {isTermClosed && <TermClosedBanner termName={p.termName} />}
          <div className="rounded-xl border bg-white p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-base font-bold text-slate-900">{p.studentName} ({p.studentCode || 'N/A'})</p>
                <p className="text-xs text-slate-600">Đơn vị: {p.companyName} · Học kỳ: {p.termName}</p>
              </div>
              <Link href={`/lecturer/internship-record/${placementId}`}>
                <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" /><span>Xem báo cáo M-TT-05</span></Button>
              </Link>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2"><Award className="h-4 w-4 text-sky-600" /><span>Điểm Mentor Doanh nghiệp (40%): <strong>{mentorScore !== null ? `${mentorScore.toFixed(2)}/10` : 'Chưa có'}</strong></span></div>
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsPaperModalOpen(true)} disabled={isTermClosed} className="text-xs gap-1.5"><FileCheck className="h-3.5 w-3.5 text-amber-600" /><span>Nhập/Sửa điểm phiếu giấy</span></Button>
            </div>
          </div>

          {hasDiscrepancy && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div><p className="font-bold text-sm text-amber-900">Cảnh báo: Có sự chênh lệch điểm số đáng kể (&ge; 3.0 điểm)</p><p>Điểm Doanh nghiệp: {mentorScore?.toFixed(2)}/10 &bull; Điểm GVHD: {weightedScore?.toFixed(2)}/10. Khoa khuyến nghị rà soát kỹ báo cáo trước khi chốt điểm.</p></div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-xl border bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b pb-3 gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">Tiêu chí đánh giá của Giảng viên (Thang 10, trọng số 60%)</h3>
                  {savedStatus && (
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded font-medium ${
                      isSubmitted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Trạng thái: {isSubmitted ? 'Đã nộp chính thức' : 'Bản nháp (chưa nộp)'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="rounded bg-sky-50 px-2 py-1 font-bold text-sky-800">
                    Điểm GVHD: {weightedScore !== null ? `${weightedScore.toFixed(2)}/10` : 'Chưa chấm đủ'}
                  </span>
                  <span className="rounded bg-emerald-50 px-2 py-1 font-bold text-emerald-800">
                    Tổng điểm HP: {finalScore !== null ? `${finalScore.toFixed(2)}/10` : 'Chờ hoàn tất'}
                  </span>
                </div>
              </div>
              <div className="space-y-4 divide-y">
                {CRITERIA.map(c => (
                  <div key={c.id} className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-800">
                        {c.title} <span className="text-xs text-slate-500 font-normal">({c.weight}%)</span>
                      </p>
                      <p className="text-xs text-slate-500">{c.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        placeholder="0.0"
                        value={scores[c.id] ?? ''}
                        disabled={isLocked}
                        onChange={e => setScores({ ...scores, [c.id]: e.target.value })}
                        className="w-20 rounded-lg border px-3 py-1.5 text-center font-bold text-sm disabled:bg-slate-100"
                      />
                      <span className="text-xs text-slate-400">/ 10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 space-y-2">
              <label className="block text-sm font-semibold text-slate-900">
                Nhận xét chi tiết của Giảng viên hướng dẫn
              </label>
              <textarea
                rows={3}
                placeholder="Nhập nhận xét, đánh giá về quá trình thực tập và báo cáo của sinh viên..."
                value={comments}
                onChange={e => setComments(e.target.value)}
                disabled={isLocked}
                className="w-full rounded-lg border p-3 text-sm focus:border-sky-500 focus:outline-none disabled:bg-slate-100"
              />
              {!isLocked && (
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    isLoading={submitting}
                    disabled={isTermClosed}
                    onClick={() => save('DRAFT')}
                  >
                    Lưu nháp
                  </Button>
                  <Button
                    type="submit"
                    isLoading={submitting}
                    disabled={isTermClosed || !isComplete}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Nộp điểm chính thức</span>
                  </Button>
                </div>
              )}
              {isSubmitted && (
                <p className="text-xs text-slate-500 italic text-right pt-1">
                  Bảng điểm đã được nộp chính thức và khóa chỉnh sửa trực tiếp.
                </p>
              )}
            </div>
          </form>

          <PaperEvaluationOverrideModal
            isOpen={isPaperModalOpen}
            onClose={() => setIsPaperModalOpen(false)}
            onConfirm={handlePaperOverride}
            placement={overview?.placement ? {
              id: overview.placement.id,
              studentName: overview.placement.studentName,
              studentCode: overview.placement.studentCode || '',
              companyName: overview.placement.companyName,
              termStatus: overview.placement.termStatus
            } as any : null}
            isLoading={isPaperSubmitting}
          />
        </>
      )}
    </div>
  );
}
