"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    Building2, MapPin, DollarSign, Users, Calendar, 
    Share2, Bookmark, CheckCircle2, ChevronRight, Briefcase, 
    GraduationCap, Award, ExternalLink, ArrowLeft, Send, AlertCircle, Check,
    Paperclip, Download, FileText, FileSpreadsheet, FileArchive, Image as ImageIcon
} from "lucide-react";
import { jobService } from "@/features/jobs/services/job.service";
import { JobPosition } from "@/features/jobs/types/job.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { PublicShell } from "@/components/layouts/public-shell";
import { apiClient } from "@/lib/api-client";
import { StudentProfile } from "@/features/profiles/types/profile.types";

export default function JobDetailView({ id }: { id: string }) {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [job, setJob] = useState<JobPosition | null>(null);
    const [relatedJobs, setRelatedJobs] = useState<JobPosition[]>([]);
    const [loading, setLoading] = useState(true);
    const [isApplied, setIsApplied] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [coverLetter, setCoverLetter] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);
    const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
    const [applyError, setApplyError] = useState<string | null>(null);

    const jobId = id;

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        jobService.getJobById(jobId)
            .then(data => {
                if (mounted) {
                    setJob(data);
                    jobService.getAllJobs().then(all => {
                        if (mounted) {
                            setRelatedJobs(all.filter(j => j.id !== jobId).slice(0, 3));
                        }
                    });
                    setLoading(false);
                }
            })
            .catch(() => {
                if (mounted) setLoading(false);
            });

        if (isAuthenticated && user?.role === "STUDENT") {
            apiClient.get<StudentProfile>("/api/v1/students/me/profile")
                .then(res => {
                    if (mounted && res.data) {
                        setStudentProfile(res.data);
                    }
                })
                .catch(() => {});
        }

        return () => { mounted = false; };
    }, [jobId, isAuthenticated, user?.role]);

    const formatCurrency = (amount?: number) => {
        if (!amount || amount === 0) return "Thương lượng / Phụ cấp theo dự án";
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount) + " / tháng";
    };

    const handleCopyLink = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleApplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApplyError(null);

        if (!studentProfile?.cvDocumentId) {
            setApplyError("Bạn chưa tải lên CV trong hồ sơ sinh viên. Vui lòng cập nhật CV tại trang Hồ sơ cá nhân trước khi nộp đơn.");
            return;
        }

        setIsSubmitting(true);
        try {
            await jobService.applyJob({
                jobId: job!.id,
                submittedCvDocumentId: studentProfile.cvDocumentId,
                coverLetter: coverLetter.trim() || undefined,
            });
            setIsApplied(true);
            setShowApplyModal(false);
        } catch (err: any) {
            setApplyError(err?.message || "Không thể nộp hồ sơ ứng tuyển. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <PublicShell>
                <div className="min-h-screen bg-slate-50 py-12">
                    <div className="max-w-6xl mx-auto px-4 space-y-6 animate-pulse">
                        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                        <div className="h-48 bg-slate-200 rounded-2xl"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl"></div>
                            <div className="h-96 bg-slate-200 rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </PublicShell>
        );
    }

    if (!job) {
        return (
            <PublicShell>
                <div className="min-h-screen bg-slate-50 py-16 text-center">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy vị trí tuyển dụng</h2>
                    <p className="text-sm text-slate-500 mb-6">Vị trí này có thể đã kết thúc thời hạn nhận hồ sơ.</p>
                    <Link href="/jobs">
                        <Button variant="default">
                            Quay lại danh sách việc làm
                        </Button>
                    </Link>
                </div>
            </PublicShell>
        );
    }

    return (
        <PublicShell>
            <div className="min-h-screen bg-slate-50/70 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Breadcrumbs Navigation */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Link href="/jobs" className="hover:text-sky-700 flex items-center gap-1 transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Danh sách vị trí thực tập
                        </Link>
                        <span>/</span>
                        <span className="text-slate-700 font-medium truncate max-w-md">{job.title}</span>
                    </div>

                    {/* TOP HEADER CARD */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-14 h-14 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center p-2.5 shrink-0">
                                    <Building2 className="w-8 h-8 text-sky-700" />
                                </div>
                                <div>
                                    <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                                        <span>{job.companyName || "Doanh nghiệp tiếp nhận"}</span>
                                    </h2>
                                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{job.location}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleCopyLink}
                                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer relative"
                                    title="Chia sẻ liên kết"
                                    aria-label="Chia sẻ liên kết"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Job Title */}
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-6">
                            {job.title}
                        </h1>

                        {/* 4-Item Metadata Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-100 mb-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                    Mức phụ cấp
                                </div>
                                <div className="text-sm font-bold text-emerald-700">
                                    {formatCurrency(job.stipendAmount)}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                    <MapPin className="w-4 h-4 text-sky-600" />
                                    Địa điểm làm việc
                                </div>
                                <div className="text-sm font-bold text-slate-800">
                                    {job.location}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                    <Users className="w-4 h-4 text-indigo-600" />
                                    Chỉ tiêu tuyển dụng
                                </div>
                                <div className="text-sm font-bold text-slate-800">
                                    {job.vacancies} sinh viên
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                    <Calendar className="w-4 h-4 text-amber-600" />
                                    Hình thức làm việc
                                </div>
                                <div className="text-sm font-bold text-slate-800">
                                    {job.workFormat || "Tại văn phòng"}
                                </div>
                            </div>
                        </div>

                        {/* Primary Call to Action Button */}
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            {isApplied ? (
                                <div className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    Bạn đã nộp hồ sơ ứng tuyển vị trí này thành công
                                </div>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            router.push(`/login?redirect=/jobs/${job.id}`);
                                        } else {
                                            setShowApplyModal(true);
                                        }
                                    }}
                                    className="w-full sm:w-auto flex-1 font-bold py-3.5 px-8 rounded-xl shadow-xs text-sm cursor-pointer"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Ứng tuyển ngay
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => setSaved(!saved)}
                                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold text-sm cursor-pointer"
                            >
                                <Bookmark className="w-4 h-4 mr-1.5 text-slate-400" />
                                {saved ? "Đã lưu vị trí" : "Lưu vào danh sách"}
                            </Button>
                        </div>
                    </div>

                    {/* MAIN CONTENT 2-COLUMN LAYOUT */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT COLUMN: Detailed Description */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Optional Recruitment Banner / Poster */}
                            {job.bannerUrl && (
                                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs max-h-96">
                                    <img 
                                        src={job.bannerUrl} 
                                        alt={job.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Mô tả công việc */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <Briefcase className="w-5 h-5 text-sky-700" />
                                    Mô tả công việc & Nhiệm vụ thực tập
                                </h3>
                                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                    {job.description || "Chưa có mô tả chi tiết cho vị trí này."}
                                </div>
                            </div>

                            {/* Downloadable Attachments (JD, Company profile, Test guideline) */}
                            {job.attachmentUrls && job.attachmentUrls.length > 0 && (
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                                        <Paperclip className="w-5 h-5 text-sky-700" />
                                        Tài liệu đính kèm ({job.attachmentUrls.length})
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {job.attachmentUrls.map((att) => {
                                            const ext = att.fileType?.toLowerCase() || att.fileName.split('.').pop()?.toLowerCase() || '';
                                            return (
                                                <a
                                                    key={att.id}
                                                    href={att.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-sky-300 bg-slate-50/50 hover:bg-sky-50/30 transition-all group cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 pr-2">
                                                        <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs group-hover:border-sky-200">
                                                            {ext.includes('pdf') ? (
                                                                <FileText className="w-4 h-4 text-rose-600" />
                                                            ) : ext.includes('xls') ? (
                                                                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                                            ) : ext.includes('zip') || ext.includes('rar') ? (
                                                                <FileArchive className="w-4 h-4 text-amber-600" />
                                                            ) : (
                                                                <FileText className="w-4 h-4 text-sky-600" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-sky-700">
                                                                {att.fileName}
                                                            </p>
                                                            {att.fileSize && (
                                                                <span className="text-[11px] text-slate-400">
                                                                    {att.fileSize}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 group-hover:text-sky-600 group-hover:border-sky-300">
                                                        <Download className="w-3.5 h-3.5" />
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Yêu cầu năng lực */}
                            {job.requirements && job.requirements.length > 0 && (
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                                        <GraduationCap className="w-5 h-5 text-sky-700" />
                                        Yêu cầu năng lực & Kiến thức
                                    </h3>
                                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                                        {job.requirements.map((req, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-2 shrink-0"></span>
                                                <span>{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Chuẩn đầu ra CLO (nếu có) */}
                            {job.targetLearningOutcomes && job.targetLearningOutcomes.length > 0 && (
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                                        <Award className="w-5 h-5 text-indigo-700" />
                                        Chuẩn đầu ra học phần đáp ứng (CLO)
                                    </h3>
                                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                                        {job.targetLearningOutcomes.map((clo) => (
                                            <li key={clo} className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                <span>{clo}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Kỹ năng công nghệ */}
                            {job.skills && job.skills.length > 0 && (
                                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
                                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                                        <Award className="w-5 h-5 text-sky-700" />
                                        Kỹ năng chuyên môn
                                    </h3>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {job.skills.map((skill) => (
                                            <span 
                                                key={skill.skillName || skill.skillId}
                                                className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                                            >
                                                {skill.skillName || skill.skillId}
                                                {skill.isRequired && <span className="text-rose-600 ml-1" title="Bắt buộc">*</span>}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Company Profile & Related Jobs */}
                        <div className="space-y-6">
                            {/* Company Summary */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                                <h4 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-sky-700" />
                                    Đơn vị tiếp nhận
                                </h4>

                                <div className="space-y-3 text-xs text-slate-600">
                                    <div>
                                        <span className="text-slate-400 block mb-0.5">Tên doanh nghiệp:</span>
                                        <span className="font-bold text-slate-900 block">{job.companyName || "Đang cập nhật"}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block mb-0.5">Địa chỉ:</span>
                                        <span className="font-semibold text-slate-800 block">{job.companyAddress || job.location}</span>
                                    </div>
                                </div>

                                {job.companyWebsite && (
                                    <div className="pt-3 border-t border-slate-100">
                                        <a 
                                            href={job.companyWebsite.startsWith("http") ? job.companyWebsite : `https://${job.companyWebsite}`}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center justify-between group"
                                        >
                                            <span>Xem website doanh nghiệp</span>
                                            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Related Jobs */}
                            {relatedJobs.length > 0 && (
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                                        Vị trí thực tập khác
                                    </h4>

                                    <div className="space-y-3">
                                        {relatedJobs.map(rel => (
                                            <Link 
                                                key={rel.id} 
                                                href={`/jobs/${rel.id}`}
                                                className="block p-3 rounded-xl border border-slate-100 hover:border-sky-300 hover:bg-slate-50/50 transition-all group"
                                            >
                                                <h5 className="text-xs font-bold text-slate-800 group-hover:text-sky-700 line-clamp-2 transition-colors mb-1.5">
                                                    {rel.title}
                                                </h5>
                                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                                    <span className="font-semibold text-emerald-700">
                                                        {rel.stipendAmount ? new Intl.NumberFormat("vi-VN").format(rel.stipendAmount) + " đ" : "Thỏa thuận"}
                                                    </span>
                                                    <span>{rel.location}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* APPLY MODAL */}
                {showApplyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Nộp hồ sơ ứng tuyển thực tập</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{job.title}</p>
                                </div>
                                <button 
                                    onClick={() => setShowApplyModal(false)}
                                    className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
                                    aria-label="Đóng"
                                >
                                    &times;
                                </button>
                            </div>

                            {applyError && (
                                <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                    <span>{applyError}</span>
                                </div>
                            )}

                            {!studentProfile?.cvDocumentId && (
                                <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-2">
                                    <p className="font-semibold">Bạn chưa có tệp CV trong hồ sơ cá nhân</p>
                                    <p>Để ứng tuyển vị trí này, bạn cần tải lên CV tại trang Hồ sơ sinh viên.</p>
                                    <Link href="/student/profile">
                                        <Button size="sm" variant="outline" className="text-xs mt-1">
                                            Đến trang Cập nhật Hồ sơ & CV
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            <form onSubmit={handleApplySubmit} className="space-y-4">
                                <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-900 space-y-1">
                                    <div className="font-semibold">Ứng viên: {user?.fullName || "Sinh viên"}</div>
                                    <div className="text-sky-700">Email: {user?.email}</div>
                                    {studentProfile?.cvFileName && (
                                        <div className="text-emerald-700 font-medium pt-1 flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                            CV đính kèm: {studentProfile.cvFileName}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Thư giới thiệu & Mục tiêu thực tập
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                        placeholder="Nêu ngắn gọn định hướng chuyên môn, kinh nghiệm đồ án và nguyện vọng thực tập tại doanh nghiệp..."
                                        className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <Button 
                                        type="button"
                                        variant="outline" 
                                        onClick={() => setShowApplyModal(false)}
                                        className="text-xs cursor-pointer"
                                    >
                                        Hủy bỏ
                                    </Button>
                                    <Button 
                                        type="submit"
                                        disabled={isSubmitting || !studentProfile?.cvDocumentId}
                                        variant="primary"
                                        className="text-xs font-semibold cursor-pointer"
                                    >
                                        {isSubmitting ? "Đang gửi..." : "Xác nhận nộp hồ sơ"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </PublicShell>
    );
}
