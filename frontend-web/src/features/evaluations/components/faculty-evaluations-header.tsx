'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, FileSpreadsheet, Send } from 'lucide-react';

interface FacultyEvaluationsHeaderProps {
    filteredCount: number;
    draftCount: number;
    isLoadingData: boolean;
    onExportExcel: () => void;
    onOpenBatchPublish: () => void;
}

export function FacultyEvaluationsHeader({
    filteredCount,
    draftCount,
    isLoadingData,
    onExportExcel,
    onOpenBatchPublish,
}: FacultyEvaluationsHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Quản Lý Đánh Giá & Bảng Điểm Thực Tập</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Truy xuất, lọc đánh giá từ giảng viên & doanh nghiệp, tổng hợp và xuất báo cáo kết quả thực tập
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
                <Button
                    onClick={onExportExcel}
                    disabled={isLoadingData || filteredCount === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs gap-1.5 shadow-xs"
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Xuất Excel bảng điểm ({filteredCount})</span>
                </Button>

                <Button
                    onClick={onOpenBatchPublish}
                    disabled={isLoadingData || draftCount === 0}
                    variant="outline"
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium text-xs gap-1.5"
                >
                    <Send className="w-3.5 h-3.5" />
                    <span>Công bố điểm hàng loạt</span>
                </Button>
            </div>
        </div>
    );
}
