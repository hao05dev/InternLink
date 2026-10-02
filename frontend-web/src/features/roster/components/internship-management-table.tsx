'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
    RefreshCw,
    Building2,
    CheckCircle2,
    Clock,
    UserCheck,
    FileText,
    Hash,
    Stamp,
} from 'lucide-react';
import { InternStudentRow, InternshipFilterStatus } from '../types/internship-management.types';

interface InternshipManagementTableProps {
    isLoading: boolean;
    rows: InternStudentRow[];
    filteredRows: InternStudentRow[];
    searchTerm: string;
    statusFilter: InternshipFilterStatus;
    isTermClosed?: boolean;
    onToggleLetterReceived: (rosterId: string) => void;
    onOpenConfirmModal: (row: InternStudentRow) => void;
}

export function InternshipManagementTable({
    isLoading,
    rows,
    filteredRows,
    searchTerm,
    statusFilter,
    isTermClosed = false,
    onToggleLetterReceived,
    onOpenConfirmModal,
}: InternshipManagementTableProps) {
    const getProgressStatus = (row: InternStudentRow) => {
        if (row.foundApp?.placementId) return { label: 'Đang thực tập', variant: 'success' as const, step: 4 };
        if (row.companyAccepted) return { label: 'Công ty chấp nhận', variant: 'brand' as const, step: 3 };
        if (row.letterReceived) return { label: 'Đã nhận giấy', variant: 'warning' as const, step: 2 };
        if (row.roster.claimedUserId) return { label: 'Chờ nhận giấy', variant: 'secondary' as const, step: 1 };
        return { label: 'Chưa kích hoạt TK', variant: 'outline' as const, step: 0 };
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-sky-500 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
                </CardContent>
            </Card>
        );
    }

    if (filteredRows.length === 0) {
        return (
            <EmptyState
                title="Không có sinh viên nào"
                description={
                    searchTerm || statusFilter !== 'all'
                        ? 'Không tìm thấy sinh viên phù hợp với bộ lọc hiện tại.'
                        : "Kỳ thực tập này chưa có sinh viên. Hãy import danh sách ở trang 'Roster sinh viên'."
                }
            />
        );
    }

    return (
        <Card>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                        <tr>
                            <th className="px-4 py-3">STT</th>
                            <th className="px-4 py-3">Sinh viên</th>
                            <th className="px-4 py-3">Lớp / MSSV</th>
                            <th className="px-4 py-3">Tiến trình</th>
                            <th className="px-4 py-3">Công ty thực tập</th>
                            <th className="px-4 py-3 text-center">Nhận giấy GT</th>
                            <th className="px-4 py-3 text-center">Công ty chấp nhận</th>
                            <th className="px-4 py-3 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                        {filteredRows.map((row, idx) => {
                            const progress = getProgressStatus(row);
                            const hasFoundApp = !!row.foundApp;
                            const canConfirmAccept = hasFoundApp && row.foundApp!.status === 'SUBMITTED';

                            return (
                                <tr key={row.roster.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900">{row.roster.fullName}</div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">{row.roster.officialEmail}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {row.roster.classCode && (
                                            <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-semibold text-[11px] mb-1">
                                                <Hash className="w-2.5 h-2.5" />
                                                {row.roster.classCode}
                                            </div>
                                        )}
                                        <div className="text-sky-700 font-bold">{row.roster.studentCode}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={progress.variant} className="text-[10px] whitespace-nowrap">
                                            {progress.label}
                                        </Badge>
                                        <div className="flex gap-1 mt-1.5">
                                            {[1, 2, 3, 4].map((step) => (
                                                <div
                                                    key={step}
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        step <= progress.step ? 'bg-sky-500' : 'bg-slate-200'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {row.foundApp ? (
                                            <div>
                                                <div className="font-semibold text-slate-900 flex items-center gap-1">
                                                    <Building2 className="w-3 h-3 text-slate-400" />
                                                    {row.foundApp.hostName}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[160px]">
                                                    {row.foundApp.hostAddress}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 italic text-[11px]">Chưa có thông tin</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => onToggleLetterReceived(row.roster.id)}
                                            disabled={isTermClosed || !row.roster.claimedUserId}
                                            title={
                                                isTermClosed
                                                    ? 'Học kỳ đã đóng (CLOSED)'
                                                    : !row.roster.claimedUserId
                                                    ? 'Sinh viên chưa kích hoạt tài khoản'
                                                    : row.letterReceived
                                                    ? 'Bỏ đánh dấu nhận giấy'
                                                    : 'Đánh dấu đã nhận giấy'
                                            }
                                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition ${
                                                isTermClosed || !row.roster.claimedUserId
                                                    ? 'opacity-30 cursor-not-allowed'
                                                    : row.letterReceived
                                                    ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 cursor-pointer'
                                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200 cursor-pointer'
                                            }`}
                                        >
                                            {row.letterReceived ? <CheckCircle2 className="w-4 h-4" /> : <Stamp className="w-4 h-4" />}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {row.companyAccepted ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 text-[11px]">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Đã xác nhận
                                            </span>
                                        ) : hasFoundApp && row.foundApp!.status === 'SUBMITTED' ? (
                                            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-full border border-amber-200 text-[11px]">
                                                <Clock className="w-3 h-3" />
                                                Chờ xét duyệt
                                            </span>
                                        ) : hasFoundApp && row.foundApp!.status === 'DRAFT' ? (
                                            <span className="text-slate-400 italic text-[11px]">SV chưa nộp</span>
                                        ) : (
                                            <span className="text-slate-300 text-[11px]">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {canConfirmAccept ? (
                                            <Button
                                                variant="primary"
                                                onClick={() => onOpenConfirmModal(row)}
                                                disabled={isTermClosed}
                                                title={isTermClosed ? 'Học kỳ đã đóng (CLOSED)' : undefined}
                                                className={`text-[11px] px-3 py-1.5 h-auto gap-1 ${
                                                    isTermClosed ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                <UserCheck className="w-3 h-3" />
                                                Xác nhận
                                            </Button>
                                        ) : row.companyAccepted ? (
                                            <Button
                                                variant="secondary"
                                                onClick={() => onOpenConfirmModal(row)}
                                                className="text-[11px] px-3 py-1.5 h-auto gap-1 opacity-60"
                                                disabled
                                            >
                                                <FileText className="w-3 h-3" />
                                                Xem chi tiết
                                            </Button>
                                        ) : (
                                            <span className="text-slate-300 text-[11px]">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500 text-right">
                Hiển thị {filteredRows.length} / {rows.length} sinh viên
            </div>
        </Card>
    );
}
