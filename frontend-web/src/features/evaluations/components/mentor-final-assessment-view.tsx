'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
    Award,
    CheckCircle2,
    AlertCircle,
    User,
    GraduationCap,
    Send,
    BarChart3,
    FileCheck2
} from 'lucide-react';
import type { InternshipPlacement } from '@/features/placements/types/placement.types';
import type { RubricCriteriaScore } from '@/features/evaluations/types/evaluation.types';

interface RubricCriterionDefinition {
    id: string;
    title: string;
    description: string;
    weight: number; // percentage (e.g. 20%)
    defaultScore: number;
}

const DEFAULT_CRITERIA: RubricCriterionDefinition[] = [
    {
        id: 'crit-1',
        title: '1. Ý thức kỷ luật, chuyên cần và thái độ làm việc',
        description: 'Chấp hành nghiêm giờ giấc, quy định văn hóa công ty và bảo mật dữ liệu khách hàng.',
        weight: 20,
        defaultScore: 9.0,
    },
    {
        id: 'crit-2',
        title: '2. Năng lực chuyên môn & Kỹ năng kỹ thuật',
        description: 'Khả năng nắm bắt công nghệ mới, chất lượng mã nguồn viết ra và giải quyết yêu cầu kỹ thuật.',
        weight: 30,
        defaultScore: 8.5,
    },
    {
        id: 'crit-3',
        title: '3. Tinh thần đồng đội & Kỹ năng giao tiếp',
        description: 'Tương tác tốt với thành viên trong nhóm dự án, tham gia thảo luận và báo cáo tiến độ rõ ràng.',
        weight: 20,
        defaultScore: 9.0,
    },
    {
        id: 'crit-4',
        title: '4. Tính chủ động và tinh thần cầu tiến',
        description: 'Chủ động tìm hiểu giải pháp khi gặp khó khăn, lắng nghe góp ý và không ngại thử thách mới.',
        weight: 20,
        defaultScore: 8.5,
    },
    {
        id: 'crit-5',
        title: '5. Đóng góp cụ thể cho sản phẩm / dự án thực tế',
        description: 'Mức độ hoàn thành các tính năng được giao, giá trị gia tăng tạo ra cho đội ngũ.',
        weight: 10,
        defaultScore: 9.0,
    },
];

