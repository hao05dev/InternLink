'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
    UserCheck,
    CheckCircle2,
    RotateCcw,
    LayoutGrid,
    Users,
} from 'lucide-react';
import type { InternshipPlacement } from '@/features/placements/types/placement.types';

import { CompanyInternMetrics } from './company/company-intern-metrics';
import { CompanyInternFilterBar } from './company/company-intern-filter-bar';
import { CompanyInternCard } from './company/company-intern-card';

export default function CompanyInternsView() {
    const [interns, setInterns] = useState<InternshipPlacement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('ALL');
    const [selectedTermId, setSelectedTermId] = useState('ALL');
    const [selectedMentorId, setSelectedMentorId] = useState('ALL');
    const [selectedJobTitle, setSelectedJobTitle] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedTimeline, setSelectedTimeline] = useState('ALL');
    const [viewMode, setViewMode] = useState<'cards' | 'by-mentor'>('cards');

    useEffect(() => {
        async function fetchInterns() {
            try {
                const res = await apiClient.get<InternshipPlacement[]>('/api/v1/placements/company/my-interns');
                setInterns(res.data ?? []);
            } catch (error) {
                setInterns([]);
                setMessage({
                    type: 'error',
                    text: error instanceof Error ? error.message : 'Không tải được danh sách thực tập sinh.',
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchInterns();
    }, []);

    const academicYearsList = useMemo(() => {
        const years = new Set<string>();
        interns.forEach((item) => {
            if (item.academicYear) years.add(item.academicYear.trim());
        });
        return Array.from(years).sort().reverse();
    }, [interns]);

    const availableTermsList = useMemo(() => {
        const map = new Map<string, { id: string; name: string; academicYear?: string }>();
        interns.forEach((item) => {
            if (item.termId && item.termName) {
                if (selectedAcademicYear === 'ALL' || item.academicYear === selectedAcademicYear) {
                    map.set(item.termId, { id: item.termId, name: item.termName, academicYear: item.academicYear });
                }
            }
        });
        return Array.from(map.values());
    }, [interns, selectedAcademicYear]);

    const handleAcademicYearChange = (year: string) => {
        setSelectedAcademicYear(year);
        if (year !== 'ALL' && selectedTermId !== 'ALL') {
            const belongs = interns.some((i) => i.termId === selectedTermId && i.academicYear === year);
            if (!belongs) setSelectedTermId('ALL');
        }
    };

    const mentorsList = useMemo(() => {
        const map = new Map<string, { id: string; name: string; email?: string }>();
        interns.forEach((item) => {
            if (item.mentorId && item.mentorName) {
                map.set(item.mentorId, { id: item.mentorId, name: item.mentorName, email: item.mentorEmail });
            }
        });
        return Array.from(map.values());
    }, [interns]);

    const jobsList = useMemo(() => {
        const set = new Set<string>();
        interns.forEach((item) => {
            if (item.jobTitle) set.add(item.jobTitle.trim());
        });
        return Array.from(set).sort();
    }, [interns]);

    const metrics = useMemo(() => {
        const total = interns.length;
        const inProgress = interns.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'ACTIVE').length;
        const unassignedMentor = interns.filter((i) => !i.mentorId && !i.mentorName).length;
        const completed = interns.filter((i) => i.status === 'COMPLETED').length;
        return { total, inProgress, unassignedMentor, completed };
    }, [interns]);

    const filteredInterns = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const now = new Date();

        return interns.filter((intern) => {
            if (query) {
                const nameMatch = intern.studentName?.toLowerCase().includes(query);
                const codeMatch = intern.studentCode?.toLowerCase().includes(query);
                const emailMatch = intern.studentEmail?.toLowerCase().includes(query);
                const jobMatch = intern.jobTitle?.toLowerCase().includes(query);
                const mentorMatch = intern.mentorName?.toLowerCase().includes(query);
                if (!nameMatch && !codeMatch && !emailMatch && !jobMatch && !mentorMatch) return false;
            }

            if (selectedAcademicYear !== 'ALL' && intern.academicYear !== selectedAcademicYear) return false;
            if (selectedTermId !== 'ALL' && intern.termId !== selectedTermId) return false;

            if (selectedMentorId === 'UNASSIGNED') {
                if (intern.mentorId || intern.mentorName) return false;
            } else if (selectedMentorId !== 'ALL' && intern.mentorId !== selectedMentorId) {
                return false;
            }

            if (selectedJobTitle !== 'ALL' && intern.jobTitle !== selectedJobTitle) return false;
            if (selectedStatus !== 'ALL' && intern.status !== selectedStatus) return false;

            if (selectedTimeline !== 'ALL') {
                if (!intern.startDate || !intern.endDate) return false;
                const start = new Date(intern.startDate);
                const end = new Date(intern.endDate);
                if (selectedTimeline === 'ONGOING' && (now < start || now > end)) return false;
                if (selectedTimeline === 'ENDING_SOON') {
                    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysLeft < 0 || daysLeft > 14) return false;
                }
                if (selectedTimeline === 'FINISHED' && now <= end) return false;
                if (selectedTimeline === 'UPCOMING' && now >= start) return false;
            }

            return true;
        });
    }, [interns, searchQuery, selectedAcademicYear, selectedTermId, selectedMentorId, selectedJobTitle, selectedStatus, selectedTimeline]);

    const groupedByMentor = useMemo(() => {
        const groups: { [key: string]: { mentorName: string; mentorEmail?: string; items: InternshipPlacement[] } } = {};
        groups['unassigned'] = { mentorName: 'Chưa phân công Mentor', items: [] };

        mentorsList.forEach((m) => {
            groups[m.id] = { mentorName: m.name, mentorEmail: m.email, items: [] };
        });

        filteredInterns.forEach((intern) => {
            if (!intern.mentorId && !intern.mentorName) {
                groups['unassigned'].items.push(intern);
            } else if (intern.mentorId && groups[intern.mentorId]) {
                groups[intern.mentorId].items.push(intern);
            } else {
                const key = intern.mentorName || 'other';
                if (!groups[key]) groups[key] = { mentorName: intern.mentorName || 'Khác', items: [] };
                groups[key].items.push(intern);
            }
        });

        return Object.entries(groups).filter(([_, g]) => g.items.length > 0);
    }, [filteredInterns, mentorsList]);

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedAcademicYear('ALL');
        setSelectedTermId('ALL');
        setSelectedMentorId('ALL');
        setSelectedJobTitle('ALL');
        setSelectedStatus('ALL');
        setSelectedTimeline('ALL');
    };

    const hasActiveFilters =
        Boolean(searchQuery) ||
        selectedAcademicYear !== 'ALL' ||
        selectedTermId !== 'ALL' ||
        selectedMentorId !== 'ALL' ||
        selectedJobTitle !== 'ALL' ||
        selectedStatus !== 'ALL' ||
        selectedTimeline !== 'ALL';

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-7xl">
                <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="h-48 bg-slate-100 rounded-xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header & View Mode Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Quản Lý Thực Tập Sinh Tại Doanh Nghiệp
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Theo dõi tiến độ, tin tuyển dụng trúng tuyển, phân bổ Cán bộ hướng dẫn (Mentor) và thời gian thực tập.
                    </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
                    <button
                        type="button"
                        onClick={() => setViewMode('cards')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Danh sách</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('by-mentor')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            viewMode === 'by-mentor' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Users className="w-3.5 h-3.5" />
                        <span>Theo Mentor</span>
                    </button>
                </div>
            </div>

            {/* Notification alert */}
            {message && (
                <div
                    role="alert"
                    aria-live="polite"
                    className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{message.text}</span>
                    </div>
                    <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600" aria-label="Đóng thông báo">
                        &times;
                    </button>
                </div>
            )}

            {/* KPI Summary Metrics Component */}
            <CompanyInternMetrics
                total={metrics.total}
                inProgress={metrics.inProgress}
                unassignedMentor={metrics.unassignedMentor}
                completed={metrics.completed}
            />

            {/* Multi-Dimensional Filter Bar Component */}
            <CompanyInternFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedAcademicYear={selectedAcademicYear}
                academicYearsList={academicYearsList}
                onAcademicYearChange={handleAcademicYearChange}
                selectedTermId={selectedTermId}
                availableTermsList={availableTermsList}
                onTermChange={setSelectedTermId}
                selectedMentorId={selectedMentorId}
                mentorsList={mentorsList}
                unassignedCount={metrics.unassignedMentor}
                internsCountByMentor={(mentorId) => interns.filter((i) => i.mentorId === mentorId).length}
                onMentorChange={setSelectedMentorId}
                selectedJobTitle={selectedJobTitle}
                jobsList={jobsList}
                internsCountByJob={(job) => interns.filter((i) => i.jobTitle === job).length}
                onJobTitleChange={setSelectedJobTitle}
                selectedTimeline={selectedTimeline}
                onTimelineChange={setSelectedTimeline}
                totalCount={interns.length}
                filteredCount={filteredInterns.length}
                hasActiveFilters={hasActiveFilters}
                onResetFilters={resetFilters}
            />

            {/* Content Results */}
            {filteredInterns.length === 0 ? (
                <EmptyState
                    title={interns.length === 0 ? 'Chưa có thực tập sinh tiếp nhận' : 'Không tìm thấy kết quả phù hợp'}
                    description={
                        interns.length === 0
                            ? 'Doanh nghiệp chưa có sinh viên nào bắt đầu giai đoạn thực tập chính thức.'
                            : 'Thử thay đổi hoặc đặt lại bộ lọc để xem danh sách sinh viên khác.'
                    }
                    action={
                        hasActiveFilters ? (
                            <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2 gap-1.5">
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Đặt lại bộ lọc</span>
                            </Button>
                        ) : undefined
                    }
                />
            ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredInterns.map((intern) => (
                        <CompanyInternCard key={intern.id} intern={intern} />
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {groupedByMentor.map(([mentorKey, group]) => (
                        <div key={mentorKey} className="space-y-3">
                            <div className="flex items-center justify-between p-3.5 bg-slate-100/80 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-white rounded-lg text-slate-700 shadow-2xs">
                                        <UserCheck className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                            {group.mentorName}
                                            <Badge variant="brand" className="text-[10px] py-0 px-1.5">
                                                {group.items.length} sinh viên
                                            </Badge>
                                        </h2>
                                        {group.mentorEmail && (
                                            <p className="text-xs text-slate-500">{group.mentorEmail}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {group.items.map((intern) => (
                                    <Card key={intern.id} className="border-slate-200 hover:border-slate-300 shadow-2xs">
                                        <CardContent className="p-4 space-y-2.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-bold text-sm text-slate-900">{intern.studentName}</span>
                                                <StatusBadge status={intern.status} type="placement" />
                                            </div>

                                            <div className="text-xs text-slate-600 space-y-1">
                                                <p>
                                                    <span className="text-slate-400">MSSV:</span>{' '}
                                                    <span className="font-semibold text-slate-800">{intern.studentCode}</span>
                                                </p>
                                                <p>
                                                    <span className="text-slate-400">Vị trí:</span>{' '}
                                                    <span className="font-semibold text-blue-700">{intern.jobTitle}</span>
                                                </p>
                                                {intern.startDate && intern.endDate && (
                                                    <p className="text-[11px] text-slate-500">
                                                        {new Date(intern.startDate).toLocaleDateString('vi-VN')} – {new Date(intern.endDate).toLocaleDateString('vi-VN')}
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
