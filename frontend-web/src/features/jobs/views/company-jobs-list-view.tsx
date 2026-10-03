'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { JobPosition } from '@/features/jobs/types/job.types';
import { CompanyJobStats } from '../components/company/company-job-stats';
import { CompanyJobFilter } from '../components/company/company-job-filter';
import { CompanyJobsTable } from '../components/company/company-jobs-table';

export function CompanyJobsListView() {
    const [jobs, setJobs] = useState<JobPosition[]>([]);
    const [terms, setTerms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTermId, setSelectedTermId] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const [jobsRes, termsRes] = await Promise.all([
                    apiClient.get<JobPosition[]>('/api/v1/jobs'),
                    apiClient.get<any[]>('/api/v1/terms/active').catch(() => ({ data: [] })),
                ]);
                setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
                setTerms(Array.isArray(termsRes.data) ? termsRes.data : []);
            } catch {
                setJobs([]);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const handleSubmitReview = async (jobId: string, jobTitle: string, isClosed?: boolean) => {
        if (isClosed) {
            setMessage({ type: 'error', text: 'Kỳ thực tập của vị trí này đã kết thúc (CLOSED). Không thể gửi duyệt.' });
            return;
        }
        setIsSubmittingReview(true);
        try {
            await apiClient.patch(`/api/v1/jobs/${jobId}/submit`);
            setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'PENDING_REVIEW' } : j)));
            setMessage({ type: 'success', text: `Đã gửi tin "${jobTitle}" lên Ban Quản lý Khoa phê duyệt.` });
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Không thể gửi tin tuyển dụng lên Khoa.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const filteredJobs = jobs.filter((job) => {
        const matchesTerm = selectedTermId === 'ALL' || job.termId === selectedTermId;
        const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q || job.title?.toLowerCase().includes(q) || job.location?.toLowerCase().includes(q);
        return matchesTerm && matchesStatus && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-6xl animate-pulse">
                <div className="h-8 bg-slate-200 rounded w-1/4" />
                <div className="h-20 bg-slate-100 rounded-xl" />
                <div className="h-64 bg-slate-100 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Quản Lý Vị Trí Tuyển Dụng Thực Tập
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Đăng thông báo tuyển thực tập sinh, theo dõi trạng thái thẩm định từ Khoa và tiếp nhận hồ sơ.
                    </p>
                </div>
                <Link href="/company/jobs/new">
                    <Button variant="primary" className="gap-2 text-xs">
                        <Plus className="w-4 h-4" />
                        <span>Đăng tin tuyển dụng mới</span>
                    </Button>
                </Link>
            </div>

            <CompanyJobStats jobs={jobs} />

            {message && (
                <div className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-medium ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{message.text}</span>
                    </div>
                    <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600 text-base">&times;</button>
                </div>
            )}

            <CompanyJobFilter
                terms={terms}
                selectedTermId={selectedTermId}
                onTermChange={setSelectedTermId}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <CompanyJobsTable
                jobs={filteredJobs}
                onSubmitReview={handleSubmitReview}
                isSubmittingReview={isSubmittingReview}
            />
        </div>
    );
}
