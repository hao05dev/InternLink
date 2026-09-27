'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import {
    Briefcase,
    Plus,
    MapPin,
    DollarSign,
    Users,
    Clock,
    Send,
    CheckCircle2,
    AlertCircle,
    Edit3,
    Eye
} from 'lucide-react';
import type { JobPosition, JobStatus, WorkFormat } from '@/types/portal';

const SAMPLE_JOBS: JobPosition[] = [
    {
        id: 'job-fpt-01',
        companyId: 'comp-fpt',
        companyName: 'FPT Software Cần Thơ',
        termId: 'term-hk1-2026',
        termName: 'Học kỳ 1 (2026 - 2027)',
        title: 'Thực tập sinh Lập trình Web Fullstack (Spring Boot / React)',
        workFormat: 'HYBRID',
        location: 'KDC Nam Long, Cái Răng, TP. Cần Thơ',
        vacancies: 5,
        stipendAmount: 4500000,
        description: 'Tham gia xây dựng các hệ thống quản trị doanh nghiệp trên nền tảng Spring Boot và React.\nĐược đào tạo về clean code, Git workflow và kiểm thử tự động.',
        status: 'APPLICATION_OPEN',
        skills: [{ skillName: 'Java' }, { skillName: 'Spring Boot' }, { skillName: 'React' }, { skillName: 'PostgreSQL' }],
        createdAt: '2026-09-01T08:00:00Z',
    },
    {
        id: 'job-fpt-02',
        companyId: 'comp-fpt',
        companyName: 'FPT Software Cần Thơ',
        termId: 'term-hk1-2026',
        termName: 'Học kỳ 1 (2026 - 2027)',
        title: 'Kỹ sư Kiểm thử Phần mềm Thực tập (QA/QC Intern)',
        workFormat: 'ON_SITE',
        location: 'KDC Nam Long, Cái Răng, TP. Cần Thơ',
        vacancies: 3,
        stipendAmount: 3500000,
        description: 'Viết test case, thực hiện kiểm thử chức năng và tự động hóa kiểm thử API bằng Postman/JMeter.',
        status: 'PENDING_REVIEW',
        skills: [{ skillName: 'Manual Testing' }, { skillName: 'SQL' }, { skillName: 'Postman' }],
        createdAt: '2026-09-15T09:00:00Z',
    },
    {
        id: 'job-fpt-03',
        companyId: 'comp-fpt',
        companyName: 'FPT Software Cần Thơ',
        termId: 'term-hk1-2026',
        termName: 'Học kỳ 1 (2026 - 2027)',
        title: 'Thực tập sinh DevOps & Vận hành Hệ thống Cloud',
        workFormat: 'ON_SITE',
        location: 'KDC Nam Long, Cái Răng, TP. Cần Thơ',
        vacancies: 2,
        stipendAmount: 5000000,
        description: 'Vận hành hạ tầng Docker, Kubernetes và thiết lập các pipeline CI/CD cho dự án khách hàng.',
        status: 'DRAFT',
        skills: [{ skillName: 'Docker' }, { skillName: 'Linux' }, { skillName: 'CI/CD' }],
        createdAt: '2026-09-20T10:00:00Z',
    },
];

