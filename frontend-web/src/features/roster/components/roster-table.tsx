'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { RefreshCw, FileSpreadsheet, Upload, Hash, UserPlus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { RosterStudent } from '../types/roster.types';

interface RosterTableProps {
    isLoading: boolean;
    students: RosterStudent[];
    totalCount: number;
    isTermClosed?: boolean;
    onOpenExcelModal: () => void;
    onOpenManualModal: () => void;
    onProvisionStudent: (student: RosterStudent) => void;
}

export function RosterTable({
    isLoading,
    students,
    totalCount,
    isTermClosed = false,
    onOpenExcelModal,
    onOpenManualModal,
    onProvisionStudent,
}: RosterTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [sortField, setSortField] = useState<'fullName' | 'studentCode' | 'classCode' | 'eligibilityStatus' | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (field: 'fullName' | 'studentCode' | 'classCode' | 'eligibilityStatus') => {
        if (sortField === field) {
            if (sortDirection === 'asc') setSortDirection('desc');
            else {
                setSortField(null);
                setSortDirection('asc');
            }
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedStudents = useMemo(() => {
        if (!sortField) return students;
        return [...students].sort((a, b) => {
            const valA = String(a[sortField] || '').toLowerCase();
            const valB = String(b[sortField] || '').toLowerCase();
            if (valA === valB) return 0;
            return sortDirection === 'asc' ? valA.localeCompare(valB, 'vi') : valB.localeCompare(valA, 'vi');
        });
    }, [students, sortField, sortDirection]);

    const totalPages = Math.ceil(sortedStudents.length / pageSize) || 1;
    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedStudents.slice(start, start + pageSize);
    }, [sortedStudents, currentPage, pageSize]);

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-sky-500 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Đang tải danh sách...</p>
                </CardContent>
            </Card>
        );
    }

    if (students.length === 0) {
        return (
            <EmptyState
                title="Chưa có sinh viên trong danh sách"
                description="Kỳ thực tập này chưa có sinh viên nào. Hãy thêm thủ công hoặc import từ file Excel."
                action={
                    <div className="flex gap-3 justify-center">
                        <Button variant="secondary" onClick={onOpenExcelModal} className="gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            Import từ Excel
                        </Button>
                        <Button variant="primary" onClick={onOpenManualModal} className="gap-2">
                            <Upload className="w-4 h-4" />
                            Thêm thủ công
                        </Button>
                    </div>
                }
            />
        );
    }

    return (
        <Card className="min-w-0 overflow-hidden border-slate-200/80 shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider select-none">
                        <tr>
                            <th className="px-4 py-3.5 w-12 text-center">STT</th>
                            <th 
                                className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                                onClick={() => handleSort('fullName')}
                            >
                                <div className="flex items-center gap-1.5">
                                    <span>Sinh viên</span>
                                    {sortField === 'fullName' ? (
                                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-sky-600" /> : <ArrowDown className="w-3 h-3 text-sky-600" />
                                    ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                                </div>
                            </th>
                            <th 
                                className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                                onClick={() => handleSort('studentCode')}
                            >
                                <div className="flex items-center gap-1.5">
                                    <span>MSSV</span>
                                    {sortField === 'studentCode' ? (
                                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-sky-600" /> : <ArrowDown className="w-3 h-3 text-sky-600" />
                                    ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                                </div>
                            </th>
                            <th 
                                className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                                onClick={() => handleSort('classCode')}
                            >
                                <div className="flex items-center gap-1.5">
                                    <span>Lớp</span>
                                    {sortField === 'classCode' ? (
                                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-sky-600" /> : <ArrowDown className="w-3 h-3 text-sky-600" />
                                    ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                                </div>
                            </th>
                            <th className="px-4 py-3.5">Email</th>
                            <th className="px-4 py-3.5">Khóa</th>
                            <th className="px-4 py-3.5">Ngành</th>
                            <th 
                                className="px-4 py-3.5 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                                onClick={() => handleSort('eligibilityStatus')}
                            >
                                <div className="flex items-center justify-center gap-1.5">
                                    <span>Điều kiện</span>
                                    {sortField === 'eligibilityStatus' ? (
                                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-sky-600" /> : <ArrowDown className="w-3 h-3 text-sky-600" />
                                    ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                                </div>
                            </th>
                            <th className="px-4 py-3.5 text-center">Tài khoản</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                        {paginatedStudents.map((s, idx) => {
                            const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                            return (
                                <tr key={s.id} className="hover:bg-sky-50/40 transition-colors">
                                    <td className="px-4 py-3 text-slate-400 font-medium text-center">{globalIndex}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-900">{s.fullName}</div>
                                        {s.internshipCourseCode && (
                                            <div className="text-[10px] text-slate-400 mt-0.5">HP: {s.internshipCourseCode}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sky-700 font-bold font-mono">{s.studentCode}</td>
                                    <td className="px-4 py-3">
                                        {s.classCode ? (
                                            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                                                <Hash className="w-2.5 h-2.5" />
                                                {s.classCode}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{s.officialEmail}</td>
                                    <td className="px-4 py-3 text-slate-600">{s.academicYear}</td>
                                    <td className="px-4 py-3 text-slate-600 max-w-[140px] truncate" title={s.programName}>
                                        {s.programName}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {s.eligibilityStatus === 'ELIGIBLE' ? (
                                            <Badge variant="success" className="text-[10px]">Đủ điều kiện</Badge>
                                        ) : s.eligibilityStatus === 'NEEDS_REVIEW' ? (
                                            <Badge variant="warning" className="text-[10px]">Cần xem xét</Badge>
                                        ) : (
                                            <Badge variant="destructive" className="text-[10px]">Không đủ</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {s.claimedUserId ? (
                                            <Badge variant="success" className="text-[10px]">Đã kích hoạt</Badge>
                                        ) : isTermClosed ? (
                                            <div className="flex flex-col items-center gap-1">
                                                <Badge variant="secondary" className="text-[10px]">Chưa kích hoạt</Badge>
                                                <span className="text-[10px] text-slate-400 font-medium">Đã khóa kỳ</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1">
                                                <Badge variant="secondary" className="text-[10px]">Chưa có TK</Badge>
                                                <button
                                                    onClick={() => onProvisionStudent(s)}
                                                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-full transition cursor-pointer"
                                                    title="Tạo tài khoản sinh viên từ roster này"
                                                >
                                                    <UserPlus className="w-3 h-3" />
                                                    Tạo TK
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Integrated Pagination */}
            {students.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50/50 px-3 py-1">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={students.length}
                        pageSize={pageSize}
                        pageSizeOptions={[10, 25, 50, 100]}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            setCurrentPage(1);
                        }}
                        itemLabel="sinh viên"
                    />
                </div>
            )}
        </Card>
    );
}
