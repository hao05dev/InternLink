'use client';

import React, { useState, useEffect } from 'react';
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
    FileText,
    CheckCircle2,
    Send,
    BarChart3,
    GraduationCap,
    UserCheck,
    Download
} from 'lucide-react';
import type { InternshipPlacement } from '@/features/placements/types/placement.types';

interface LecturerRubricCriterion {
    id: string;
    title: string;
    weight: number;
    description: string;
    defaultScore: number;
}

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
    const [scores, setScores] = useState<Record<string, number>>({
        'lec-crit-1': 8.5,
        'lec-crit-2': 8.8,
        'lec-crit-3': 8.5,
    });
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

    const weightedScore = LECTURER_CRITERIA.reduce((acc, c) => {
        const sc = scores[c.id] ?? 0;
        return acc + sc * (c.weight / 100);
    }, 0);

    const handleScoreChange = (id: string, val: string) => {
        const num = parseFloat(val);
        if (!isNaN(num) && num >= 0 && num <= 10) {
            setScores(prev => ({ ...prev, [id]: num }));
        }
    };

    const handleSubmitGrading = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlacementId) return;

        setIsSubmitting(true);
        const currentStudent = students.find(s => s.id === selectedPlacementId);

        try {
            await apiClient.post('/api/v1/evaluations', {
                placementId: selectedPlacementId,
                evaluationStage: 'FINAL',
                rubricVersion: 'CICT-LECTURER-2026',
                criteriaScores: LECTURER_CRITERIA.map(c => ({
                    criterionId: c.id,
                    criterionName: c.title,
                    weight: c.weight,
                    score: scores[c.id] ?? 0,
                })),
                finalScore: parseFloat(weightedScore.toFixed(2)),
                qualitativeFeedback: comments,
                status: 'SUBMITTED',
            });

            setMessage({
                type: 'success',
                text: `Đã lưu phiếu chấm điểm của GVHD cho sinh viên ${currentStudent?.studentName || ''} (${weightedScore.toFixed(2)}/10 điểm).`,
            });
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu phiếu chấm điểm.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentStudent = students.find(s => s.id === selectedPlacementId);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
                <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="space-y-8 max-w-4xl">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Chấm Điểm & Báo Cáo CLO (Lecturer Grading)
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Đánh giá báo cáo thực tập, chấm điểm Rubric của Giảng viên hướng dẫn và tổng hợp chuẩn đầu ra học phần.
                    </p>
                </div>
                <EmptyState
                    title="Chưa có sinh viên thực tập"
                    description="Bạn hiện chưa được phân công hướng dẫn sinh viên nào trong kỳ thực tập này."
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Chấm Điểm & Báo Cáo CLO (Lecturer Grading)
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Đánh giá báo cáo thực tập, chấm điểm Rubric của Giảng viên hướng dẫn và tổng hợp chuẩn đầu ra học phần.
                </p>
            </div>

            {/* Notification alert */}
            {message && (
                <div
                    role="alert"
                    aria-live="polite"
                    className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${
                        message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span>{message.text}</span>
                    </div>
                    <button
                        onClick={() => setMessage(null)}
                        className="text-slate-400 hover:text-slate-600"
                        aria-label="Đóng thông báo"
                    >
                        &times;
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmitGrading} className="space-y-6">
                {/* Select Student */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-blue-600" />
                            <span>Chọn sinh viên chấm điểm</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select
                            label="Sinh viên thực tập"
                            id="studentSelect"
                            value={selectedPlacementId}
                            onChange={(e) => setSelectedPlacementId(e.target.value)}
                            options={students.map(s => ({
                                value: s.id,
                                label: `${s.studentName} — MSSV: ${s.studentCode} (${s.companyName})`
                            }))}
                        />

                        {currentStudent && (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="text-xs text-slate-700 space-y-1">
                                    <p><strong>Sinh viên:</strong> {currentStudent.studentName} (MSSV: {currentStudent.studentCode})</p>
                                    <p><strong>Đơn vị thực tập:</strong> {currentStudent.companyName}</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => alert('Tải báo cáo PDF để chấm điểm')}
                                    className="gap-1.5 text-xs bg-white self-start sm:self-auto"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Tải báo cáo PDF</span>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Rubric Criteria */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Award className="w-4 h-4 text-amber-500" />
                                    <span>Tiêu chí đánh giá của Giảng viên (Thang 10)</span>
                                </CardTitle>
                                <CardDescription>Trọng số điểm GVHD chiếm 60% tổng điểm học phần thực tập</CardDescription>
                            </div>

                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 self-start sm:self-auto">
                                <div>
                                    <p className="text-[11px] font-semibold text-blue-700 uppercase">Điểm GVHD:</p>
                                    <p className="text-2xl font-black text-blue-900">
                                        {weightedScore.toFixed(2)} <span className="text-xs font-normal text-blue-700">/ 10</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="divide-y divide-slate-100">
                            {LECTURER_CRITERIA.map((crit) => (
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

                {/* Comments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Nhận xét chi tiết của Giảng viên hướng dẫn</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            rows={3}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Ghi nhận xét và kiến nghị..."
                            required
                        />
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6 flex justify-end">
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSubmitting}
                            className="gap-2 px-6"
                        >
                            <Send className="w-4 h-4" />
                            <span>Lưu điểm đánh giá GVHD</span>
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
