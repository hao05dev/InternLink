'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Search } from 'lucide-react';

interface AuditLog {
    id: string;
    createdAt: string;
    actorName: string;
    action: string;
    entityType: string;
    entityId?: string;
    result: string;
    ipAddress?: string;
}

export default function AdminAuditLogsView() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        apiClient
            .get<AuditLog[]>('/api/v1/audit-logs')
            .then((result) => setLogs(result.data ?? []))
            .catch((reason) => setError(reason instanceof Error ? reason.message : 'Không tải được nhật ký kiểm toán.'));
    }, []);

    const filtered = logs.filter((log) =>
        `${log.actorName} ${log.action} ${log.entityType} ${log.entityId ?? ''}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Nhật ký kiểm toán hệ thống
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Theo dõi lịch sử truy cập, các thao tác quản trị và thay đổi dữ liệu trong hệ thống.
                </p>
            </div>

            {error && (
                <div role="alert" className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            <div className="relative">
                <Input
                    placeholder="Tìm người thực hiện, hành động, tài nguyên..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="pl-9"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <Card className="shadow-xs border-slate-200/80 min-w-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-xs">
                        <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            <tr>
                                <th className="p-3.5">Thời gian</th>
                                <th className="p-3.5">Người thực hiện</th>
                                <th className="p-3.5">Hành động</th>
                                <th className="p-3.5">Đối tượng tác động</th>
                                <th className="p-3.5">Kết quả</th>
                                <th className="p-3.5">Địa chỉ IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                                    <td className="p-3.5 text-xs text-slate-500 whitespace-nowrap">
                                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="p-3.5 font-medium text-slate-800">{log.actorName}</td>
                                    <td className="p-3.5 font-semibold text-slate-700">{log.action}</td>
                                    <td className="p-3.5 text-slate-600">
                                        <span className="font-medium text-slate-800">{log.entityType}</span>{' '}
                                        {log.entityId && <span className="text-xs text-slate-400">({log.entityId.slice(0, 8)}...)</span>}
                                    </td>
                                    <td className="p-3.5">
                                        <Badge
                                            variant={log.result === 'SUCCESS' ? 'success' : 'destructive'}
                                            className="text-[10px] px-2 py-0.5"
                                        >
                                            {log.result === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                                        </Badge>
                                    </td>
                                    <td className="p-3.5 text-xs text-slate-500 font-mono">{log.ipAddress || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!filtered.length && !error && (
                    <div className="text-center py-10 text-slate-400 text-xs">
                        <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        Chưa có dữ liệu nhật ký phù hợp.
                    </div>
                )}
            </Card>
        </div>
    );
}
