'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import {
    Award,
    FileText,
    Upload,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    BarChart3,
    UserCheck,
    GraduationCap,
    HelpCircle
} from 'lucide-react';
import type { FinalResult } from '@/features/evaluations/types/evaluation.types';
import type { InternshipPlacement } from '@/features/placements/types/placement.types';

interface ReportSubmission {
    id: string;
    documentId: string;
    fileName: string;
    fileSize: string;
    submittedAt: string;
    status: 'SUBMITTED' | 'APPROVED' | 'NEEDS_REVISION';
    feedback?: string;
}

export default function StudentFinalReportView() {
    const [isLoading, setIsLoading] = useState(true);
    const [placement, setPlacement] = useState<InternshipPlacement | null>(null);
    const [report, setReport] = useState<ReportSubmission | null>(null);
    const [result, setResult] = useState<FinalResult | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        async function fetchReportAndResult() {
            try {
                const plcRes = await apiClient.get<InternshipPlacement[]>('/api/v1/placements/my-placement');
                if (plcRes.data && Array.isArray(plcRes.data) && plcRes.data.length > 0) {
                    const activePlc = plcRes.data[0];
                    setPlacement(activePlc);

                    try {
                        const repRes = await apiClient.get<any[]>(`/api/v1/internship-reports/placement/${activePlc.id}`);
                        if (repRes.data && Array.isArray(repRes.data) && repRes.data.length > 0) {
                            const latestRep = repRes.data[0];
                            setReport({
                                id: latestRep.id,
                                documentId: latestRep.documentId,
                                fileName: latestRep.fileName || 'BaoCaoThucTap.pdf',
                                fileSize: latestRep.fileSize || 'PDF',
                                submittedAt: latestRep.submittedAt || latestRep.createdAt || new Date().toISOString(),
                                status: latestRep.status || 'SUBMITTED',
                                feedback: latestRep.lecturerFeedback || latestRep.feedback,
                            });
                        }
                    } catch {
                        // No reports yet
                    }

                    try {
                        const resRes = await apiClient.get<FinalResult>(`/api/v1/final-results/placement/${activePlc.id}`);
                        if (resRes.data) {
                            setResult(resRes.data);
                        }
                    } catch {
                        // Results not published yet
                    }
                }
            } catch {
                // Not in placement
            } finally {
                setIsLoading(false);
            }
        }

        fetchReportAndResult();
    }, []);

    const handleUploadReport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!placement?.id) {
            setMessage({ type: 'error', text: 'Bạn chưa có đợt thực tập đang hoạt động để nộp báo cáo.' });
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const docRes = await apiClient.post<any>(
                `/api/v1/documents/upload?contextType=PLACEMENT&contextId=${placement.id}&docType=FINAL_REPORT`,
                formData
            );
            const docId = docRes.data?.id;

            const repRes = await apiClient.post<any>(
                `/api/v1/internship-reports/placement/${placement.id}?type=FINAL_REPORT&documentId=${docId}`
            );

            setReport({
                id: repRes.data?.id || `rep-${Date.now()}`,
                documentId: docId,
                fileName: file.name,
                fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                submittedAt: new Date().toISOString(),
                status: 'SUBMITTED',
            });
            setMessage({ type: 'success', text: `Tải lên báo cáo "${file.name}" thành công!` });
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi nộp báo cáo thực tập.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsUploading(false);
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

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Báo Cáo Tổng Kết & Kết Quả Đánh Giá
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Nộp báo cáo thực tập cuối kỳ và xem kết quả đánh giá năng lực từ Doanh nghiệp và Khoa CNTT&TT.
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

            {/* Report Submission Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle>Báo cáo thực tập cuối kỳ (PDF)</CardTitle>
                            <CardDescription>
                                Định dạng theo mẫu hướng dẫn của Trường CNTT&TT - ĐH Cần Thơ, kích thước tối đa 25MB
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {report ? (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{report.fileName}</p>
                                        <p className="text-xs text-slate-500">
                                            Kích thước: {report.fileSize} • Nộp ngày: {new Date(report.submittedAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        report.status === 'APPROVED'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : report.status === 'NEEDS_REVISION'
                                            ? 'bg-rose-100 text-rose-800'
                                            : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {report.status === 'APPROVED' ? 'Đã duyệt' : report.status === 'NEEDS_REVISION' ? 'Cần chỉnh sửa' : 'Đã nộp'}
                                    </span>
                                </div>
                            </div>

                            {report.feedback && (
                                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700">
                                    <strong>Nhận xét từ GVHD:</strong> {report.feedback}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                            <p className="text-sm font-semibold text-slate-800">Chưa nộp báo cáo thực tập</p>
                            <p className="text-xs text-slate-500 mt-1">Vui lòng tải lên tệp báo cáo PDF trước thời hạn quy định.</p>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm ${
                            isUploading ? 'opacity-50 pointer-events-none' : ''
                        }`}>
                            <Upload className="w-4 h-4" />
                            <span>{report ? 'Nộp lại báo cáo mới' : 'Tải lên báo cáo'}</span>
                            <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleUploadReport}
                                disabled={isUploading}
                            />
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Final Evaluation Results Section */}
            {result && result.published ? (
                <Card className="border-2 border-blue-100 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Award className="w-8 h-8 text-amber-300" />
                                <div>
                                    <CardTitle className="text-white text-lg">Bảng Điểm Tổng Kết Thực Tập</CardTitle>
                                    <CardDescription className="text-blue-200">
                                        Đã được Hội đồng đánh giá Khoa CNTT&TT phê duyệt và công bố
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={result.resultStatus} type="result" />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                        {/* Grades Banner */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                                <p className="text-xs font-semibold text-slate-500 uppercase">Thang điểm 10</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">{result.finalScoreScale10?.toFixed(2)}</p>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                                <p className="text-xs font-semibold text-slate-500 uppercase">Thang điểm 4</p>
                                <p className="text-2xl font-black text-blue-700 mt-1">{result.finalScoreScale4?.toFixed(2)}</p>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                                <p className="text-xs font-semibold text-slate-500 uppercase">Điểm chữ</p>
                                <p className="text-2xl font-black text-emerald-700 mt-1">{result.gradeLetter}</p>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                                <p className="text-xs font-semibold text-slate-500 uppercase">Xếp loại</p>
                                <p className="text-lg font-bold text-slate-800 mt-2">
                                    {result.resultStatus === 'PASSED' ? 'Đạt yêu cầu' : 'Không đạt'}
                                </p>
                            </div>
                        </div>

                        {/* Breakdown Scores */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                                        <UserCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Điểm Đánh Giá Doanh Nghiệp (Mentor)</p>
                                        <p className="text-xs text-slate-500">Trọng số: 40%</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-slate-900">{result.mentorScore?.toFixed(1)} / 10</span>
                            </div>

                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Điểm Đánh Giá Giảng Viên (GVHD)</p>
                                        <p className="text-xs text-slate-500">Trọng số: 60%</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-slate-900">{result.lecturerScore?.toFixed(1)} / 10</span>
                            </div>
                        </div>

                        {/* CLO Assessment Progress */}
                        {result.cloAssessments && result.cloAssessments.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-blue-600" />
                                    Mức độ Đạt Chuẩn Đầu Ra (Course Learning Outcomes - CLO)
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {result.cloAssessments.map((clo) => {
                                        const pct = Math.round((clo.score / clo.maxScore) * 100);
                                        return (
                                            <div key={clo.cloCode} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                                <div className="flex justify-between text-xs font-semibold">
                                                    <span className="text-blue-900">{clo.cloCode}: {clo.description}</span>
                                                    <span className="text-slate-700">{clo.score}/{clo.maxScore} ({pct}%)</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Comments */}
                        {result.comments && (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                                <h4 className="text-xs font-bold text-slate-500 uppercase">Nhận xét của Hội đồng chấm thi:</h4>
                                <p className="text-sm text-slate-700 leading-relaxed">{result.comments}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-8 text-center space-y-3">
                        <Clock className="w-12 h-12 text-amber-500 mx-auto" />
                        <h3 className="text-base font-bold text-slate-900">Điểm tổng kết đang được tổng hợp</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            Hội đồng Khoa đang rà soát điểm đánh giá từ Cán bộ hướng dẫn Doanh nghiệp và Giảng viên hướng dẫn. Kết quả chính thức sẽ được công bố ngay khi hoàn tất.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
