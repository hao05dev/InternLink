'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface CompanyJobFilterProps {
    terms: Array<{ id: string; name?: string; semester?: string; academicYear?: string }>;
    selectedTermId: string;
    onTermChange: (termId: string) => void;
    statusFilter: string;
    onStatusChange: (status: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function CompanyJobFilter({
    terms,
    selectedTermId,
    onTermChange,
    statusFilter,
    onStatusChange,
    searchQuery,
    onSearchChange,
}: CompanyJobFilterProps) {
    const termOptions = [
        { value: 'ALL', label: 'Tất cả các kỳ thực tập' },
        ...terms.map((t) => ({
            value: t.id,
            label: t.name || `${t.semester || ''} (${t.academicYear || ''})`.trim() || t.id,
        })),
    ];

    const statusOptions = [
        { value: 'ALL', label: 'Tất cả trạng thái' },
        { value: 'DRAFT', label: 'Bản nháp (Chưa gửi)' },
        { value: 'PENDING_REVIEW', label: 'Đang chờ thẩm định' },
        { value: 'APPROVED', label: 'Đã duyệt / Đang tuyển' },
        { value: 'REJECTED', label: 'Bị từ chối' },
        { value: 'CLOSED', label: 'Đã đóng' },
    ];

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Bộ lọc danh sách tuyển dụng</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Tìm tiêu đề, địa điểm..."
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
                <Select
                    value={selectedTermId}
                    onChange={(e) => onTermChange(e.target.value)}
                    options={termOptions}
                />
                <Select
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    options={statusOptions}
                />
            </div>
        </div>
    );
}
