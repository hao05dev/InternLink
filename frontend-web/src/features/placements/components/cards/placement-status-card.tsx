'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Building2,
    Clock,
    UserCheck,
    XCircle,
    RefreshCw,
    AlertCircle,
    FileText
} from 'lucide-react';
import { InternshipPlacement } from '../../types/placement.types';

interface PlacementStatusCardProps {
    placement: InternshipPlacement;
    onOpenTransferModal: () => void;
}

export function PlacementStatusCard({ placement, onOpenTransferModal }: PlacementStatusCardProps) {
    return (
        <Card className="border-slate-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-sky-600" />
                            <span>Trạng thái Tiếp nhận: {placement.companyName}</span>
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                            Vị trí: <strong>{placement.jobTitle}</strong> • Mã đơn: {placement.id}
                        </CardDescription>
                    </div>
                    <div>
                        {placement.status === 'PENDING_APPROVAL' && (
                            <Badge variant="warning" className="gap-1">
                                <Clock className="w-3 h-3" /> Đang chờ Khoa duyệt
                            </Badge>
                        )}
                        {(placement.status === 'APPROVED' || placement.status === 'ACTIVE' || placement.status === 'IN_PROGRESS') && (
                            <Badge variant="success" className="gap-1">
                                <UserCheck className="w-3 h-3" /> Đã duyệt chính thức
                            </Badge>
                        )}
                        {placement.status === 'REJECTED' && (
                            <Badge variant="destructive" className="gap-1">
                                <XCircle className="w-3 h-3" /> Đã bị từ chối
                            </Badge>
                        )}
                        {placement.status === 'TRANSFER_REQUESTED' && (
                            <Badge variant="warning" className="gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Đang xin đổi đơn vị
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
                {placement.status === 'REJECTED' && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Lý do Khoa từ chối phiếu đăng ký:</span>
                        </div>
                        <p className="whitespace-pre-line pl-6 font-medium text-rose-950">
                            {placement.rejectionReason || 'Thông tin công ty hoặc vị trí công việc chưa đạt chuẩn yêu cầu đào tạo.'}
                        </p>
                        <p className="pl-6 text-[11px] text-rose-700 font-semibold pt-1">
                            👉 Hãy chỉnh sửa lại thông tin ở biểu mẫu bên dưới và bấm &quot;Cập nhật &amp; Nộp lại&quot;.
                        </p>
                    </div>
                )}

                {(placement.status === 'APPROVED' || placement.status === 'ACTIVE' || placement.status === 'IN_PROGRESS') && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                            <div>
                                <span className="text-slate-400 block font-medium">Doanh nghiệp:</span>
                                <p className="font-semibold text-slate-900">{placement.companyName}</p>
                                <p className="text-slate-500">{placement.companyAddress}</p>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Người hướng dẫn (Mentor):</span>
                                <p className="font-semibold text-slate-900">{placement.mentorName}</p>
                                <p className="text-slate-500">{placement.mentorEmail} • {placement.mentorPhone}</p>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Thời gian thực tập:</span>
                                <p className="font-semibold text-slate-900">
                                    {placement.startDate?.split('T')[0]} đến {placement.endDate?.split('T')[0]}
                                </p>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Giấy tiếp nhận:</span>
                                {placement.acceptanceLetterUrl ? (
                                    <a
                                        href={placement.acceptanceLetterUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sky-600 hover:underline flex items-center gap-1 font-semibold"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>Xem file đính kèm</span>
                                    </a>
                                ) : (
                                    <span className="text-slate-400 italic">Chưa đính kèm file</span>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onOpenTransferModal}
                                className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                            >
                                Xin chuyển đổi đơn vị thực tập khác
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
