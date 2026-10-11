'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Send, CheckCircle2, Clock, XCircle, AlertTriangle, Building2 } from 'lucide-react';
import { IntroductionLetter } from '../types/introduction-letter.types';
import { introductionLetterService } from '../services/introduction-letter.service';

interface IntroductionLetterSectionProps {
    termId: string;
    onLetterIssued?: () => void;
}

export function IntroductionLetterSection({ termId, onLetterIssued }: IntroductionLetterSectionProps) {
    const [letters, setLetters] = useState<IntroductionLetter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [targetCompanyName, setTargetCompanyName] = useState('');
    const [targetPosition, setTargetPosition] = useState('');
    const [reason, setReason] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const fetchLetters = async () => {
        try {
            setIsLoading(true);
            const data = await introductionLetterService.getMine();
            const termLetters = data.filter(l => !termId || l.termId === termId);
            setLetters(termLetters);
        } catch {
            // Ignored
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLetters();
    }, [termId]);

    const activeLetter = letters.find(l => ['PENDING', 'APPROVED', 'ISSUED'].includes(l.status));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetCompanyName.trim()) {
            setErrorMsg('Vui lòng nhập tên cơ quan/doanh nghiệp dự kiến.');
            return;
        }
        if (!termId) {
            setErrorMsg('Vui lòng chọn học kỳ thực tập.');
            return;
        }

        try {
            setIsSubmitting(true);
            setErrorMsg(null);
            await introductionLetterService.create({
                termId,
                targetCompanyName,
                targetPosition: targetPosition.trim() || undefined,
                reason: reason.trim() || undefined
            });
            setSuccessMsg('Đã gửi yêu cầu cấp Giấy giới thiệu thành công!');
            setTargetCompanyName('');
            setTargetPosition('');
            setReason('');
            fetchLetters();
            if (onLetterIssued) onLetterIssued();
        } catch (err: any) {
            setErrorMsg(err.message || 'Không thể gửi yêu cầu cấp giấy giới thiệu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Bạn có chắc muốn hủy yêu cầu cấp giấy giới thiệu này?')) return;
        try {
            await introductionLetterService.cancel(id);
            setSuccessMsg('Đã hủy yêu cầu cấp giấy giới thiệu.');
            fetchLetters();
        } catch (err: any) {
            setErrorMsg(err.message || 'Không thể hủy yêu cầu.');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="secondary" className="bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1" /> Chờ VP Khoa duyệt</Badge>;
            case 'APPROVED':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Đã duyệt - Mời nhận tại VP Khoa</Badge>;
            case 'ISSUED':
                return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Đã nhận giấy giới thiệu</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Bị từ chối</Badge>;
            case 'CANCELLED':
                return <Badge variant="outline" className="text-gray-500">Đã hủy</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card className="border-indigo-100 shadow-sm mb-6">
            <CardHeader className="bg-indigo-50/50 pb-4">
                <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <div>
                        <CardTitle className="text-base font-semibold text-slate-800">
                            Bước 1: Giấy Giới Thiệu Thực Tập
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-600">
                            Mỗi sinh viên nhận 1 Giấy giới thiệu tại sảnh Văn phòng Trường CNTT-TT để liên hệ nơi thực tập.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {errorMsg && (
                    <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}
                {successMsg && (
                    <div className="p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                {activeLetter ? (
                    <div className="p-4 rounded-lg border bg-slate-50 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs text-slate-500 font-medium">Cơ quan / Doanh nghiệp dự kiến:</span>
                                <h4 className="text-sm font-semibold text-slate-900 flex items-center mt-0.5">
                                    <Building2 className="w-4 h-4 text-indigo-600 mr-1.5" />
                                    {activeLetter.targetCompanyName}
                                </h4>
                                {activeLetter.targetPosition && (
                                    <p className="text-xs text-slate-600 mt-0.5">Vị trí: {activeLetter.targetPosition}</p>
                                )}
                            </div>
                            <div>{getStatusBadge(activeLetter.status)}</div>
                        </div>

                        {activeLetter.issuedCode && (
                            <div className="text-xs bg-indigo-50/80 p-2.5 rounded border border-indigo-100 text-indigo-900">
                                <strong>Mã số giấy giới thiệu:</strong> <span className="font-mono font-bold text-indigo-700">{activeLetter.issuedCode}</span>
                            </div>
                        )}

                        {activeLetter.status === 'APPROVED' && (
                            <div className="text-xs text-blue-800 bg-blue-50 p-2.5 rounded border border-blue-200">
                                📌 <strong>Thông báo:</strong> Giấy giới thiệu đã được duyệt và in sẵn. Vui lòng mang thẻ sinh viên đến sảnh Văn phòng Trường CNTT-TT để nhận giấy.
                            </div>
                        )}

                        {activeLetter.status === 'ISSUED' && (
                            <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded border border-emerald-200">
                                ✅ Bạn đã nhận Giấy giới thiệu. Hãy mang giấy đến nộp cho doanh nghiệp và xin đóng dấu <strong>Phiếu tiếp nhận</strong> để nộp lại ở Bước 2 bên dưới.
                            </div>
                        )}

                        {activeLetter.status === 'PENDING' && (
                            <div className="flex justify-end pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={() => handleCancel(activeLetter.id)}
                                >
                                    Hủy yêu cầu
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-slate-700">Tên Doanh nghiệp / Đơn vị liên hệ *</label>
                                <Input
                                    placeholder="Ví dụ: Công ty TNHH Phần mềm FPT Cần Thơ"
                                    value={targetCompanyName}
                                    onChange={(e) => setTargetCompanyName(e.target.value)}
                                    required
                                    className="text-sm mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Vị trí thực tập dự kiến</label>
                                <Input
                                    placeholder="Ví dụ: Lập trình viên Web / Mobile"
                                    value={targetPosition}
                                    onChange={(e) => setTargetPosition(e.target.value)}
                                    className="text-sm mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-700">Lý do / Ghi chú (nếu có)</label>
                            <Textarea
                                placeholder="Ghi chú thêm về đơn vị hoặc nguyện vọng liên hệ..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={2}
                                className="text-sm mt-1"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSubmitting || !termId}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                            >
                                <Send className="w-3.5 h-3.5 mr-1.5" />
                                {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu cấp Giấy giới thiệu'}
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
