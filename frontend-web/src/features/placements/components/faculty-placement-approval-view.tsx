'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { RejectPlacementModal } from './modals/reject-placement-modal';
import {
    CheckCircle2,
    XCircle,
    Building2,
    FileText,
    ExternalLink,
    AlertCircle,
    RefreshCw,
    Search,
    UserCheck,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { InternshipPlacement } from '../types/placement.types';

export function FacultyPlacementApprovalView() {
    const [placements, setPlacements] = useState<InternshipPlacement[]>([]);
    const [terms, setTerms] = useState<any[]>([]);
    const [selectedTermId, setSelectedTermId] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'TRANSFER_REQUESTED' | 'APPROVED' | 'REJECTED'>('PENDING_APPROVAL');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [placementToReject, setPlacementToReject] = useState<InternshipPlacement | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const termsRes = await apiClient.get<any[]>('/api/v1/terms/by-department/current');
                if (termsRes.data && Array.isArray(termsRes.data) && termsRes.data.length > 0) {
                    setTerms(termsRes.data);
                    setSelectedTermId(termsRes.data[0].id);
                }
            } catch {
                // Fallback empty
            }
        }
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!selectedTermId) {
            setIsLoading(false);
            return;
        }

        async function fetchPlacements() {
            setIsLoading(true);
            try {
                const res = await apiClient.get<InternshipPlacement[]>(`/api/v1/placements/by-term/${selectedTermId}`);
                if (res.data && Array.isArray(res.data)) {
                    setPlacements(res.data);
                } else {
                    setPlacements([]);
                }
            } catch {
                setPlacements([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchPlacements();
    }, [selectedTermId]);

    const handleApprovePlacement = async (placementId: string) => {
        setActionLoadingId(placementId);
        try {
            await apiClient.patch(`/api/v1/placements/${placementId}/approve`);
            setPlacements((prev) =>
                prev.map((p) => (p.id === placementId ? { ...p, status: 'APPROVED' } : p))
            );
            setMessage({
                type: 'success',
                text: 'Đã phê duyệt đơn tiếp nhận thực tập và kích hoạt tài khoản Mentor thành công!',
            });
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : 'Phê duyệt thất bại.';
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleApproveTransfer = async (placementId: string) => {
        setActionLoadingId(placementId);
        try {
            await apiClient.patch(`/api/v1/placements/${placementId}/approve-transfer`);
            setPlacements((prev) =>
                prev.map((p) => (p.id === placementId ? { ...p, status: 'TRANSFERRED' } : p))
            );
            setMessage({
                type: 'success',
                text: 'Đã duyệt yêu cầu chuyển đổi đơn vị thực tập của sinh viên thành công!',
            });
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : 'Duyệt chuyển đổi thất bại.';
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleRejectConfirm = async (placementId: string, reason: string) => {
        setActionLoadingId(placementId);
        try {
            await apiClient.patch(`/api/v1/placements/${placementId}/reject`, { reason });
            setPlacements((prev) =>
                prev.map((p) =>
                    p.id === placementId ? { ...p, status: 'REJECTED', rejectionReason: reason } : p
                )
            );
            setMessage({
                type: 'success',
                text: 'Đã từ chối đơn đăng ký và gửi email phản hồi lý do đến sinh viên.',
            });
            setPlacementToReject(null);
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : 'Từ chối thất bại.';
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setActionLoadingId(null);
        }
    };

    // Filtered list
    const filteredPlacements = placements.filter((p) => {
        const matchesStatus =
            statusFilter === 'ALL' ? true : p.status === statusFilter;
        const matchesSearch =
            !searchKeyword ||
            p.studentName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            p.studentCode?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            p.companyName?.toLowerCase().includes(searchKeyword.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Xét Duyệt Đơn Vị Thực Tập (Tự Liên Hệ & Chuyển Đổi)
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Thẩm định tính phù hợp chuyên ngành, kiểm tra pháp lý doanh nghiệp và duyệt phân công thực tập.
                    </p>
                </div>
            </div>

            {/* Notification */}
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
                        {message.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                        )}
                        <span>{message.text}</span>
                    </div>
                    <button
                        onClick={() => setMessage(null)}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Toolbar Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {terms.length > 0 && (
                        <div className="w-56">
                            <Select
                                label=""
                                id="termSelectFilter"
                                value={selectedTermId}
                                onChange={(e) => setSelectedTermId(e.target.value)}
                                options={terms.map((t) => ({
                                    value: t.id,
                                    label: `${t.code} (${t.termName})`,
                                }))}
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('PENDING_APPROVAL')}
                            className={`px-3 py-1.5 rounded-full transition ${
                                statusFilter === 'PENDING_APPROVAL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                            }`}
                        >
                            Chờ duyệt
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('TRANSFER_REQUESTED')}
                            className={`px-3 py-1.5 rounded-full transition ${
                                statusFilter === 'TRANSFER_REQUESTED' ? 'bg-white text-amber-800 shadow-2xs' : 'hover:text-slate-900'
                            }`}
                        >
                            Xin đổi cty
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('APPROVED')}
                            className={`px-3 py-1.5 rounded-full transition ${
                                statusFilter === 'APPROVED' ? 'bg-white text-emerald-800 shadow-2xs' : 'hover:text-slate-900'
                            }`}
                        >
                            Đã duyệt
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('ALL')}
                            className={`px-3 py-1.5 rounded-full transition ${
                                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                            }`}
                        >
                            Tất cả
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="Tìm theo SV, MSSV, Công ty..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                </div>
            </div>

            {/* Content List */}
            {isLoading ? (
                <div className="p-12 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Đang tải danh sách đơn tiếp nhận...</p>
                </div>
            ) : filteredPlacements.length === 0 ? (
                <EmptyState
                    title="Không có đơn đăng ký nào"
                    description="Hiện không có đơn đăng ký chỗ thực tập nào phù hợp với bộ lọc hiện tại."
                />
            ) : (
                <div className="space-y-4">
                    {filteredPlacements.map((p) => (
                        <Card key={p.id} className="border-slate-200/80 shadow-xs hover:border-slate-300 transition">
                            <CardContent className="p-5">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                                    {/* Left: Student & Company Info */}
                                    <div className="space-y-3 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <span className="font-bold text-base text-slate-900">{p.studentName}</span>
                                            <Badge variant="brand" className="font-mono text-xs">{p.studentCode}</Badge>
                                            
                                            {p.status === 'PENDING_APPROVAL' && (
                                                <Badge variant="warning" className="gap-1">
                                                    <Clock className="w-3 h-3" /> Chờ xét duyệt
                                                </Badge>
                                            )}
                                            {p.status === 'TRANSFER_REQUESTED' && (
                                                <Badge variant="warning" className="gap-1 text-amber-800 bg-amber-50 border-amber-200">
                                                    <RefreshCw className="w-3 h-3 animate-spin" /> Xin đổi đơn vị
                                                </Badge>
                                            )}
                                            {p.status === 'APPROVED' && (
                                                <Badge variant="success" className="gap-1">
                                                    <UserCheck className="w-3 h-3" /> Đã duyệt
                                                </Badge>
                                            )}
                                            {p.status === 'REJECTED' && (
                                                <Badge variant="destructive" className="gap-1">
                                                    <XCircle className="w-3 h-3" /> Đã từ chối
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Transfer Alert if applicable */}
                                        {p.status === 'TRANSFER_REQUESTED' && p.transferReason && (
                                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                                                <div className="flex items-center gap-1.5 font-bold">
                                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                                    <span>Lý do xin chuyển đơn vị thực tập:</span>
                                                </div>
                                                <p className="pl-5 font-medium">{p.transferReason}</p>
                                                {p.previousCompanyName && (
                                                    <p className="pl-5 text-[11px] text-amber-700">
                                                        Đơn vị cũ: <strong>{p.previousCompanyName}</strong>
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
                                            <div>
                                                <span className="text-slate-400 block font-medium">Doanh nghiệp tiếp nhận:</span>
                                                <p className="font-semibold text-slate-900 text-[13px]">{p.companyName}</p>
                                                <p className="text-slate-500 mt-0.5">{p.companyAddress}</p>
                                                {p.companyTaxCode && (
                                                    <p className="text-[11px] text-slate-600 mt-0.5">
                                                        MST: <span className="font-mono font-medium">{p.companyTaxCode}</span>
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <span className="text-slate-400 block font-medium">Mentor Doanh nghiệp:</span>
                                                <p className="font-semibold text-slate-900">{p.mentorName}</p>
                                                <p className="text-slate-600">{p.mentorEmail}</p>
                                                <p className="text-slate-500">{p.mentorPhone}</p>
                                            </div>

                                            <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                                                <span className="text-slate-400 block font-medium">Vị trí & Mô tả công việc:</span>
                                                <p className="font-semibold text-slate-900">{p.jobTitle}</p>
                                                <p className="text-slate-600 mt-0.5 line-clamp-2">{p.jobDescription}</p>
                                            </div>
                                        </div>

                                        {/* Rejection Note if Rejected */}
                                        {p.status === 'REJECTED' && p.rejectionReason && (
                                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                                                <span className="font-bold">Lý do đã từ chối: </span>
                                                <span>{p.rejectionReason}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Actions & Letter Link */}
                                    <div className="flex flex-col items-end gap-3 shrink-0 pt-2 lg:pt-0">
                                        {p.acceptanceLetterUrl && (
                                            <a
                                                href={p.acceptanceLetterUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-full font-semibold transition"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                                <span>Xem Giấy tiếp nhận</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}

                                        {/* Decision Buttons */}
                                        <div className="flex items-center gap-2 mt-auto">
                                            {p.status === 'PENDING_APPROVAL' && (
                                                <>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => setPlacementToReject(p)}
                                                        disabled={actionLoadingId === p.id}
                                                        className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                                                    >
                                                        <XCircle className="w-3.5 h-3.5 mr-1" />
                                                        Từ chối
                                                    </Button>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleApprovePlacement(p.id)}
                                                        isLoading={actionLoadingId === p.id}
                                                        className="text-xs gap-1"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Duyệt tiếp nhận
                                                    </Button>
                                                </>
                                            )}

                                            {p.status === 'TRANSFER_REQUESTED' && (
                                                <>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => setPlacementToReject(p)}
                                                        disabled={actionLoadingId === p.id}
                                                        className="text-xs text-rose-700"
                                                    >
                                                        Từ chối đổi
                                                    </Button>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleApproveTransfer(p.id)}
                                                        isLoading={actionLoadingId === p.id}
                                                        className="text-xs gap-1"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Duyệt đổi đơn vị
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Reject Placement Modal */}
            <RejectPlacementModal
                isOpen={!!placementToReject}
                onClose={() => setPlacementToReject(null)}
                onConfirm={handleRejectConfirm}
                placement={placementToReject}
                isLoading={!!actionLoadingId}
            />
        </div>
    );
}
export default FacultyPlacementApprovalView;
