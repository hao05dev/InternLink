'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    ShieldCheck,
    Search,
    Clock,
    User,
    Activity,
    Lock
} from 'lucide-react';

interface AuditLogEntry {
    id: string;
    timestamp: string;
    actorEmail: string;
    actorRole: string;
    action: string;
    resource: string;
    status: 'SUCCESS' | 'FAILURE';
    ipAddress: string;
}

const SAMPLE_LOGS: AuditLogEntry[] = [
    {
        id: 'log-01',
        timestamp: '2026-09-27T18:45:10Z',
        actorEmail: 'bql.cict@ctu.edu.vn',
        actorRole: 'FACULTY_ADMIN',
        action: 'APPROVE_JOB_POSITION',
        resource: 'JOB_POSITION / job-fpt-01',
        status: 'SUCCESS',
        ipAddress: '172.16.10.45',
    },
    {
        id: 'log-02',
        timestamp: '2026-09-27T17:30:22Z',
        actorEmail: 'hoangtm@fpt-software.com',
        actorRole: 'COMPANY_MENTOR',
        action: 'REVIEW_WEEKLY_LOGBOOK',
        resource: 'LOGBOOK / log-w02',
        status: 'SUCCESS',
        ipAddress: '113.161.72.19',
    },
    {
        id: 'log-03',
        timestamp: '2026-09-27T16:15:05Z',
        actorEmail: 'nguyenvana@ctu.edu.vn',
        actorRole: 'STUDENT',
        action: 'SIGN_LEARNING_AGREEMENT',
        resource: 'LEARNING_AGREEMENT / la-ctu-2026-001',
        status: 'SUCCESS',
        ipAddress: '14.232.180.12',
    },
    {
        id: 'log-04',
        timestamp: '2026-09-27T15:00:44Z',
        actorEmail: 'unknown@ctu.edu.vn',
        actorRole: 'ANONYMOUS',
        action: 'AUTH_LOGIN_FAILED',
        resource: 'AUTH_SERVICE',
        status: 'FAILURE',
        ipAddress: '183.80.45.102',
    },
    {
        id: 'log-05',
        timestamp: '2026-09-27T14:20:11Z',
        actorEmail: 'admin@ctu.edu.vn',
        actorRole: 'ADMIN',
        action: 'VERIFY_COMPANY_MOU',
        resource: 'COMPANY / comp-fpt',
        status: 'SUCCESS',
        ipAddress: '172.16.10.1',
    },
];

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState<AuditLogEntry[]>(SAMPLE_LOGS);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = logs.filter(l =>
        l.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.resource.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-6xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Nhật Ký Kiểm Toán Hệ Thống (Audit Logs)
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Theo dõi toàn bộ các hoạt động nhạy cảm, ký duyệt thỏa thuận, thay đổi phân quyền và lịch sử xác thực bảo mật.
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                    placeholder="Tìm theo email, hành động hoặc tài nguyên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Audit Logs Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Thời gian</th>
                                <th className="px-6 py-4">Người thực hiện</th>
                                <th className="px-6 py-4">Hành động</th>
                                <th className="px-6 py-4">Tài nguyên tác động</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Địa chỉ IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
                            {filtered.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="px-6 py-4 text-slate-500 text-[11px]">
                                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-900">{log.actorEmail}</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-sans">{log.actorRole}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-blue-700">{log.action}</td>
                                    <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{log.resource}</td>
                                    <td className="px-6 py-4 text-center">
                                        {log.status === 'SUCCESS' ? (
                                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] font-sans">
                                                Thành công
                                            </span>
                                        ) : (
                                            <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-[10px] font-sans">
                                                Thất bại
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-400 text-[11px]">{log.ipAddress}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
