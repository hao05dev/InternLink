'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { portfolioApi, errorText } from '@/features/portfolio/api';
import type { Overview } from '@/features/portfolio/types';
import TermClosedBanner from '@/features/portfolio/components/term-closed-banner';
import { PaperEvaluationOverrideModal } from '../components/modals/paper-evaluation-override-modal';
import type { RubricEvaluation } from '../types/evaluation.types';
import { getCriteriaForProgram } from '../utils/program-rubric-criteria';
import { LecturerStudentInfoBar } from '../components/grading/lecturer-student-info-bar';
import { LecturerSealedEvaluationCard } from '../components/grading/lecturer-sealed-evaluation-card';
import { LecturerProgramRubricForm } from '../components/grading/lecturer-program-rubric-form';

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
  const [proofUrl, setProofUrl] = useState<string | undefined>();
  const [isPaperDigitized, setIsPaperDigitized] = useState(false);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [isPaperSubmitting, setIsPaperSubmitting] = useState(false);
  const [scores, setScores] = useState<ScoreInput>({});
  const [comments, setComments] = useState('');
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!placementId) return;
    setLoading(true);
    setError('');
    try {
      const [overviewRes, evaluationsRes] = await Promise.all([
        portfolioApi.overview(placementId),
        apiClient.get<RubricEvaluation[]>(`/api/v1/evaluations/placement/${placementId}`),
      ]);
      setOverview(overviewRes.data!);
      const evaluations = evaluationsRes.data ?? [];

      const mentor = evaluations.find((e) => isFinalBy(e, 'COMPANY_MENTOR') && e.status === 'SUBMITTED');
      setMentorScore(mentor?.finalScore != null ? Number(mentor.finalScore) : null);
      if (mentor?.rubricVersion?.includes('PAPER') || mentor?.rubricVersion?.includes('OFFLINE')) {
        setIsPaperDigitized(true);
        const firstCriterion = mentor.criteriaScores?.[0];
        if (firstCriterion && typeof firstCriterion === 'object' && 'proofUrl' in firstCriterion) {
          setProofUrl(String(firstCriterion.proofUrl));
        }
      }

      const mine = evaluations.find((e) => isFinalBy(e, 'LECTURER'));
      const loaded: ScoreInput = {};
      for (const c of mine?.criteriaScores ?? []) {
        if (c.score != null) loaded[c.criterionId] = String(c.score);
      }
      setScores(loaded);
      setComments(mine?.qualitativeFeedback ?? '');
      setSavedStatus(mine?.status ?? null);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [placementId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const p = overview?.placement;
  const isTermClosed = p?.termStatus === 'CLOSED';
  const isLocked = isTermClosed || savedStatus === 'SUBMITTED';

  // Xác định bộ tiêu chí Rubric chuẩn theo chuyên ngành của sinh viên (KHMT, MMT, DEFAULT)
  const { criteria, badgeLabel, programKey, versionTag } = useMemo(() => {
    return getCriteriaForProgram(p?.programName, p?.programName);
  }, [p?.programName]);

  const handleScoreChange = (criterionId: string, value: string) => {
    setScores((prev) => ({ ...prev, [criterionId]: value }));
  };

  const save = async (status: 'DRAFT' | 'SUBMITTED') => {
    if (isTermClosed) {
      setError('Học kỳ đã kết thúc (CLOSED). Không thể lưu điểm.');
      return;
    }
    const parsed = criteria.map((c) => ({
      ...c,
      value: scores[c.id] ? Number(scores[c.id]) : null,
    }));
    const isComplete = parsed.every((c) => c.value !== null && c.value >= 0 && c.value <= 10);
    const weightedScore = isComplete
      ? parseFloat(parsed.reduce((sum, c) => sum + (c.value as number) * (c.weight / 100), 0).toFixed(2))
      : null;

    if (status === 'SUBMITTED') {
      if (!isComplete) {
        setError('Vui lòng nhập đủ điểm hợp lệ (0–10) cho tất cả tiêu chí trước khi nộp.');
        return;
      }
      if (!comments.trim()) {
        setError('Vui lòng nhập nhận xét trước khi nộp.');
        return;
      }
      if (!window.confirm(`Nộp điểm GVHD ${weightedScore?.toFixed(2)}/10? Sau khi nộp sẽ không thể sửa trực tiếp.`)) {
        return;
      }
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.post('/api/v1/evaluations', {
        placementId,
        evaluationStage: 'FINAL',
        rubricVersion: versionTag,
        criteriaScores: parsed
          .filter((c) => c.value !== null)
          .map((c) => ({ criterionId: c.id, criterionName: c.title, weight: c.weight, score: c.value })),
        finalScore: weightedScore,
        qualitativeFeedback: comments.trim() || null,
        status,
      });
      setSuccess(
        status === 'SUBMITTED'
          ? `Đã nộp bảng điểm đánh giá của GVHD (${weightedScore?.toFixed(2)}/10 điểm).`
          : 'Đã lưu bản nháp. Điểm nháp chưa được tính vào kết quả chính thức.'
      );
      await loadData();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaperOverride = async (payload: {
    placementId: string;
    mentorScore: number;
    mentorFeedback: string;
    proofUrl: string;
    evidenceDocumentId?: string;
  }) => {
    setIsPaperSubmitting(true);
    setError('');
    try {
      await apiClient.post('/api/v1/evaluations/paper-override', payload);
      setMentorScore(payload.mentorScore);
      setProofUrl(payload.proofUrl);
      setIsPaperDigitized(true);
      setSuccess(`Đã xác nhận và số hóa điểm phiếu giấy của cơ quan (${payload.mentorScore}/10).`);
      setIsPaperModalOpen(false);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setIsPaperSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/lecturer/grading"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại danh sách chấm điểm</span>
        </Link>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Tải lại
        </Button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
      {success && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{success}</span>
        </p>
      )}
      {loading && <div role="status" className="rounded-xl border bg-white p-12 text-center text-slate-500">Đang tải thông tin chấm điểm…</div>}

      {p && !loading && (
        <>
          {isTermClosed && <TermClosedBanner termName={p.termName} />}

          {/* 1. Header thông tin sinh viên & ngành */}
          <LecturerStudentInfoBar
            placement={p}
            placementId={placementId}
            badgeLabel={badgeLabel}
            programKey={programKey}
          />

          {/* 2. Thẻ xác nhận & số hóa phiếu niêm phong cơ quan (40%) */}
          <LecturerSealedEvaluationCard
            mentorScore={mentorScore}
            proofUrl={proofUrl}
            isPaperDigitized={isPaperDigitized}
            isTermClosed={isTermClosed}
            onOpenPaperModal={() => setIsPaperModalOpen(true)}
          />

          {/* 3. Form chấm điểm Rubric GVHD theo ngành (60%) */}
          <LecturerProgramRubricForm
            criteria={criteria}
            scores={scores}
            onScoreChange={handleScoreChange}
            comments={comments}
            onCommentsChange={setComments}
            mentorScore={mentorScore}
            savedStatus={savedStatus}
            isLocked={isLocked}
            isTermClosed={isTermClosed}
            submitting={submitting}
            onSave={save}
          />

          {/* 4. Modal nhập điểm & upload ảnh chụp phiếu niêm phong */}
          <PaperEvaluationOverrideModal
            isOpen={isPaperModalOpen}
            onClose={() => setIsPaperModalOpen(false)}
            onConfirm={handlePaperOverride}
            placement={p}
            isLoading={isPaperSubmitting}
          />
        </>
      )}
    </div>
  );
}
