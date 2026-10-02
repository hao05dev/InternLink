'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FacultyEvaluationSummary } from '../types/evaluation.types';
import {
    AlertCircle,
    Check,
    X,
    Clock,
    Eye,
    Sparkles,
    Send,
    ExternalLink,
} from 'lucide-react';

interface FacultyEvaluationsTableProps {
    rows: FacultyEvaluationSummary[];
    isLoading: boolean;
    hasActiveFilters: boolean;
    isProcessing: boolean;
    onOpenDetail: (item: FacultyEvaluationSummary) => void;
    onQuickFinalize: (placementId: string) => Promise<void>;
    onPublishSingle: (placementId: string) => Promise<void>;
}

export function FacultyEvaluationsTable({
    rows,
    isLoading,
    hasActiveFilters,
    isProcessing,
    onOpenDetail,
    onQuickFinalize,
    onPublishSingle,
}: FacultyEvaluationsTableProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">
                        Danh sách kết quả đánh giá ({rows.length} sinh viên)
                    </span>
                    {hasActiveFilters && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                            Đang áp dụng bộ lọc
                        </span>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                            <th className="p-3 text-center w-12">STT</th>
                            <th className="p-3">Sinh viên</th>
                            <th className="p-3">Doanh nghiệp & Mentor</th>
                            <th className="p-3">Giảng viên hướng dẫn</th>
                            <th className="p-3 text-center">Điểm DN</th>
                            <th className="p-3 text-center">Điểm GV</th>
                            <th className="p-3 text-center">Điểm Hệ 10</th>
                            <th className="p-3 text-center">Điểm Chữ (Hệ 4)</th>
                            <th className="p-3 text-center">Kết quả</th>
                            <th className="p-3 text-center">Công bố</th>
                            <th className="p-3 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={11} className="p-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                        <span>Đang tải dữ liệu đánh giá và bảng điểm...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={11} className="p-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <AlertCircle className="w-8 h-8 text-slate-300" />
                                        <p className="font-semibold text-slate-600">Không tìm thấy dữ liệu phù hợp</p>
                                        <p className="text-xs text-slate-400">
                                            Vui lòng thay đổi từ khóa tìm kiếm hoặc điều chỉnh các tiêu chí bộ lọc.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            rows.map((item, idx) => {
                                const isPassed = item.resultStatus === 'PASSED';
                                const isFailed = item.resultStatus === 'FAILED';

                                return (
                                    <tr key={item.placementId} className="hover:bg-slate-50/80 transition-colors">
                                        {/* STT */}
                                        <td className="p-3 text-center text-slate-400 font-medium">{idx + 1}</td>

                                        {/* Sinh viên */}
                                        <td className="p-3">
                                            <div className="font-bold text-slate-900">{item.studentName}</div>
                                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                <span className="font-semibold text-slate-700">{item.studentCode || 'N/A'}</span>
                                                {item.classCode && <span>• {item.classCode}</span>}
                                            </div>
                                            {item.programName && (
                                                <div className="text-[10.5px] text-indigo-600 truncate max-w-[180px]">
                                                    {item.programName}
                                                </div>
                                            )}
                                        </td>

                                        {/* Doanh nghiệp & Mentor */}
                                        <td className="p-3">
                                            <div className="font-medium text-slate-800 line-clamp-1 max-w-[180px]">
                                                {item.companyName || 'Doanh nghiệp tự liên hệ'}
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">
                                                Mentor: <span className="text-slate-700">{item.mentorName || 'Chưa gán'}</span>
                                            </div>
                                        </td>

                                        {/* Giảng viên hướng dẫn */}
                                        <td className="p-3">
                                            <div className="font-semibold text-slate-800">
                                                {item.lecturerName || 'Chưa phân công'}
                                            </div>
                                            {item.lecturerFeedback && (
                                                <div className="text-[10.5px] text-slate-500 italic line-clamp-1 max-w-[180px] mt-0.5">
                                                    &ldquo;{item.lecturerFeedback}&rdquo;
                                                </div>
                                            )}
                                        </td>

                                        {/* Điểm DN */}
                                        <td className="p-3 text-center">
                                            {item.mentorScore != null ? (
                                                <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    {item.mentorScore.toFixed(1)}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>

                                        {/* Điểm GV */}
                                        <td className="p-3 text-center">
                                            {item.lecturerScore != null ? (
                                                <span className="px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                    {item.lecturerScore.toFixed(1)}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>

                                        {/* Điểm Hệ 10 */}
                                        <td className="p-3 text-center">
                                            {item.finalScore != null ? (
                                                <span className="font-black text-slate-900 text-sm">
                                                    {item.finalScore.toFixed(1)}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic text-[11px]">Chưa tổng hợp</span>
                                            )}
                                        </td>

                                        {/* Điểm Chữ & Hệ 4 */}
                                        <td className="p-3 text-center">
                                            {item.letterGrade ? (
                                                <div className="inline-flex items-center gap-1">
                                                    <span className="px-2 py-0.5 rounded-md font-black bg-slate-900 text-white text-xs">
                                                        {item.letterGrade}
                                                    </span>
                                                    <span className="text-slate-500 font-medium text-[11px]">
                                                        ({item.scoreScale4 != null ? item.scoreScale4.toFixed(1) : ''})
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>

                                        {/* Kết quả */}
                                        <td className="p-3 text-center">
                                            {isPassed ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <Check className="w-3 h-3" /> ĐẠT
                                                </span>
                                            ) : isFailed ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                    <X className="w-3 h-3" /> CHƯA ĐẠT
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                                                    <Clock className="w-3 h-3" /> Chờ xét
                                                </span>
                                            )}
                                        </td>

                                        {/* Trạng thái công bố */}
                                        <td className="p-3 text-center">
                                            {item.isPublished ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                    Đã công bố
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                                    Bản nháp
                                                </span>
                                            )}
                                        </td>

                                        {/* Thao tác */}
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onOpenDetail(item)}
                                                    title="Xem chi tiết đánh giá"
                                                    className="h-7 w-7 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Button>

                                                {!item.isFinalized && item.finalScore != null && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onQuickFinalize(item.placementId)}
                                                        title="Tổng hợp điểm nhanh"
                                                        disabled={isProcessing}
                                                        className="h-7 w-7 p-0 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                                                    >
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}

                                                {!item.isPublished && item.finalScore != null && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onPublishSingle(item.placementId)}
                                                        title="Công bố điểm cho sinh viên"
                                                        disabled={isProcessing}
                                                        className="h-7 w-7 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Send className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}

                                                <Link
                                                    href={`/faculty/internship-record?placementId=${item.placementId}`}
                                                    title="Mở hồ sơ biểu mẫu sinh viên"
                                                    className="h-7 w-7 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
