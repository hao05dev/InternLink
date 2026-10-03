'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus } from 'lucide-react';
import { JobPosition } from '@/features/jobs/types/job.types';
import { CompanyJobCard } from './company-job-card';

interface CompanyJobsTableProps {
    jobs: JobPosition[];
    onSubmitReview: (jobId: string, title: string, isClosed?: boolean) => void;
    isSubmittingReview?: boolean;
}

export function CompanyJobsTable({ jobs, onSubmitReview, isSubmittingReview }: CompanyJobsTableProps) {
    if (jobs.length === 0) {
        return (
            <EmptyState
                title="Chưa có tin tuyển dụng nào"
                description="Doanh nghiệp chưa đăng tải vị trí thực tập nào phù hợp với bộ lọc hiện tại. Nhấn 'Đăng tin tuyển dụng mới' để tạo vị trí tiếp nhận sinh viên."
                action={
                    <Link href="/company/jobs/new">
                        <Button variant="primary" className="gap-2 text-xs">
                            <Plus className="w-4 h-4" />
                            <span>Đăng tin tuyển dụng mới</span>
                        </Button>
                    </Link>
                }
            />
        );
    }

    return (
        <div className="space-y-3">
            {jobs.map((job) => (
                <CompanyJobCard
                    key={job.id}
                    job={job}
                    onSubmitReview={onSubmitReview}
                    isSubmittingReview={isSubmittingReview}
                />
            ))}
        </div>
    );
}
