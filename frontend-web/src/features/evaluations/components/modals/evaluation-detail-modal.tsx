'use client';

import React from 'react';
import Link from 'next/link';
import { FacultyEvaluationSummary } from '../../types/evaluation.types';
import { Button } from '@/components/ui/button';
import {
    X,
    Building2,
    GraduationCap,
    Award,
    FileText,
    CheckCircle2,
    AlertCircle,
    UserCheck,
    MessageSquareQuote,
    ExternalLink,
    Send,
} from 'lucide-react';

interface EvaluationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: FacultyEvaluationSummary | null;
    onPublishSingle?: (placementId: string) => Promise<void>;
    isPublishing?: boolean;
}

export function EvaluationDetailModal({
    isOpen,
    onClose,
    data,
    onPublishSingle,
    isPublishing = false,
}: EvaluationDetailModalProps) {
    if (!isOpen || !data) return null;

    const isPassed = data.resultStatus === 'PASSED';

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Modal Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-900 text-white flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold">{data.studentName}</h2>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                                {data.studentCode || 'N/A'}
                            </span>
                        </div>
                        <p className="text-xs text-indigo-200 mt-0.5">
                            {data.classCode ? `Lớp: ${data.classCode} • ` : ''}
                            {data.programName || 'Chương trình đào tạo'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                    {/* Overview CTU Grade Banner */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-xs ${
                                    isPassed
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                }`}
                            >
                                {data.letterGrade || (data.finalScore != null ? data.finalScore.toFixed(1) : '-')}
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Kết quả tổng kết
                                </div>
                                <div className="text-base font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                                    <span>{data.classification || 'Đang cập nhật'}</span>
                                    <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            isPassed
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                                        }`}
                                    >
                                        {isPassed ? (
                                            <>
                                                <CheckCircle2 className="w-3 h-3" /> ĐẠT
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-3 h-3" /> CHƯA ĐẠT
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Score breakdown metrics */}
                        <div className="flex items-center gap-4 text-right">
                            <div>
                                <div className="text-xs text-slate-400">Điểm hệ 10</div>
                                <div className="text-lg font-bold text-slate-900">
                                    {data.finalScore != null ? data.finalScore.toFixed(1) : 'Chưa có'}
                                </div>
                            </div>
                            <div className="h-8 w-px bg-slate-200" />
                            <div>
                                <div className="text-xs text-slate-400">Điểm hệ 4</div>
                                <div className="text-lg font-bold text-indigo-700">
                                    {data.scoreScale4 != null ? data.scoreScale4.toFixed(1) : 'Chưa có'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Unit & Parties Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                Doanh nghiệp tiếp nhận
                            </div>
                            <div className="font-semibold text-slate-900">
                                {data.companyName || 'Doanh nghiệp tự liên hệ'}
                            </div>
                            <div className="text-xs text-slate-500">
                                Mentor: <span className="text-slate-800 font-medium">{data.mentorName || 'Chưa gán'}</span>
                                {data.mentorEmail ? ` (${data.mentorEmail})` : ''}
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                                Giảng viên phụ trách (Khoa)
                            </div>
                            <div className="font-semibold text-slate-900">
                                {data.lecturerName || 'Chưa phân công'}
                            </div>
                            <div className="text-xs text-slate-500">
                                Email: <span className="text-slate-800 font-medium">{data.lecturerEmail || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Detail Evaluations */}
                    <div className="space-y-3">
                        {/* 1. Mentor Assessment */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                                    <UserCheck className="w-4 h-4 text-emerald-600" />
                                    <span>Đánh giá từ Doanh nghiệp (Phiếu M-TT-04)</span>
                                </div>
                                <div className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {data.mentorScore != null ? `Điểm: ${data.mentorScore.toFixed(1)} / 10` : 'Chưa chấm'}
                                </div>
                            </div>
                            {data.mentorFeedback ? (
                                <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-700 flex items-start gap-2 italic">
                                    <MessageSquareQuote className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <span>&ldquo;{data.mentorFeedback}&rdquo;</span>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">Chưa có nhận xét định tính từ doanh nghiệp</p>
                            )}
                        </div>

                        {/* 2. Lecturer Assessment */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                                    <Award className="w-4 h-4 text-indigo-600" />
                                    <span>Đánh giá từ Giảng viên hướng dẫn (Phiếu M-TT-05)</span>
                                </div>
                                <div className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    {data.lecturerScore != null ? `Điểm: ${data.lecturerScore.toFixed(1)} / 10` : 'Chưa chấm'}
                                </div>
                            </div>
                            {data.lecturerFeedback ? (
                                <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-700 flex items-start gap-2 italic">
                                    <MessageSquareQuote className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                    <span>&ldquo;{data.lecturerFeedback}&rdquo;</span>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">Chưa có nhận xét từ giảng viên hướng dẫn</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                        href={`/faculty/internship-record?placementId=${data.placementId}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 hover:text-indigo-900 hover:underline"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Xem hồ sơ biểu mẫu (M01-M05)</span>
                        <ExternalLink className="w-3 h-3" />
                    </Link>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={onClose}>
                            Đóng
                        </Button>
                        {!data.isPublished && onPublishSingle && (
                            <Button
                                size="sm"
                                disabled={isPublishing || data.finalScore == null}
                                onClick={() => onPublishSingle(data.placementId)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isPublishing ? 'Đang công bố...' : 'Công bố kết quả'}</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
