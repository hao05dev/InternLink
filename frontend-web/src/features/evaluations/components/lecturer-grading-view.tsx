'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { EmptyState } from '@/components/ui/empty-state';
import { PaperEvaluationOverrideModal } from './modals/paper-evaluation-override-modal';
import { LecturerGradingHeader } from './grading/lecturer-grading-header';
import { LecturerStudentSelectorCard } from './grading/lecturer-student-selector-card';
import { LecturerMentorScoreCard } from './grading/lecturer-mentor-score-card';
import { LecturerRubricTable, type LecturerRubricCriterion } from './grading/lecturer-rubric-table';
import { LecturerPenaltyChecklistCard } from './grading/lecturer-penalty-checklist-card';
import { LecturerGradingSummaryCard } from './grading/lecturer-grading-summary-card';
import type { InternshipPlacement } from '@/features/placements/types/placement.types';

const LECTURER_CRITERIA: LecturerRubricCriterion[] = [
  {
    id: 'lec-crit-1',
    title: '1. Nội dung báo cáo tổng kết thực tập',
    weight: 30,
    description: 'Cấu trúc báo cáo, trình bày khoa học, đầy đủ phần phân tích hệ thống và kết quả thực hiện.',
    defaultScore: 8.5,
  },
  {
    id: 'lec-crit-2',
    title: '2. Năng lực giải quyết bài toán & Sản phẩm hoàn thành',
    weight: 40,
    description: 'Mức độ đáp ứng yêu cầu kỹ thuật của bài toán thực tế, kiến trúc phần mềm và chất lượng code.',
    defaultScore: 8.8,
  },
  {
    id: 'lec-crit-3',
    title: '3. Khả năng thuyết minh & Trả lời câu hỏi phản biện',
    weight: 30,
    description: 'Nắm vững kiến thức chuyên môn, trả lời rõ ràng các câu hỏi của giảng viên hướng dẫn.',
    defaultScore: 8.5,
  },
];

