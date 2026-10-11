'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import {
    FileText,
    CheckCircle2,
    Clock,
    XCircle,
    Search,
    UserCheck,
    Building2,
    RefreshCw,
    AlertTriangle
} from 'lucide-react';
import { IntroductionLetter } from '../types/introduction-letter.types';
import { introductionLetterService } from '../services/introduction-letter.service';
import { apiClient } from '@/lib/api-client';

export function FacultyIntroductionLettersView() {
    const [terms, setTerms] = useState<any[]>([]);
    const [selectedTermId, setSelectedTermId] = useState('');
    const [letters, setLetters] = useState<IntroductionLetter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedLetter, setSelectedLetter] = useState<IntroductionLetter | null>(null);
    const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'ISSUED' | 'REJECTED'>('APPROVED');
    const [issuedCode, setIssuedCode] = useState('');
    const [issueNote, setIssueNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        async function fetchTerms() {
            try {
                const res = await apiClient.get<any[]>('/api/v1/terms/active');
                if (res.data && res.data.length > 0) {
                    setTerms(res.data);
                    setSelectedTermId(res.data[0].id);
                }
            } catch {
                // Ignored
            }
        }
        fetchTerms();
    }, []);

    const fetchLetters = async () => {
        if (!selectedTermId) return;
        try {
            setIsLoading(true);
            const data = await introductionLetterService.getByTerm(selectedTermId);
            setLetters(data);
        } catch {
            // Ignored
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLetters();
    }, [selectedTermId]);

    const handleOpenReview = (letter: IntroductionLetter, defaultStatus: 'APPROVED' | 'ISSUED' | 'REJECTED' = 'APPROVED') => {
        setSelectedLetter(letter);
        setReviewStatus(defaultStatus);
        setIssuedCode(letter.issuedCode || '');
        setIssueNote(letter.issueNote || '');
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLetter) return;
        try {
            setIsSubmitting(true);
            setMessage(null);
            await introductionLetterService.review(selectedLetter.id, {
                status: reviewStatus,
                issuedCode: issuedCode.trim() || undefined,
                issueNote: issueNote.trim() || undefined
            });
            setMessage({ type: 'success', text: 'Cập nhật trạng thái Giấy giới thiệu thành công!' });
            setSelectedLetter(null);
            fetchLetters();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Lỗi khi cập nhật trạng thái.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmReceived = async (letterId: string) => {
        try {
            setMessage(null);
            await introductionLetterService.confirmReceived(letterId);
            setMessage({ type: 'success', text: 'Đã xác nhận sinh viên nhận Giấy giới thiệu tại sảnh VP.' });
            fetchLetters();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Không thể xác nhận.' });
        }
    };

    const filteredLetters = letters.filter(l => {
        const matchesSearch = !searchTerm ||
            l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.studentCode && l.studentCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
            l.targetCompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (l.issuedCode && l.issuedCode.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="secondary" className="bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1" /> Chờ duyệt</Badge>;
            case 'APPROVED':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Đã duyệt (Chờ nhận tại VP)</Badge>;
            case 'ISSUED':
                return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800"><UserCheck className="w-3 h-3 mr-1" /> Đã nhận giấy</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Từ chối</Badge>;
            case 'CANCELLED':
                return <Badge variant="outline" className="text-gray-500">Đã hủy</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-600" />
                        Quản Lý Cấp Giấy Giới Thiệu Thực Tập
                    </h2>
                    <p className="text-sm text-slate-500">
                        Tiếp nhận, phê duyệt và xác nhận phát Giấy giới thiệu tại sảnh Văn phòng Trường CNTT-TT.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select
                        value={selectedTermId}
                        onChange={(e) => setSelectedTermId(e.target.value)}
                        className="w-56 text-sm"
                    >
                        {terms.map(t => (
                            <option key={t.id} value={t.id}>{t.name || t.termName}</option>
                        ))}
                    </Select>
                    <Button variant="outline" size="sm" onClick={fetchLetters} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm font-medium flex items-center justify-between ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
                </div>
            )}

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Tìm theo tên SV, MSSV, đơn vị tiếp nhận hoặc mã giấy..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 text-sm"
                    />
                </div>
                <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-48 text-sm"
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="APPROVED">Đã duyệt (Chờ nhận)</option>
                    <option value="ISSUED">Đã nhận giấy</option>
                    <option value="REJECTED">Từ chối</option>
                    <option value="CANCELLED">Đã hủy</option>
                </Select>
            </div>

            {/* Table */}
            <Card className="border-slate-200">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b">
                                <tr>
                                    <th className="px-4 py-3">Sinh Viên</th>
                                    <th className="px-4 py-3">Đơn Vị Dự Kiến</th>
                                    <th className="px-4 py-3">Mã Giấy / Ngày Nộp</th>
                                    <th className="px-4 py-3">Trạng Thái</th>
                                    <th className="px-4 py-3 text-right">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-slate-500">Đang tải dữ liệu...</td>
                                    </tr>
                                ) : filteredLetters.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-slate-500">Không có yêu cầu nào phù hợp.</td>
                                    </tr>
                                ) : (
                                    filteredLetters.map(letter => (
                                        <tr key={letter.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">{letter.studentName}</div>
                                                <div className="text-xs text-slate-500">{letter.studentCode || 'Chưa cập nhật MSSV'}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-800 flex items-center gap-1.5">
                                                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                                                    {letter.targetCompanyName}
                                                </div>
                                                {letter.targetPosition && (
                                                    <div className="text-xs text-slate-500">Vị trí: {letter.targetPosition}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {letter.issuedCode ? (
                                                    <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                        {letter.issuedCode}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Chưa cấp mã</span>
                                                )}
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    {new Date(letter.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{getStatusBadge(letter.status)}</td>
                                            <td className="px-4 py-3 text-right space-x-1.5">
                                                {letter.status === 'PENDING' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white h-7 px-2.5"
                                                            onClick={() => handleOpenReview(letter, 'APPROVED')}
                                                        >
                                                            Duyệt Cấp
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs text-red-600 border-red-200 hover:bg-red-50 h-7 px-2.5"
                                                            onClick={() => handleOpenReview(letter, 'REJECTED')}
                                                        >
                                                            Từ Chối
                                                        </Button>
                                                    </>
                                                )}
                                                {letter.status === 'APPROVED' && (
                                                    <Button
                                                        size="sm"
                                                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5"
                                                        onClick={() => handleConfirmReceived(letter.id)}
                                                    >
                                                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                                                        Xác Nhận Đã Nhận
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Modal Review */}
            {selectedLetter && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-slate-900 text-base">
                                Xét Duyệt Giấy Giới Thiệu
                            </h3>
                            <button onClick={() => setSelectedLetter(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
                        </div>

                        <div className="space-y-2 text-xs bg-slate-50 p-3 rounded border text-slate-700">
                            <div><strong>Sinh viên:</strong> {selectedLetter.studentName} ({selectedLetter.studentCode})</div>
                            <div><strong>Đơn vị tiếp nhận:</strong> {selectedLetter.targetCompanyName}</div>
                            {selectedLetter.reason && <div><strong>Ghi chú của SV:</strong> {selectedLetter.reason}</div>}
                        </div>

                        <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700">Hành động quyết định *</label>
                                <Select
                                    value={reviewStatus}
                                    onChange={(e) => setReviewStatus(e.target.value as any)}
                                    className="mt-1 text-xs"
                                >
                                    <option value="APPROVED">Phê duyệt (Sẵn sàng in &amp; cấp)</option>
                                    <option value="ISSUED">Phê duyệt &amp; Xác nhận đã nhận ngay</option>
                                    <option value="REJECTED">Từ chối yêu cầu</option>
                                </Select>
                            </div>

                            {reviewStatus !== 'REJECTED' && (
                                <div>
                                    <label className="font-semibold text-slate-700">Mã Giấy Giới Thiệu (Tùy chọn)</label>
                                    <Input
                                        placeholder="Để trống để hệ thống tự sinh mã GGT-..."
                                        value={issuedCode}
                                        onChange={(e) => setIssuedCode(e.target.value)}
                                        className="mt-1 text-xs"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="font-semibold text-slate-700">Ghi chú / Lý do (nếu có)</label>
                                <Input
                                    placeholder={reviewStatus === 'REJECTED' ? 'Nêu rõ lý do từ chối...' : 'Ghi chú cho sinh viên...'}
                                    value={issueNote}
                                    onChange={(e) => setIssueNote(e.target.value)}
                                    required={reviewStatus === 'REJECTED'}
                                    className="mt-1 text-xs"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedLetter(null)}
                                >
                                    Đóng
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isSubmitting}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu Quyết Định'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
