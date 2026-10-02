'use client';

import { useEffect, useState, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { ShieldCheck, Search, Shield, RefreshCw } from 'lucide-react';

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
    const [resultFilter, setResultFilter] = useState<string>('ALL');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    useEffect(() => {
        setIsLoading(true);
        apiClient
            .get<AuditLog[]>('/api/v1/audit-logs')
            .then((result) => setLogs(result.data ?? []))
            .catch((reason) => setError(reason instanceof Error ? reason.message : 'Không tải được nhật ký kiểm toán.'))
            .finally(() => setIsLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return logs.filter((log) => {
            const matchesResult = resultFilter === 'ALL' || log.result === resultFilter;
            const matchesSearch =
                !query ||
                `${log.actorName} ${log.action} ${log.entityType} ${log.entityId ?? ''}`.toLowerCase().includes(query);
            return matchesResult && matchesSearch;
        });
    }, [logs, search, resultFilter]);

    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    return (
        <div className="max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                        Nhật Ký Kiểm Toán Hệ Thống (Audit Logs)
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Theo dõi toàn bộ lịch sử truy cập, các thao tác quản trị và thay đổi dữ liệu trên nền tảng
                    </p>
                </div>
            </div>

            {error && (
                <div role="alert" className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-xs">
                    {error}
                </div>
            )}

            {/* Toolbar: Search + Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Tìm người thực hiện, hành động, tài nguyên..."
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Kết quả:</span>
                    <select
                        value={resultFilter}
                        onChange={(e) => {
                            setResultFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                    >
                        <option value="ALL">Tất cả ({logs.length})</option>
                        <option value="SUCCESS">Thành công</option>
                        <option value="FAILED">Thất bại</option>
                    </select>
                </div>
            </div>

            {/* Logs Table */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                    <p className="text-xs text-slate-500">Đang tải nhật ký kiểm toán...</p>
                </div>
            ) : (
                <Card className="shadow-xs border-slate-200/80 min-w-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-xs">
                            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                <tr>
                                    <th className="p-3.5">Thời gian</th>
                                    <th className="p-3.5">Người thực hiện</th>
                                    <th className="p-3.5">Hành động</th>
                                    <th className="p-3.5">Đối tượng tác động</th>
                                    <th className="p-3.5 text-center">Kết quả</th>
                                    <th className="p-3.5">Địa chỉ IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800">
                                {paginatedLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                                            <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                            Chưa có dữ liệu nhật ký phù hợp.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/70 transition">
                                            <td className="p-3.5 text-xs text-slate-500 whitespace-nowrap">
                                                {new Date(log.createdAt).toLocaleString('vi-VN')}
                                            </td>
                                            <td className="p-3.5 font-medium text-slate-800">{log.actorName}</td>
                                            <td className="p-3.5 font-semibold text-slate-700">{log.action}</td>
                                            <td className="p-3.5 text-slate-600">
                                                <span className="font-medium text-slate-800">{log.entityType}</span>{' '}
                                                {log.entityId && (
                                                    <span className="text-[11px] font-mono text-slate-400">
                                                        ({log.entityId.slice(0, 8)}...)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <Badge
                                                    variant={log.result === 'SUCCESS' ? 'success' : 'destructive'}
                                                    className="text-[10px] px-2 py-0.5"
                                                >
                                                    {log.result === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                                                </Badge>
                                            </td>
                                            <td className="p-3.5 text-xs text-slate-500 font-mono">{log.ipAddress || '—'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Integrated Pagination */}
                    {filtered.length > 0 && (
                        <div className="border-t border-slate-100 bg-slate-50/50 px-3 py-1">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filtered.length}
                                pageSize={pageSize}
                                pageSizeOptions={[10, 15, 25, 50, 100]}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(sz) => {
                                    setPageSize(sz);
                                    setCurrentPage(1);
                                }}
                                itemLabel="nhật ký"
                            />
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}
