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

interface RubricCriterion { id: string; title: string; weight: number; description: string; defaultScore: number; }
const CRITERIA: RubricCriterion[] = [
  { id: 'crit-1', title: '1. Nội dung báo cáo tổng kết thực tập', weight: 30, description: 'Cấu trúc báo cáo, trình bày khoa học, đầy đủ phần phân tích hệ thống và kết quả.', defaultScore: 8.5 },
  { id: 'crit-2', title: '2. Năng lực giải quyết bài toán & Sản phẩm hoàn thành', weight: 40, description: 'Mức độ đáp ứng yêu cầu kỹ thuật thực tế, kiến trúc phần mềm và chất lượng mã nguồn.', defaultScore: 8.8 },
  { id: 'crit-3', title: '3. Khả năng thuyết minh & Trả lời câu hỏi phản biện', weight: 30, description: 'Nắm vững kiến thức chuyên môn, trả lời rõ ràng các câu hỏi của GVHD.', defaultScore: 8.5 },
];

export default function LecturerGradingDetailView({ placementId }: { placementId: string }) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mentorScore, setMentorScore] = useState<number | null>(8.0);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [isPaperSubmitting, setIsPaperSubmitting] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({ 'crit-1': 8.5, 'crit-2': 8.8, 'crit-3': 8.5 });
  const [comments, setComments] = useState('Sinh viên thực hiện đầy đủ các yêu cầu của học phần thực tập. Báo cáo rõ ràng, trình bày mạch lạc, sản phẩm có tính ứng dụng cao.');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!placementId) return;
    setLoading(true); setError('');
    try {
      const res = await portfolioApi.overview(placementId);
      setOverview(res.data!);
    } catch (err) { setError(errorText(err)); } finally { setLoading(false); }
  }, [placementId]);

  useEffect(() => { loadData(); }, [loadData]);

  const p = overview?.placement;
  const isTermClosed = p?.termStatus === 'CLOSED';
  const weightedScore = CRITERIA.reduce((sum, c) => sum + (scores[c.id] ?? 0) * (c.weight / 100), 0);
  const finalScore = mentorScore !== null ? parseFloat((mentorScore * 0.4 + weightedScore * 0.6).toFixed(2)) : parseFloat(weightedScore.toFixed(2));
  const hasDiscrepancy = mentorScore !== null && Math.abs(mentorScore - weightedScore) >= 3.0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTermClosed) { setError('Học kỳ đã kết thúc (CLOSED). Không thể lưu điểm.'); return; }
    setSubmitting(true); setError(''); setSuccess('');
    try {
      await apiClient.post('/api/v1/evaluations', {
        placementId, evaluationStage: 'FINAL', rubricVersion: 'CICT-LECTURER-2026',
        criteriaScores: CRITERIA.map(c => ({ criterionId: c.id, criterionName: c.title, weight: c.weight, score: scores[c.id] ?? 0 })),
        finalScore: parseFloat(weightedScore.toFixed(2)), qualitativeFeedback: comments, status: 'SUBMITTED',
      });
      setSuccess(`Đã lưu bảng điểm đánh giá của GVHD (${weightedScore.toFixed(2)}/10 điểm).`);
    } catch (err) { setError(errorText(err)); } finally { setSubmitting(false); }
  };

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
              <div><p className="font-bold text-sm text-amber-900">Cảnh báo: Có sự chênh lệch điểm số đáng kể (&ge; 3.0 điểm)</p><p>Điểm Doanh nghiệp: {mentorScore?.toFixed(2)}/10 &bull; Điểm GVHD: {weightedScore.toFixed(2)}/10. Khoa khuyến nghị rà soát kỹ báo cáo trước khi chốt điểm.</p></div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-xl border bg-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-semibold text-slate-900">Tiêu chí đánh giá của Giảng viên (Thang 10, trọng số 60%)</h3>
                <div className="flex gap-2 text-xs">
                  <span className="rounded bg-sky-50 px-2 py-1 font-bold text-sky-800">Điểm GVHD: {weightedScore.toFixed(2)}/10</span>
                  <span className="rounded bg-emerald-50 px-2 py-1 font-bold text-emerald-800">Tổng điểm HP: {finalScore.toFixed(2)}/10</span>
                </div>
              </div>
              <div className="space-y-4 divide-y">
                {CRITERIA.map(c => (
                  <div key={c.id} className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5"><p className="text-sm font-semibold text-slate-800">{c.title} <span className="text-xs text-slate-500 font-normal">({c.weight}%)</span></p><p className="text-xs text-slate-500">{c.description}</p></div>
                    <div className="flex items-center gap-1.5"><input type="number" min="0" max="10" step="0.1" value={scores[c.id] ?? c.defaultScore} disabled={isTermClosed} onChange={e => setScores({ ...scores, [c.id]: Number(e.target.value) })} className="w-20 rounded-lg border px-3 py-1.5 text-center font-bold text-sm" required /><span className="text-xs text-slate-400">/ 10</span></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 space-y-2">
              <label className="block text-sm font-semibold text-slate-900">Nhận xét chi tiết của Giảng viên hướng dẫn</label>
              <textarea rows={3} value={comments} onChange={e => setComments(e.target.value)} disabled={isTermClosed} className="w-full rounded-lg border p-3 text-sm focus:border-sky-500 focus:outline-none" required />
              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={submitting} disabled={isTermClosed} className="gap-2"><Send className="h-4 w-4" /><span>Lưu điểm đánh giá GVHD</span></Button>
              </div>
            </div>
          </form>

          <PaperEvaluationOverrideModal isOpen={isPaperModalOpen} onClose={() => setIsPaperModalOpen(false)} onConfirm={handlePaperOverride} placement={overview?.placement ? { id: overview.placement.id, studentName: overview.placement.studentName, studentCode: overview.placement.studentCode || '', companyName: overview.placement.companyName, termStatus: overview.placement.termStatus } as any : null} isLoading={isPaperSubmitting} />
        </>
      )}
    </div>
  );
}
