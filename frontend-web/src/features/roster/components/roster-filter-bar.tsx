'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { AcademicProgramOption } from '../types/roster.types';

interface RosterFilterBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterProgram: string;
    onProgramChange: (value: string) => void;
    programs: AcademicProgramOption[];
    filteredCount: number;
    totalCount: number;
}

export function RosterFilterBar({
    searchTerm,
    onSearchChange,
    filterProgram,
    onProgramChange,
    programs,
    filteredCount,
    totalCount,
}: RosterFilterBarProps) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, MSSV hoặc mã lớp..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 bg-white"
                        />
                    </div>
                    <select
                        value={filterProgram}
                        onChange={(e) => onProgramChange(e.target.value)}
                        className="text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 bg-white text-slate-700 min-w-[180px]"
                    >
                        <option value="">Tất cả ngành</option>
                        {programs.map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                    </select>
                    <div className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                        <span className="font-semibold text-slate-700">{filteredCount}</span> / {totalCount} sinh viên
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