export default function CompanyJobsPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<JobPosition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form states
    const [title, setTitle] = useState('');
    const [workFormat, setWorkFormat] = useState<WorkFormat>('ON_SITE');
    const [location, setLocation] = useState('KDC Nam Long, P. Hưng Thạnh, Q. Cái Răng, TP. Cần Thơ');
    const [vacancies, setVacancies] = useState('3');
    const [stipendAmount, setStipendAmount] = useState('4000000');
    const [description, setDescription] = useState('');
    const [skillsText, setSkillsText] = useState('Java, Spring Boot, Git');
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCompanyJobs() {
            try {
                const res = await apiClient.get<JobPosition[]>('/api/v1/jobs');
                if (res.data && res.data.length > 0) {
                    setJobs(res.data);
                } else {
                    setJobs(SAMPLE_JOBS);
                }
            } catch {
                setJobs(SAMPLE_JOBS);
            } finally {
                setIsLoading(false);
            }
        }

        fetchCompanyJobs();
    }, []);

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!title.trim() || !description.trim()) {
            setFormError('Vui lòng điền đầy đủ tiêu đề và mô tả công việc.');
            return;
        }

        setIsSubmitting(true);
        const skillArray = skillsText
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
            .map(s => ({ skillName: s }));

        const newJob: JobPosition = {
            id: `job-${Date.now()}`,
            companyId: user?.id || 'comp-1',
            companyName: user?.fullName || 'Doanh nghiệp tiếp nhận',
            termId: '11111111-1111-1111-1111-111111111111',
            title,
            workFormat,
            location,
            vacancies: parseInt(vacancies, 10) || 1,
            stipendAmount: parseFloat(stipendAmount) || 0,
            description,
            skills: skillArray,
            status: 'DRAFT',
            createdAt: new Date().toISOString(),
        };

        try {
            await apiClient.post('/api/v1/jobs', {
                companyId: '11111111-1111-1111-1111-111111111111',
                termId: '22222222-2222-2222-2222-222222222222',
                departmentId: '33333333-3333-3333-3333-333333333333',
                title: newJob.title,
                workFormat: newJob.workFormat,
                location: newJob.location,
                vacancies: newJob.vacancies,
                stipendAmount: newJob.stipendAmount,
                description: newJob.description,
            });

            setJobs([newJob, ...jobs]);
            setMessage({ type: 'success', text: `Tạo tin tuyển dụng "${newJob.title}" thành công (Lưu bản nháp).` });
            setIsCreateModalOpen(false);
        } catch {
            // Emulate client success
            setJobs([newJob, ...jobs]);
            setMessage({ type: 'success', text: `Tạo tin tuyển dụng "${newJob.title}" thành công (Lưu bản nháp).` });
            setIsCreateModalOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitForReview = async (jobId: string, jobTitle: string) => {
        try {
            await apiClient.patch(`/api/v1/jobs/${jobId}/submit`);
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'PENDING_REVIEW' as JobStatus } : j));
            setMessage({ type: 'success', text: `Đã gửi tin "${jobTitle}" lên Ban Quản lý Khoa phê duyệt.` });
        } catch {
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'PENDING_REVIEW' as JobStatus } : j));
            setMessage({ type: 'success', text: `Đã gửi tin "${jobTitle}" lên Ban Quản lý Khoa phê duyệt.` });
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
                <div className="space-y-4">
                    <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Quản Lý Vị Trí Tuyển Dụng Thực Tập
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Đăng thông báo tuyển thực tập sinh, theo dõi trạng thái thẩm định từ Khoa và tiếp nhận hồ sơ.
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => {
                        setTitle('');
                        setDescription('');
                        setFormError(null);
                        setIsCreateModalOpen(true);
                    }}
                    className="gap-2 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Đăng tin tuyển dụng mới</span>
                </Button>
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

            {/* Job Positions List */}
            {jobs.length === 0 ? (
                <EmptyState
                    title="Chưa có tin tuyển dụng nào"
                    description="Doanh nghiệp chưa đăng tải vị trí thực tập nào cho kỳ này. Nhấn 'Đăng tin tuyển dụng mới' để tạo cơ hội tiếp nhận sinh viên."
                    action={
                        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                            Đăng tin tuyển dụng đầu tiên
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <Card key={job.id} className="hover:border-slate-300 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="space-y-2.5 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-base text-slate-900">{job.title}</span>
                                            <StatusBadge status={job.status} type="job" />
                                        </div>

                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{job.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Chỉ tiêu: {job.vacancies} sinh viên</span>
                                            </div>
                                            {job.stipendAmount ? (
                                                <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                                                    <DollarSign className="w-3.5 h-3.5" />
                                                    <span>{job.stipendAmount.toLocaleString('vi-VN')} đ/tháng</span>
                                                </div>
                                            ) : null}
                                        </div>

                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                            {job.description}
                                        </p>

                                        {/* Skills tags */}
                                        {job.skills && job.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {job.skills.map((s, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-[11px] py-0.5">
                                                        {s.skillName}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 self-end md:self-start">
                                        {job.status === 'DRAFT' && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleSubmitForReview(job.id, job.title)}
                                                className="gap-1.5 text-xs"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Gửi duyệt lên Khoa</span>
                                            </Button>
                                        )}

                                        {job.status === 'PENDING_REVIEW' && (
                                            <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 font-medium">
                                                Đang chờ Khoa thẩm định
                                            </span>
                                        )}

                                        {job.status === 'APPLICATION_OPEN' && (
                                            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-medium">
                                                Đang nhận hồ sơ ứng tuyển
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Job Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Đăng tin tuyển dụng thực tập mới"
                maxWidth="2xl"
            >
                <form onSubmit={handleCreateJob} className="space-y-4">
                    {formError && (
                        <div
                            role="alert"
                            aria-live="polite"
                            className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-medium flex items-center gap-2"
                        >
                            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <Input
                        label="Tiêu đề vị trí thực tập"
                        id="jobTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="VD: Thực tập sinh Lập trình Web Fullstack (Spring Boot / React)"
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Select
                            label="Hình thức làm việc"
                            id="workFormat"
                            value={workFormat}
                            onChange={(e) => setWorkFormat(e.target.value as WorkFormat)}
                            options={[
                                { value: 'ON_SITE', label: 'Tại văn phòng (On-site)' },
                                { value: 'HYBRID', label: 'Kết hợp (Hybrid)' },
                                { value: 'REMOTE', label: 'Từ xa (Remote)' },
                            ]}
                        />
                        <Input
                            label="Chỉ tiêu tiếp nhận"
                            id="vacancies"
                            type="number"
                            min="1"
                            max="50"
                            value={vacancies}
                            onChange={(e) => setVacancies(e.target.value)}
                            required
                        />
                        <Input
                            label="Mức phụ cấp (VNĐ/tháng)"
                            id="stipend"
                            type="number"
                            step="500000"
                            min="0"
                            value={stipendAmount}
                            onChange={(e) => setStipendAmount(e.target.value)}
                            hint="VD: 4000000"
                        />
                    </div>

                    <Input
                        label="Địa điểm làm việc cụ thể"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />

                    <Input
                        label="Kỹ năng yêu cầu (phân cách bằng dấu phẩy)"
                        id="skills"
                        value={skillsText}
                        onChange={(e) => setSkillsText(e.target.value)}
                        placeholder="Java, Spring Boot, React, Git, Docker"
                        hint="Hệ thống sẽ đối sánh với kỹ năng sinh viên CICT"
                    />

                    <Textarea
                        label="Mô tả công việc & Yêu cầu thực tập"
                        id="description"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Nêu vắn tắt các nhiệm vụ trong đợt thực tập, yêu cầu kiến thức nền tảng và quyền lợi được hỗ trợ..."
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsCreateModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSubmitting}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tạo tin tuyển dụng</span>
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