export default function LecturerGradingView() {
  const [students, setStudents] = useState<InternshipPlacement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlacementId, setSelectedPlacementId] = useState('');
  const [mentorScore, setMentorScore] = useState<number | null>(8.0);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);
  const [isPaperSubmitting, setIsPaperSubmitting] = useState(false);

  const [scores, setScores] = useState<Record<string, number>>({
    'lec-crit-1': 8.5,
    'lec-crit-2': 8.8,
    'lec-crit-3': 8.5,
  });

  const [missedBriefing, setMissedBriefing] = useState(false);
  const [lateM01Submission, setLateM01Submission] = useState(false);

  const [comments, setComments] = useState(
    'Sinh viên thực hiện đầy đủ các yêu cầu của học phần thực tập. Báo cáo rõ ràng, trình bày mạch lạc, sản phẩm có tính ứng dụng cao.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await apiClient.get<InternshipPlacement[]>('/api/v1/placements/lecturer/my-students');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setStudents(res.data);
          setSelectedPlacementId(res.data[0].id);
        } else {
          setStudents([]);
          setSelectedPlacementId('');
        }
      } catch {
        setStudents([]);
        setSelectedPlacementId('');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudents();
  }, []);

  const totalPenalty = (missedBriefing ? 1.0 : 0) + (lateM01Submission ? 1.0 : 0);

  const weightedScore = LECTURER_CRITERIA.reduce((acc, c) => {
    const sc = scores[c.id] ?? 0;
    return acc + sc * (c.weight / 100);
  }, 0);

  const currentStudent = students.find((s) => s.id === selectedPlacementId);
  const isTermClosed = currentStudent?.termStatus === 'CLOSED';
  const hasScoreDiscrepancy = mentorScore !== null && Math.abs(mentorScore - weightedScore) >= 3.0;

  const rawCourseGrade = mentorScore !== null
    ? mentorScore * 0.4 + weightedScore * 0.6
    : weightedScore;
  const finalCourseGrade = Math.max(0, parseFloat((rawCourseGrade - totalPenalty).toFixed(2)));

  const handleScoreChange = (id: string, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      setScores((prev) => ({ ...prev, [id]: num }));
    }
  };

  const handlePaperOverrideSubmit = async (payload: {
    placementId: string;
    mentorScore: number;
    mentorFeedback: string;
    proofUrl: string;
  }) => {
    setIsPaperSubmitting(true);
    try {
      await apiClient.post('/api/v1/evaluations/paper-override', payload);
      setMentorScore(payload.mentorScore);
      setMessage({
        type: 'success',
        text: `Đã cập nhật điểm đánh giá theo phiếu giấy của Doanh nghiệp (${payload.mentorScore}/10) thành công!`,
      });
      setIsPaperModalOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lưu điểm phiếu giấy thất bại.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsPaperSubmitting(false);
    }
  };

  const handleSubmitGrading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlacementId) return;

    setIsSubmitting(true);
    if (isTermClosed) {
      setMessage({ type: 'error', text: 'Học kỳ của sinh viên này đã kết thúc (CLOSED). Không thể lưu điểm.' });
      setIsSubmitting(false);
      return;
    }

    try {
      await apiClient.post('/api/v1/evaluations', {
        placementId: selectedPlacementId,
        evaluationStage: 'FINAL',
        rubricVersion: 'CICT-LECTURER-2026',
        criteriaScores: LECTURER_CRITERIA.map((c) => ({
          criterionId: c.id,
          criterionName: c.title,
          weight: c.weight,
          score: scores[c.id] ?? 0,
        })),
        rawScore: parseFloat(weightedScore.toFixed(2)),
        penalties: totalPenalty,
        penaltyDetails: { missedBriefing, lateM01Submission },
        finalScore: finalCourseGrade,
        qualitativeFeedback: comments,
        status: 'SUBMITTED',
      });

      setMessage({
        type: 'success',
        text: `Đã lưu phiếu chấm điểm của GVHD cho sinh viên ${currentStudent?.studentName || ''} (Điểm tổng kết: ${finalCourseGrade}/10).`,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu phiếu chấm điểm.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="space-y-8 max-w-4xl">
        <LecturerGradingHeader
          message={message}
          onClearMessage={() => setMessage(null)}
          isTermClosed={false}
          hasScoreDiscrepancy={false}
        />
        <EmptyState
          title="Chưa có sinh viên thực tập"
          description="Bạn hiện chưa được phân công hướng dẫn sinh viên nào trong kỳ thực tập này."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <LecturerGradingHeader
        message={message}
        onClearMessage={() => setMessage(null)}
        isTermClosed={!!isTermClosed}
        hasScoreDiscrepancy={hasScoreDiscrepancy}
      />

      <form onSubmit={handleSubmitGrading} className="space-y-6">
        <LecturerStudentSelectorCard
          students={students}
          selectedPlacementId={selectedPlacementId}
          onSelectStudent={setSelectedPlacementId}
          currentStudent={currentStudent}
        />

        <LecturerMentorScoreCard
          mentorScore={mentorScore}
          onOpenPaperModal={() => setIsPaperModalOpen(true)}
          isTermClosed={!!isTermClosed}
        />

        <LecturerRubricTable
          criteria={LECTURER_CRITERIA}
          scores={scores}
          onScoreChange={handleScoreChange}
          weightedScore={weightedScore}
          isTermClosed={!!isTermClosed}
        />

        <LecturerPenaltyChecklistCard
          missedBriefing={missedBriefing}
          onToggleMissedBriefing={setMissedBriefing}
          lateM01Submission={lateM01Submission}
          onToggleLateM01Submission={setLateM01Submission}
          totalPenalty={totalPenalty}
          isTermClosed={!!isTermClosed}
        />

        <LecturerGradingSummaryCard
          comments={comments}
          onCommentsChange={setComments}
          weightedScore={weightedScore}
          mentorScore={mentorScore}
          totalPenalty={totalPenalty}
          finalCourseGrade={finalCourseGrade}
          isSubmitting={isSubmitting}
          isTermClosed={!!isTermClosed}
        />
      </form>

      <PaperEvaluationOverrideModal
        isOpen={isPaperModalOpen}
        onClose={() => setIsPaperModalOpen(false)}
        onConfirm={handlePaperOverrideSubmit}
        placement={currentStudent || null}
        isLoading={isPaperSubmitting}
      />
    </div>
  );
}
