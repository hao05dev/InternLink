'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { InternshipFilterStatus } from '../types/internship-management.types';

interface InternshipFilterToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: InternshipFilterStatus;
    onStatusFilterChange: (status: InternshipFilterStatus) => void;
}

export function InternshipFilterToolbar({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
}: InternshipFilterToolbarProps) {
    const filterOptions: { value: InternshipFilterStatus; label: string }[] = [
        { value: 'all', label: 'Tất cả' },
        { value: 'pending', label: 'Chưa nhận giấy' },
        { value: 'letter', label: 'Đã nhận giấy' },
        { value: 'accepted', label: 'Công ty OK' },
        { value: 'active', label: 'Đang TT' },
    ];

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, MSSV, mã lớp hoặc tên công ty..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 bg-white"
                        />
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                        {filterOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => onStatusFilterChange(opt.value)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                                    statusFilter === opt.value
                                        ? 'bg-sky-600 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
