'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import {
    Building2,
    Search,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    MapPin,
    Globe,
    FileCheck2,
    Calendar
} from 'lucide-react';
import type { VerificationStatus } from '@/types/portal';

interface ManagedCompany {
    id: string;
    name: string;
    taxCode: string;
    industry: string;
    address: string;
    websiteUrl?: string;
    mouStatus: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
    mouSignedDate?: string;
    activeInternsCount: number;
}

const SAMPLE_COMPANIES: ManagedCompany[] = [
    {
        id: 'comp-01',
        name: 'Công ty Cổ phần Phần mềm FPT Cần Thơ',
        taxCode: '0101248141-002',
        industry: 'Phát triển phần mềm & Dịch vụ CNTT',
        address: 'KDC Nam Long, Cái Răng, TP. Cần Thơ',
        websiteUrl: 'https://fpt-software.com',
        mouStatus: 'VERIFIED',
        mouSignedDate: '2025-10-15',
        activeInternsCount: 15,
    },
    {
        id: 'comp-02',
        name: 'Viễn thông Cần Thơ (VNPT Cần Thơ)',
        taxCode: '0100684378-012',
        industry: 'Viễn thông & Dịch vụ số',
        address: '02 Nguyễn Thái Học, Ninh Kiều, Cần Thơ',
        websiteUrl: 'https://cantho.vnpt.vn',
        mouStatus: 'VERIFIED',
        mouSignedDate: '2025-11-20',
        activeInternsCount: 8,
    },
    {
        id: 'comp-03',
        name: 'Công ty TNHH Giải Pháp Công Nghệ Mekong Tech',
        taxCode: '1801654321',
        industry: 'Phần mềm & Thương mại điện tử',
        address: 'Đường 30/4, Ninh Kiều, Cần Thơ',
        websiteUrl: 'https://mekongtech.vn',
        mouStatus: 'PENDING',
        activeInternsCount: 0,
    },
];

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = useState<ManagedCompany[]>(SAMPLE_COMPANIES);
    const [searchTerm, setSearchTerm] = useState('');
    const [verifyModalComp, setVerifyModalComp] = useState<ManagedCompany | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const filtered = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.taxCode.includes(searchTerm)
    );

    const handleConfirmVerify = () => {
        if (!verifyModalComp) return;
        setCompanies(prev =>
            prev.map(c =>
                c.id === verifyModalComp.id
                    ? { ...c, mouStatus: 'VERIFIED', mouSignedDate: new Date().toISOString().split('T')[0] }
                    : c
            )
        );
        setMessage({
            type: 'success',
            text: `Đã xác thực biên bản ghi nhớ hợp tác (MOU) cho doanh nghiệp "${verifyModalComp.name}".`,
        });
        setVerifyModalComp(null);
    };

    return (
        <div className="space-y-8 max-w-6xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Đối Tác Doanh Nghiệp & Thẩm Định MOU
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Quản lý danh bạ doanh nghiệp liên kết đào tạo và xác thực biên bản ghi nhớ hợp tác thực tập với Trường CNTT&TT.
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

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                    placeholder="Tìm theo tên doanh nghiệp hoặc mã số thuế..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Companies List */}
            <div className="space-y-4">
                {filtered.map((c) => (
                    <Card key={c.id} className="hover:border-slate-300 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="font-bold text-base text-slate-900">{c.name}</span>
                                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                            MST: {c.taxCode}
                                        </span>
                                        <StatusBadge status={c.mouStatus} type="verification" />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-y-1 gap-x-5 text-xs text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            <Building2 className="w-4 h-4 text-slate-400" />
                                            <span>{c.industry}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            <span>{c.address}</span>
                                        </div>
                                        {c.mouSignedDate && (
                                            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                                                <Calendar className="w-4 h-4" />
                                                <span>Ngày ký MOU: {new Date(c.mouSignedDate).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end md:self-center">
                                    {c.mouStatus === 'PENDING' && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => setVerifyModalComp(c)}
                                            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>Xác thực MOU</span>
                                        </Button>
                                    )}

                                    {c.mouStatus === 'VERIFIED' && (
                                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Đối tác chính thức
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Verify Modal */}
            <Modal
                isOpen={!!verifyModalComp}
                onClose={() => setVerifyModalComp(null)}
                title={`Xác thực thỏa thuận hợp tác (MOU): ${verifyModalComp?.name}`}
                maxWidth="md"
            >
                <div className="space-y-4">
                    <p className="text-xs text-slate-600">
                        Xác nhận doanh nghiệp <strong>{verifyModalComp?.name}</strong> (Mã số thuế: {verifyModalComp?.taxCode}) đã hoàn tất ký kết biên bản ghi nhớ hợp tác đào tạo và tiếp nhận thực tập sinh với Trường CNTT&TT - ĐH Cần Thơ.
                    </p>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setVerifyModalComp(null)}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleConfirmVerify}
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Xác nhận Thẩm định MOU</span>
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
