'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import {
    GraduationCap,
    UserCheck,
    Calendar,
    CheckCircle2,
    Users,
    Search,
    Filter,
    Briefcase,
    Building2,
    UserX,
    Clock,
    RotateCcw,
    Layers,
    Mail,
    Phone,
    LayoutGrid,
    ListFilter
} from 'lucide-react';
import type { InternshipPlacement } from '@/features/placements/types/placement.types';

export default function CompanyInternsView() {
    const [interns, setInterns] = useState<InternshipPlacement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
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
                    text: error instanceof Error ? error.message : 'Không tải được danh sách thực tập sinh.'
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchInterns();
    }, []);

    // Extract unique filter options from real data
    const termsList = useMemo(() => {
        const map = new Map<string, string>();
        interns.forEach((item) => {
            if (item.termId && item.termName) {
                const label = item.academicYear ? `${item.termName} (${item.academicYear})` : item.termName;
                map.set(item.termId, label);
            }
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [interns]);

    const mentorsList = useMemo(() => {
        const map = new Map<string, { id: string; name: string; email?: string }>();
        interns.forEach((item) => {
            if (item.mentorId && item.mentorName) {
                map.set(item.mentorId, {
                    id: item.mentorId,
                    name: item.mentorName,
                    email: item.mentorEmail
                });
            }
        });
        return Array.from(map.values());
    }, [interns]);

    const jobsList = useMemo(() => {
        const set = new Set<string>();
        interns.forEach((item) => {
            if (item.jobTitle) {
                set.add(item.jobTitle.trim());
            }
        });
        return Array.from(set).sort();
    }, [interns]);

    // KPI Summary Metrics
    const metrics = useMemo(() => {
        const total = interns.length;
        const inProgress = interns.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'ACTIVE').length;
        const unassignedMentor = interns.filter((i) => !i.mentorId && !i.mentorName).length;
        const completed = interns.filter((i) => i.status === 'COMPLETED').length;
        return { total, inProgress, unassignedMentor, completed };
    }, [interns]);

    // Filter Logic
    const filteredInterns = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const now = new Date();

        return interns.filter((intern) => {
            // Search Match
            if (query) {
                const nameMatch = intern.studentName?.toLowerCase().includes(query);
                const codeMatch = intern.studentCode?.toLowerCase().includes(query);
                const emailMatch = intern.studentEmail?.toLowerCase().includes(query);
                const jobMatch = intern.jobTitle?.toLowerCase().includes(query);
                const mentorMatch = intern.mentorName?.toLowerCase().includes(query);
                if (!nameMatch && !codeMatch && !emailMatch && !jobMatch && !mentorMatch) {
                    return false;
                }
            }

            // Term Match
            if (selectedTermId !== 'ALL' && intern.termId !== selectedTermId) {
                return false;
            }

            // Mentor Match
            if (selectedMentorId === 'UNASSIGNED') {
                if (intern.mentorId || intern.mentorName) return false;
            } else if (selectedMentorId !== 'ALL' && intern.mentorId !== selectedMentorId) {
                return false;
            }

            // Job Title Match
            if (selectedJobTitle !== 'ALL' && intern.jobTitle !== selectedJobTitle) {
                return false;
            }

            // Status Match
            if (selectedStatus !== 'ALL' && intern.status !== selectedStatus) {
                return false;
            }

            // Timeline Phase Match
            if (selectedTimeline !== 'ALL') {
                if (!intern.startDate || !intern.endDate) return false;
                const start = new Date(intern.startDate);
                const end = new Date(intern.endDate);

                if (selectedTimeline === 'ONGOING') {
                    if (now < start || now > end) return false;
                } else if (selectedTimeline === 'ENDING_SOON') {
                    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysLeft < 0 || daysLeft > 14) return false;
                } else if (selectedTimeline === 'FINISHED') {
                    if (now <= end) return false;
                } else if (selectedTimeline === 'UPCOMING') {
                    if (now >= start) return false;
                }
            }

            return true;
        });
    }, [interns, searchQuery, selectedTermId, selectedMentorId, selectedJobTitle, selectedStatus, selectedTimeline]);

    // Grouping by Mentor for Group View
    const groupedByMentor = useMemo(() => {
        const groups: { [key: string]: { mentorName: string; mentorEmail?: string; mentorPhone?: string; items: InternshipPlacement[] } } = {};

        // Special bucket for unassigned
        groups['unassigned'] = {
            mentorName: 'Chưa phân công Mentor',
            items: []
        };

        mentorsList.forEach((m) => {
            groups[m.id] = {
                mentorName: m.name,
                mentorEmail: m.email,
                items: []
            };
        });

        filteredInterns.forEach((intern) => {
            if (!intern.mentorId && !intern.mentorName) {
                groups['unassigned'].items.push(intern);
            } else if (intern.mentorId && groups[intern.mentorId]) {
                groups[intern.mentorId].items.push(intern);
            } else {
                const key = intern.mentorName || 'other';
                if (!groups[key]) {
                    groups[key] = { mentorName: intern.mentorName || 'Khác', items: [] };
                }
                groups[key].items.push(intern);
            }
        });

        return Object.entries(groups).filter(([_, g]) => g.items.length > 0);
    }, [filteredInterns, mentorsList]);

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedTermId('ALL');
        setSelectedMentorId('ALL');
        setSelectedJobTitle('ALL');
        setSelectedStatus('ALL');
        setSelectedTimeline('ALL');
    };

    const hasActiveFilters =
        searchQuery ||
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
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Quản Lý Thực Tập Sinh Tại Doanh Nghiệp
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Theo dõi tiến độ, tin tuyển dụng trúng tuyển, phân bổ Cán bộ hướng dẫn (Mentor) và thời gian thực tập.
                    </p>
                </div>

                {/* View Switcher */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
                    <button
                        type="button"
                        onClick={() => setViewMode('cards')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            viewMode === 'cards'
                                ? 'bg-white text-slate-900 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Danh sách</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('by-mentor')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            viewMode === 'by-mentor'
                                ? 'bg-white text-slate-900 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
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

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <Card className="border-slate-200 bg-white">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Tổng thực tập sinh</p>
                            <p className="text-xl font-bold text-slate-900">{metrics.total}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Đang thực tập</p>
                            <p className="text-xl font-bold text-emerald-600">{metrics.inProgress}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                            <UserX className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Chưa có Mentor</p>
                            <p className="text-xl font-bold text-amber-600">{metrics.unassignedMentor}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 bg-white">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Đã hoàn thành</p>
                            <p className="text-xl font-bold text-indigo-600">{metrics.completed}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Filters Panel */}
            <Card className="border-slate-200 bg-slate-50/50">
                <CardContent className="p-4 md:p-5 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                            <Filter className="w-3.5 h-3.5 text-blue-600" />
                            <span>Bộ Lọc Nâng Cao</span>
                            {hasActiveFilters && (
                                <Badge variant="brand" className="text-[10px] px-1.5 py-0">
                                    Đang lọc: {filteredInterns.length}/{interns.length}
                                </Badge>
                            )}
                        </div>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span>Đặt lại bộ lọc</span>
                            </button>
                        )}
                    </div>

                    {/* Filter Controls Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                        {/* 1. Search Box */}
                        <div className="space-y-1 lg:col-span-2 xl:col-span-1">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                <Search className="w-3 h-3 text-slate-400" />
                                Tìm kiếm
                            </label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Tên, MSSV, Email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-9 text-xs pl-8 bg-white"
                                />
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        {/* 2. Term Filter */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-sky-600" />
                                Kỳ thực tập
                            </label>
                            <select
                                value={selectedTermId}
                                onChange={(e) => setSelectedTermId(e.target.value)}
                                className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                            >
                                <option value="ALL">Tất cả kỳ ({interns.length})</option>
                                {termsList.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Mentor Filter */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-emerald-600" />
                                Cán bộ hướng dẫn (Mentor)
                            </label>
                            <select
                                value={selectedMentorId}
                                onChange={(e) => setSelectedMentorId(e.target.value)}
                                className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                            >
                                <option value="ALL">Tất cả Mentor</option>
                                <option value="UNASSIGNED">⚠️ Chưa có Mentor ({metrics.unassignedMentor})</option>
                                {mentorsList.map((m) => {
                                    const count = interns.filter((i) => i.mentorId === m.id).length;
                                    return (
                                        <option key={m.id} value={m.id}>
                                            {m.name} ({count} SV)
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* 4. Job Position / Posting Filter */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                <Briefcase className="w-3 h-3 text-indigo-600" />
                                Tin tuyển dụng / Vị trí
                            </label>
                            <select
                                value={selectedJobTitle}
                                onChange={(e) => setSelectedJobTitle(e.target.value)}
                                className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                            >
                                <option value="ALL">Tất cả vị trí</option>
                                {jobsList.map((job) => {
                                    const count = interns.filter((i) => i.jobTitle === job).length;
                                    return (
                                        <option key={job} value={job}>
                                            {job} ({count})
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* 5. Timeline / Period Filter */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-purple-600" />
                                Giai đoạn thời gian
                            </label>
                            <select
                                value={selectedTimeline}
                                onChange={(e) => setSelectedTimeline(e.target.value)}
                                className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                            >
                                <option value="ALL">Tất cả thời gian</option>
                                <option value="ONGOING">Đang diễn ra</option>
                                <option value="ENDING_SOON">Sắp kết thúc (≤ 14 ngày)</option>
                                <option value="UPCOMING">Sắp bắt đầu</option>
                                <option value="FINISHED">Đã kết thúc</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Results */}
            {filteredInterns.length === 0 ? (
                <EmptyState
                    title={interns.length === 0 ? "Chưa có thực tập sinh tiếp nhận" : "Không tìm thấy kết quả phù hợp"}
                    description={
                        interns.length === 0
                            ? "Doanh nghiệp chưa có sinh viên nào bắt đầu giai đoạn thực tập chính thức."
                            : "Thử thay đổi hoặc đặt lại bộ lọc để xem danh sách sinh viên khác."
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
                /* Card List View */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredInterns.map((intern) => {
                        const now = new Date();
                        const start = intern.startDate ? new Date(intern.startDate) : null;
                        const end = intern.endDate ? new Date(intern.endDate) : null;
                        let progress = 0;
                        if (start && end && end > start) {
                            const total = end.getTime() - start.getTime();
                            const current = now.getTime() - start.getTime();
                            progress = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
                        }

                        return (
                            <Card key={intern.id} className="hover:border-slate-300 transition-all shadow-2xs hover:shadow-sm">
                                <CardContent className="p-5 space-y-4">
                                    {/* Student Info & Status */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center flex-wrap gap-2">
                                                <h2 className="font-bold text-base text-slate-900">
                                                    {intern.studentName}
                                                </h2>
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                                    MSSV: {intern.studentCode || 'N/A'}
                                                </span>
                                            </div>

                                            {(intern.studentEmail || intern.studentPhone) && (
                                                <div className="flex items-center flex-wrap gap-3 text-xs text-slate-500 pt-0.5">
                                                    {intern.studentEmail && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3 text-slate-400" />
                                                            {intern.studentEmail}
                                                        </span>
                                                    )}
                                                    {intern.studentPhone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3 text-slate-400" />
                                                            {intern.studentPhone}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <StatusBadge status={intern.status} type="placement" />
                                    </div>

                                    {/* Position & Job details */}
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                <Briefcase className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                                                <span className="font-medium text-slate-500">Vị trí trúng tuyển:</span>
                                            </div>
                                            {intern.source && (
                                                <Badge variant="outline" className="text-[10px] py-0">
                                                    {intern.source === 'PARTNER_PORTAL' ? 'Cổng CICT' : 'Tự liên hệ'}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center flex-wrap gap-2">
                                            <span className="font-bold text-sm text-slate-900">
                                                {intern.jobTitle || 'Chưa cập nhật vị trí'}
                                            </span>
                                            {intern.workFormat && (
                                                <Badge variant="brand" className="text-[10px] py-0">
                                                    {intern.workFormat}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mentors & Lecturer info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        {/* Mentor DN */}
                                        <div className="p-2.5 rounded-xl border border-slate-100 bg-white">
                                            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                                <UserCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                                <span className="font-semibold">Mentor Doanh Nghiệp:</span>
                                            </div>
                                            {intern.mentorName ? (
                                                <div>
                                                    <p className="font-bold text-slate-900">{intern.mentorName}</p>
                                                    {intern.mentorEmail && (
                                                        <p className="text-[11px] text-slate-500 truncate">{intern.mentorEmail}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-amber-600 font-semibold italic flex items-center gap-1">
                                                    <UserX className="w-3.5 h-3.5" />
                                                    Chưa phân công
                                                </span>
                                            )}
                                        </div>

                                        {/* Lecturer CICT */}
                                        <div className="p-2.5 rounded-xl border border-slate-100 bg-white">
                                            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                                <GraduationCap className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                                <span className="font-semibold">GVHD Khoa CICT:</span>
                                            </div>
                                            <p className="font-bold text-slate-900">
                                                {intern.lecturerName || 'Khoa đang chỉ định'}
                                            </p>
                                            <p className="text-[11px] text-slate-500">
                                                {intern.termName ? `${intern.termName}` : 'Kỳ thực tập'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Timeline & Progress */}
                                    {intern.startDate && intern.endDate && (
                                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                            <div className="flex items-center justify-between text-xs text-slate-600">
                                                <span className="flex items-center gap-1 font-medium">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {new Date(intern.startDate).toLocaleDateString('vi-VN')} –{' '}
                                                    {new Date(intern.endDate).toLocaleDateString('vi-VN')}
                                                </span>
                                                <span className="font-bold text-slate-700">{progress}% thời gian</span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all rounded-full ${
                                                        progress >= 100
                                                            ? 'bg-emerald-500'
                                                            : progress > 0
                                                            ? 'bg-blue-600'
                                                            : 'bg-slate-300'
                                                    }`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                /* Group by Mentor View */
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
                                                <span className="font-bold text-sm text-slate-900">
                                                    {intern.studentName}
                                                </span>
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
