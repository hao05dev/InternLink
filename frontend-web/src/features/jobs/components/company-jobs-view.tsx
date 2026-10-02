'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { RichEditor } from '@/components/ui/rich-editor';
import { FileUploader, UploadedFileItem } from '@/components/ui/file-uploader';
import { AcademicTermFilter } from '@/components/ui/academic-term-filter';
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
    Eye,
    Image,
    Paperclip
} from 'lucide-react';
import type { JobPosition, JobStatus, WorkFormat } from '@/features/jobs/types/recruitment.types';

export default function CompanyJobsView() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<JobPosition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Metadata states for real creation
    const [departments, setDepartments] = useState<any[]>([]);
    const [terms, setTerms] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [selectedTermId, setSelectedTermId] = useState('');
    const [selectedCompanyId, setSelectedCompanyId] = useState('');

    // Form states
    const [title, setTitle] = useState('');
    const [workFormat, setWorkFormat] = useState<WorkFormat>('ONSITE');
    const [location, setLocation] = useState('KDC Nam Long, P. Hưng Thạnh, Q. Cái Răng, TP. Cần Thơ');
    const [vacancies, setVacancies] = useState('3');
    const [stipendAmount, setStipendAmount] = useState('4000000');
    const [bannerUrl, setBannerUrl] = useState('');
    const [attachmentUrls, setAttachmentUrls] = useState<UploadedFileItem[]>([]);
    const [description, setDescription] = useState('');
    const [skillsText, setSkillsText] = useState('Java, Spring Boot, Git');
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCompanyJobs() {
            try {
                const res = await apiClient.get<JobPosition[]>('/api/v1/jobs');
                if (res.data && Array.isArray(res.data)) {
                    setJobs(res.data);
                } else {
                    setJobs([]);
                }
            } catch {
                setJobs([]);
            } finally {
                setIsLoading(false);
            }

            try {
                const [deptRes, compRes] = await Promise.all([
                    apiClient.get<any[]>('/api/v1/departments'),
                    apiClient.get<any[]>('/api/v1/companies'),
                ]);

                if (deptRes.data && Array.isArray(deptRes.data) && deptRes.data.length > 0) {
                    setDepartments(deptRes.data);
                    const defaultDept = deptRes.data[0].id;
                    setSelectedDeptId(defaultDept);

                    const termRes = await apiClient.get<any[]>(`/api/v1/terms/by-department/${defaultDept}`);
                    if (termRes.data && Array.isArray(termRes.data) && termRes.data.length > 0) {
                        setTerms(termRes.data);
                        setSelectedTermId(termRes.data[0].id);
                    }
                }

                if (compRes.data && Array.isArray(compRes.data) && compRes.data.length > 0) {
                    setCompanies(compRes.data);
                    setSelectedCompanyId(compRes.data[0].id);
                }
            } catch {
                // Metadata loading optional
            }
        }

        fetchCompanyJobs();
    }, []);

    const activeSelectedTerm = terms.find(t => t.id === (selectedTermId || terms[0]?.id));
    const isSelectedTermClosed = activeSelectedTerm?.status === 'CLOSED';

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (isSelectedTermClosed) {
            setFormError('Kỳ thực tập đã kết thúc (CLOSED). Không thể đăng tin tuyển dụng mới cho kỳ này.');
            return;
        }

        if (!title.trim() || !description.trim()) {
            setFormError('Vui lòng điền đầy đủ tiêu đề và mô tả công việc.');
            return;
        }

        const effectiveDeptId = selectedDeptId || departments[0]?.id;
        const effectiveTermId = selectedTermId || terms[0]?.id;
        const effectiveCompanyId = selectedCompanyId || companies[0]?.id;

        if (!effectiveDeptId || !effectiveTermId || !effectiveCompanyId) {
            setFormError('Không tìm thấy thông tin Khoa, Kỳ thực tập hoặc Doanh nghiệp hợp lệ.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await apiClient.post<JobPosition>('/api/v1/jobs', {
                companyId: effectiveCompanyId,
                departmentId: effectiveDeptId,
                termId: effectiveTermId,
                title: title.trim(),
                workFormat,
                location: location.trim(),
                vacancies: parseInt(vacancies, 10) || 1,
                stipendAmount: parseFloat(stipendAmount) || 0,
                bannerUrl: bannerUrl.trim() || undefined,
                attachmentUrls: attachmentUrls.length > 0 ? attachmentUrls : undefined,
                description: description.trim(),
                mandatorySkillIds: skillsText.split(',').map(s => s.trim()).filter(Boolean),
            });

            if (res.data) {
                setJobs(prev => [res.data, ...prev]);
            }
            setMessage({ type: 'success', text: `Tạo tin tuyển dụng "${title}" thành công (Lưu bản nháp).` });
            setIsCreateModalOpen(false);
            setTitle('');
            setDescription('');
            setBannerUrl('');
            setAttachmentUrls([]);
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo tin tuyển dụng.';
            setFormError(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitForReview = async (jobId: string, jobTitle: string, isTermClosed?: boolean) => {
        if (isTermClosed) {
            setMessage({ type: 'error', text: 'Kỳ thực tập của vị trí này đã kết thúc (CLOSED). Không thể gửi duyệt.' });
            return;
        }
        try {
            await apiClient.patch(`/api/v1/jobs/${jobId}/submit`);
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'PENDING_REVIEW' as JobStatus } : j));
            setMessage({ type: 'success', text: `Đã gửi tin "${jobTitle}" lên Ban Quản lý Khoa phê duyệt.` });
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Không thể gửi tin tuyển dụng lên Khoa.';
            setMessage({ type: 'error', text: errorMsg });
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
                        <Card key={job.id} className="hover:border-slate-300 transition-colors overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                                    {/* Optional Banner Thumbnail */}
                                    {job.bannerUrl && (
                                        <div className="w-full md:w-36 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                            <img
                                                src={job.bannerUrl}
                                                alt={job.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2.5 flex-1 min-w-0">
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

                                        {/* Skills tags & Attachments count */}
                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                            {job.skills && job.skills.length > 0 && job.skills.map((s, idx) => (
                                                <Badge key={idx} variant="outline" className="text-[11px] py-0.5">
                                                    {s.skillName}
                                                </Badge>
                                            ))}
                                            {job.attachmentUrls && job.attachmentUrls.length > 0 && (
                                                <span className="inline-flex items-center gap-1 text-[11px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                                                    <Paperclip className="w-3 h-3" />
                                                    {job.attachmentUrls.length} tệp đính kèm
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                                        {job.status === 'DRAFT' && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleSubmitForReview(job.id, job.title, job.termStatus === 'CLOSED')}
                                                disabled={job.termStatus === 'CLOSED'}
                                                title={job.termStatus === 'CLOSED' ? 'Kỳ thực tập đã kết thúc (CLOSED)' : undefined}
                                                className={`gap-1.5 text-xs ${job.termStatus === 'CLOSED' ? 'opacity-50 cursor-not-allowed' : ''}`}
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

                                        {job.termStatus === 'CLOSED' && (
                                            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium">
                                                Kỳ đã kết thúc (CLOSED)
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
                <form onSubmit={handleCreateJob} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
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

                    {/* Target Academic Term */}
                    {terms.length > 0 && (
                        <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-xs font-bold text-slate-700 block mb-2">Áp dụng cho Học kỳ & Năm học:</span>
                            <AcademicTermFilter
                                terms={terms}
                                selectedTermId={selectedTermId || terms[0]?.id}
                                onTermChange={setSelectedTermId}
                                variant="grid"
                                showStatusBadge={true}
                            />
                            {isSelectedTermClosed && (
                                <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Học kỳ này đã kết thúc (CLOSED). Không thể tạo tin tuyển dụng mới.</span>
                                </div>
                            )}
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
                                { value: 'ONSITE', label: 'Tại văn phòng (On-site)' },
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

                    {/* Banner Poster URL */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                            Poster / Banner tuyển dụng (Tùy chọn)
                        </label>
                        <Input
                            placeholder="https://images.unsplash.com/... hoặc link ảnh poster"
                            value={bannerUrl}
                            onChange={(e) => setBannerUrl(e.target.value)}
                        />
                        {bannerUrl && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 h-36 bg-slate-100">
                                <img
                                    src={bannerUrl}
                                    alt="Banner preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>

                    {/* Rich Editor for Description & Requirements */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                            Mô tả công việc & Yêu cầu chi tiết *
                        </label>
                        <RichEditor
                            value={description}
                            onChange={setDescription}
                            placeholder="Nhập mô tả công việc, quyền lợi, yêu cầu kỹ năng chi tiết (Hỗ trợ định dạng Markdown, danh sách, in đậm, link)..."
                            minHeight="200px"
                        />
                    </div>

                    {/* File Uploader for JD / Guidelines */}
                    <div className="space-y-1.5 pt-2">
                        <label className="block text-xs font-semibold text-slate-700">
                            Tài liệu đính kèm (JD chi tiết, Quy định tiếp nhận, Bài test mẫu)
                        </label>
                        <FileUploader
                            value={attachmentUrls}
                            onChange={setAttachmentUrls}
                            accept=".pdf,.docx,.xlsx,.zip"
                        />
                    </div>

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
                            disabled={isSubmitting || isSelectedTermClosed}
                            title={isSelectedTermClosed ? 'Học kỳ đã kết thúc (CLOSED)' : undefined}
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