export default function MentorFinalAssessmentView() {
    const { user } = useAuth();
    const [interns, setInterns] = useState<InternshipPlacement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlacementId, setSelectedPlacementId] = useState('');
    const [scores, setScores] = useState<Record<string, number>>({
        'crit-1': 9.0,
        'crit-2': 8.5,
        'crit-3': 9.0,
        'crit-4': 8.5,
        'crit-5': 9.0,
    });
    const [feedback, setFeedback] = useState(
        'Sinh viên có tác phong làm việc chuyên nghiệp, hòa nhập nhanh với văn hóa doanh nghiệp. Nắm bắt tốt kiến trúc hệ thống và hoàn thành đúng tiến độ các nhiệm vụ được giao.'
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedSuccess, setSubmittedSuccess] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        async function fetchMentorInterns() {
            try {
                const res = await apiClient.get<InternshipPlacement[]>('/api/v1/placements/mentor/my-students');
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    setInterns(res.data);
                    setSelectedPlacementId(res.data[0].id);
                } else {
                    setInterns([]);
                    setSelectedPlacementId('');
                }
            } catch {
                setInterns([]);
                setSelectedPlacementId('');
            } finally {
                setIsLoading(false);
            }
        }

        fetchMentorInterns();
    }, []);

    // Calculate weighted final score
    const weightedFinalScore = DEFAULT_CRITERIA.reduce((acc, crit) => {
        const sc = scores[crit.id] ?? 0;
        return acc + sc * (crit.weight / 100);
    }, 0);

    const handleScoreChange = (criterionId: string, val: string) => {
        const num = parseFloat(val);
        if (!isNaN(num) && num >= 0 && num <= 10) {
            setScores(prev => ({ ...prev, [criterionId]: num }));
        }
    };

    const selectedIntern = interns.find(i => i.id === selectedPlacementId);
    const isTermClosed = selectedIntern?.termStatus === 'CLOSED';

    const handleSubmitAssessment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlacementId) return;

        if (isTermClosed) {
            setMessage({ type: 'error', text: 'Học kỳ của sinh viên này đã kết thúc (CLOSED). Không thể nộp đánh giá.' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        const currentIntern = interns.find(i => i.id === selectedPlacementId);

        const criteriaScoresPayload = DEFAULT_CRITERIA.map(crit => ({
            criterionId: crit.id,
            criterionName: crit.title,
            weight: crit.weight,
            score: scores[crit.id] ?? 0,
            maxScore: 10,
        }));

        try {
            await apiClient.post('/api/v1/evaluations', {
                placementId: selectedPlacementId,
                evaluationStage: 'FINAL',
                rubricVersion: 'CICT-RUBRIC-2026-V1',
                criteriaScores: criteriaScoresPayload,
                finalScore: parseFloat(weightedFinalScore.toFixed(2)),
                qualitativeFeedback: feedback,
                status: 'SUBMITTED',
            });

            setSubmittedSuccess(true);
            setMessage({
                type: 'success',
                text: `Đã gửi đánh giá thực tập cuối kỳ cho sinh viên ${currentIntern?.studentName || ''} (${weightedFinalScore.toFixed(2)}/10 điểm). Điểm số đã được ghi nhận trên hệ thống.`,
            });
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi nộp đánh giá Rubric.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
                <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
            </div>
        );
    }

    if (interns.length === 0) {
        return (
            <div className="space-y-8 max-w-4xl">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Đánh Giá Thực Tập Cuối Kỳ (Mentor Rubric Assessment)
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Phiếu đánh giá theo tiêu chuẩn Rubric của Khoa CNTT&TT - ĐH Cần Thơ dành cho Cán bộ hướng dẫn Doanh nghiệp.
                    </p>
                </div>
                <EmptyState
                    title="Chưa có sinh viên thực tập"
                    description="Bạn hiện chưa được phân công phụ trách hướng dẫn sinh viên nào trong kỳ thực tập này."
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Đánh Giá Thực Tập Cuối Kỳ (Mentor Rubric Assessment)
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Phiếu đánh giá theo tiêu chuẩn Rubric của Khoa CNTT&TT - ĐH Cần Thơ dành cho Cán bộ hướng dẫn Doanh nghiệp.
                </p>
            </div>

            {/* Notification alert */}
            {message && (
                <div
                    role="alert"
                    aria-live="polite"
                    className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                        message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>{message.text}</span>
                </div>
            )}

            {/* Term Closed Alert */}
            {isTermClosed && (
                <div className="p-4 rounded-xl flex items-center gap-3 text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Học kỳ của sinh viên này đã kết thúc (CLOSED). Đánh giá đã được chốt và chuyển sang chế độ chỉ xem. Không thể chỉnh sửa hoặc nộp lại.</span>
                </div>
            )}

            <form onSubmit={handleSubmitAssessment} className="space-y-6">
                {/* Select Intern Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <span>Chọn thực tập sinh đánh giá</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select
                            label="Sinh viên thực tập"
                            id="placementSelect"
                            value={selectedPlacementId}
                            onChange={(e) => {
                                setSelectedPlacementId(e.target.value);
                                setSubmittedSuccess(false);
                            }}
                            options={interns.map(i => ({
                                value: i.id,
                                label: `${i.studentName} — MSSV: ${i.studentCode} (${i.jobTitle})`
                            }))}
                        />

                        {selectedIntern && (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                                <div>
                                    <span className="text-slate-400 block">Sinh viên:</span>
                                    <strong className="text-slate-900">{selectedIntern.studentName}</strong>
                                </div>
                                <div>
                                    <span className="text-slate-400 block">MSSV:</span>
                                    <strong className="text-slate-900">{selectedIntern.studentCode}</strong>
                                </div>
                                <div>
                                    <span className="text-slate-400 block">Đơn vị:</span>
                                    <strong className="text-slate-900">{selectedIntern.companyName}</strong>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Rubric Criteria Table Card */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Award className="w-4 h-4 text-amber-500" />
                                    <span>Tiêu chí đánh giá Rubric (Thang điểm 10)</span>
                                </CardTitle>
                                <CardDescription>
                                    Quy định chấm điểm theo chuẩn đầu ra của Trường CNTT&TT - ĐH Cần Thơ
                                </CardDescription>
                            </div>

                            {/* Final Calculated Score Badge */}
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 self-start sm:self-auto">
                                <div>
                                    <p className="text-[11px] font-semibold text-blue-700 uppercase">Điểm tổng kết Mentor:</p>
                                    <p className="text-2xl font-black text-blue-900">
                                        {weightedFinalScore.toFixed(2)} <span className="text-xs font-normal text-blue-700">/ 10</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="divide-y divide-slate-100">
                            {DEFAULT_CRITERIA.map((crit) => (
                                <div key={crit.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-slate-900">{crit.title}</span>
                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                                Trọng số: {crit.weight}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            {crit.description}
                                        </p>
                                    </div>

                                    <div className="w-32 flex items-center gap-2">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="10"
                                            value={scores[crit.id] ?? crit.defaultScore}
                                            onChange={(e) => handleScoreChange(crit.id, e.target.value)}
                                            disabled={isTermClosed}
                                            className="text-center font-bold text-slate-900"
                                            required
                                        />
                                        <span className="text-xs text-slate-400">/ 10</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Qualitative Feedback Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileCheck2 className="w-4 h-4 text-emerald-600" />
                            <span>Nhận xét và Đánh giá tổng quát</span>
                        </CardTitle>
                        <CardDescription>
                            Ý kiến ghi nhận từ Mentor về quá trình thực tập, điểm mạnh và các điểm cần hoàn thiện
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            rows={4}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            disabled={isTermClosed}
                            placeholder="Ghi nhận xét cụ thể về sinh viên..."
                            required
                        />
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            {submittedSuccess ? (
                                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Đã nộp đánh giá thành công!
                                </span>
                            ) : (
                                <span>Điểm số sau khi gửi sẽ được tổng hợp tự động vào bảng điểm chung của Khoa.</span>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSubmitting}
                            disabled={isTermClosed}
                            title={isTermClosed ? 'Học kỳ đã kết thúc (CLOSED)' : undefined}
                            className="gap-2 px-6"
                        >
                            <Send className="w-4 h-4" />
                            <span>Gửi đánh giá Rubric</span>
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
