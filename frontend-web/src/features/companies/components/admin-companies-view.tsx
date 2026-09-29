'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

interface Company {
    id: string;
    companyName: string;
    taxCode: string;
    industry?: string;
    verificationStatus: string;
}

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }> = {
    VERIFIED: { label: 'Đã xác minh', variant: 'success' },
    PENDING: { label: 'Chờ thẩm định', variant: 'warning' },
    REJECTED: { label: 'Từ chối', variant: 'destructive' },
    NEEDS_REVISION: { label: 'Cần bổ sung', variant: 'warning' },
};

export default function AdminCompaniesView() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        apiClient
            .get<Company[]>('/api/v1/companies')
            .then((result) => setCompanies(result.data ?? []))
            .catch((reason) => setError(reason instanceof Error ? reason.message : 'Không tải được danh sách doanh nghiệp.'));
    }, []);

    return (
        <div className="max-w-5xl space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Danh bạ doanh nghiệp đối tác
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Hồ sơ pháp nhân, thông tin liên hệ và trạng thái thẩm định tiếp nhận thực tập sinh.
                </p>
            </div>

            {error && (
                <div role="alert" className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-3">
                {companies.map((company) => {
                    const status = STATUS_MAP[company.verificationStatus] || { label: company.verificationStatus, variant: 'secondary' as const };
                    return (
                        <Card key={company.id} className="hover:border-slate-300 transition shadow-2xs">
                            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5">
                                <div className="flex items-center space-x-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900 text-sm">{company.companyName}</span>
                                            <Badge variant={status.variant} className="text-[11px] px-2 py-0.5">
                                                {status.label}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Mã số thuế: <span className="font-medium text-slate-700">{company.taxCode}</span> • Lĩnh vực: <span className="text-slate-600">{company.industry || 'Công nghệ thông tin'}</span>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {!companies.length && !error && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                        <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-600">Chưa có thông tin doanh nghiệp.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
