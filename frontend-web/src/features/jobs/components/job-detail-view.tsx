"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    Building2, MapPin, DollarSign, Users, Calendar, Clock, 
    Share2, Bookmark, CheckCircle2, ChevronRight, Briefcase, 
    GraduationCap, Award, ExternalLink, ArrowLeft, Send, AlertCircle
} from "lucide-react";
import { jobService } from "@/features/jobs/services/job.service";
import { JobPosition } from "@/features/jobs/types/job.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { PublicShell } from "@/components/layouts/public-shell";

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

    const jobId = id;

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        jobService.getJobById(jobId)
            .then(data => {
                if (mounted) {
                    setJob(data);
                    // Fetch related jobs
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
        return () => { mounted = false; };
    }, [jobId]);

    const formatCurrency = (amount?: number) => {
        if (!amount || amount === 0) return "Thương lượng / Phụ cấp theo dự án";
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount) + " / tháng";
    };

    const handleApplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsApplied(true);
            setShowApplyModal(false);
        }, 1000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 py-12">
                <div className="max-w-6xl mx-auto px-4 space-y-6 animate-pulse">
                    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-48 bg-slate-200 rounded-xl"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-96 bg-slate-200 rounded-xl"></div>
                        <div className="h-96 bg-slate-200 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-slate-50 py-16 text-center">
                <h2 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy vị trí tuyển dụng</h2>
                <p className="text-sm text-slate-500 mb-6">Vị trí này có thể đã kết thúc thời hạn nhận hồ sơ.</p>
                <Link href="/jobs">
                    <Button variant="default" className="bg-sky-700 hover:bg-sky-600">
                        Quay lại danh sách việc làm
                    </Button>
                </Link>
            </div>
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

                {/* ========================================================================= */}
                {/* 1. TOP HEADER CARD (EXACT LAYOUT FROM USER'S SCREENSHOT) */}
                {/* ========================================================================= */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                    {/* Top Row: Company logo + Company Name + Action Buttons */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2.5 shrink-0 shadow-xs">
                                <Building2 className="w-8 h-8 text-sky-700" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        {job.companyName}
                                    </span>
                                    <Badge variant="success" className="text-[10px] py-0 px-2 font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                                        Đã xác thực MOU
                                    </Badge>
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5">
                                    Đối tác chiến lược Khoa CNTT&TT - ĐH Cần Thơ
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setSaved(!saved)}
                                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                                    saved 
                                        ? "border-rose-200 bg-rose-50 text-rose-600" 
                                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                                }`}
                                title="Lưu tin tuyển dụng"
                            >
                                <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
                            </button>
                            <button 
                                onClick={() => {
                                    if (typeof window !== "undefined") {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert("Đã sao chép liên kết vào bộ nhớ tạm!");
                                    }
                                }}
                                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                                title="Chia sẻ liên kết"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Job Title */}
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-6">
                        {job.title}
                    </h1>

                    {/* 4-Item Metadata Grid (Salary, Location, Vacancies, Deadline) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-100 mb-6">
                        {/* 1. Mức lương / Phụ cấp */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                Mức phụ cấp
                            </div>
                            <div className="text-sm font-bold text-emerald-700">
                                {formatCurrency(job.stipendAmount)}
                            </div>
                        </div>

                        {/* 2. Địa điểm */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <MapPin className="w-4 h-4 text-sky-600" />
                                Địa điểm làm việc
                            </div>
                            <div className="text-sm font-bold text-slate-800">
                                {job.location}
                            </div>
                        </div>

                        {/* 3. Cần tuyển */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <Users className="w-4 h-4 text-indigo-600" />
                                Chỉ tiêu tuyển dụng
                            </div>
                            <div className="text-sm font-bold text-slate-800">
                                {job.vacancies} người <span className="text-xs font-normal text-slate-500">• {job.applicantCount || 0} đã nộp</span>
                            </div>
                        </div>

                        {/* 4. Hạn nộp */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <Calendar className="w-4 h-4 text-amber-600" />
                                Hạn nộp hồ sơ
                            </div>
                            <div className="text-sm font-bold text-slate-800">
                                {job.deadline || "30/11/2026"}
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
                                variant="default"
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        router.push("/login");
                                    } else {
                                        setShowApplyModal(true);
                                    }
                                }}
                                className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-8 rounded-xl shadow-sm text-sm cursor-pointer transition-colors"
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
                            {saved ? "Đã lưu vị trí" : "Lưu vào danh sách"}
                        </Button>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* 2. QUICK SPEC BADGES (4-BOX GRID AS SEEN IN USER SCREENSHOT) */}
                {/* ========================================================================= */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {/* Kinh nghiệm */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                        <div className="text-xs text-slate-500 font-medium mb-1">Đối tượng sinh viên</div>
                        <div className="text-sm font-bold text-slate-900">
                            {job.experienceLevel || "Sinh viên năm 3 - 4"}
                        </div>
                    </div>

                    {/* Hình thức */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                        <div className="text-xs text-slate-500 font-medium mb-1">Hình thức làm việc</div>
                        <div className="text-sm font-bold text-slate-900">
                            {job.workFormat === "ONSITE" ? "Trực tiếp (On-site)" : job.workFormat === "HYBRID" ? "Linh hoạt (Hybrid)" : "Từ xa (Remote)"}
                        </div>
                    </div>

                    {/* Độ tuổi */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                        <div className="text-xs text-slate-500 font-medium mb-1">Ngành đào tạo phù hợp</div>
                        <div className="text-sm font-bold text-slate-900">
                            {job.targetProgramCodes?.join(", ") || "SE, IT, CS"}
                        </div>
                    </div>

                    {/* Cấp bậc */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                        <div className="text-xs text-slate-500 font-medium mb-1">Cấp bậc tiếp nhận</div>
                        <div className="text-sm font-bold text-slate-900">
                            Thực tập sinh tốt nghiệp
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* 3. MAIN CONTENT (LEFT 2/3) + SIDEBAR (RIGHT 1/3) */}
                {/* ========================================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left 2/3: Detailed Description */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
                            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-sky-600" />
                                Chi tiết tin tuyển dụng thực tập
                            </h2>

                            {/* Section 1: Mô tả công việc */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                                    1. Mô tả công việc & Nhiệm vụ thực tập
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                    {job.description}
                                </p>
                            </div>

                            {/* Section 2: Yêu cầu ứng viên */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                                    2. Yêu cầu năng lực & Kiến thức học phần
                                </h3>
                                {job.requirements && job.requirements.length > 0 ? (
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        {job.requirements.map((req, idx) => (
                                            <li key={idx} className="flex items-start gap-2.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-2 shrink-0"></div>
                                                <span>{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li className="flex items-start gap-2.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-2 shrink-0"></div>
                                            <span>Sinh viên năm 3 hoặc năm cuối các ngành Kỹ thuật phần mềm, CNTT, HTTT hoặc KHMT.</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-2 shrink-0"></div>
                                            <span>Có nền tảng lập trình cơ bản và thái độ nghiêm túc, sẵn sàng học hỏi thực tế.</span>
                                        </li>
                                    </ul>
                                )}
                            </div>

                            {/* Section 3: Chuẩn đầu ra học phần (University Course Learning Outcomes) */}
                            <div className="space-y-3 bg-sky-50/70 border border-sky-100 rounded-xl p-5">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-sky-950 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-sky-700" />
                                    3. Chuẩn đầu ra học phần đáp ứng (CLO / PLO)
                                </h3>
                                <p className="text-xs text-sky-800">
                                    Vị trí thực tập này đã được Khoa CNTT&TT thẩm định phù hợp với các chuẩn đầu ra sau:
                                </p>
                                <ul className="space-y-2 text-xs font-medium text-sky-900 mt-2">
                                    {(job.targetLearningOutcomes && job.targetLearningOutcomes.length > 0 ? job.targetLearningOutcomes : [
                                        "Làm chủ quy trình phát triển và kiểm thử phần mềm doanh nghiệp thực tế",
                                        "Áp dụng kiến thức chuyên môn giải quyết bài toán nghiệp vụ công nghiệp",
                                        "Kỹ năng giao tiếp và làm việc nhóm theo mô hình Agile/Scrum"
                                    ]).map((clo, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 mt-0.5 shrink-0" />
                                            <span>{clo}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Section 4: Quyền lợi & Phụ cấp */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                                    4. Quyền lợi sinh viên & Trách nhiệm doanh nghiệp
                                </h3>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    {(job.benefits && job.benefits.length > 0 ? job.benefits : [
                                        "Mức phụ cấp thực tập cạnh tranh hỗ trợ sinh hoạt hàng tháng",
                                        "Có Mentor 1:1 hướng dẫn chuyên môn và quy trình làm việc",
                                        "Được cung cấp đầy đủ máy móc và trang thiết bị làm việc",
                                        "Cơ hội được giữ lại làm việc chính thức sau khi tốt nghiệp",
                                        "Xác nhận dấu mộc thực tập và hỗ trợ hoàn tất hồ sơ nghiệm thu tốt nghiệp"
                                    ]).map((ben, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5">
                                            <Award className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                            <span>{ben}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Section 5: Kỹ năng chuyên môn yêu cầu */}
                            {job.skills && job.skills.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                                    5. Kỹ năng công nghệ yêu cầu
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((s, idx) => (
                                            <span 
                                                key={idx}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                                                    s.isRequired 
                                                        ? "bg-sky-50 text-sky-800 border-sky-200" 
                                                        : "bg-slate-50 text-slate-700 border-slate-200"
                                                }`}
                                            >
                                                {s.skillName || s.skillId}
                                                {s.isRequired && <span className="ml-1 text-sky-600 font-bold">*</span>}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400">(*) Kỹ năng bắt buộc của vị trí</p>
                                </div>
                            )}

                            {/* Bottom Apply CTA */}
                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                <div className="text-xs text-slate-500">
                                    Hạn nộp hồ sơ: <strong className="text-slate-800">{job.deadline || "30/11/2026"}</strong>
                                </div>
                                {!isApplied && (
                                    <Button
                                        variant="default"
                                        onClick={() => {
                                            if (!isAuthenticated) router.push("/login");
                                            else setShowApplyModal(true);
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm text-xs cursor-pointer"
                                    >
                                        Ứng tuyển ngay
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right 1/3: Company Overview & Related Positions */}
                    <div className="space-y-6">
                        {/* Company Card (As in user screenshot) */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 shrink-0">
                                    <Building2 className="w-6 h-6 text-sky-700" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{job.companyName}</h4>
                                    <div className="text-xs text-slate-500 mt-0.5">{job.companyIndustry || "Công nghệ thông tin"}</div>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <span className="text-slate-400 block mb-0.5">Quy mô nhân sự:</span>
                                    <span className="font-semibold text-slate-800">{job.companyScale || "1.000 - 4.999 nhân viên"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block mb-0.5">Lĩnh vực hoạt động:</span>
                                    <span className="font-semibold text-slate-800">{job.companyIndustry || "Phần mềm & Dịch vụ Số"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block mb-0.5">Địa chỉ văn phòng:</span>
                                    <span className="font-semibold text-slate-800 leading-relaxed block">{job.companyAddress || job.location}</span>
                                </div>
                            </div>

                            {job.companyWebsite && (
                                <div className="pt-3 border-t border-slate-100">
                                    <a 
                                        href={job.companyWebsite}
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

                        {/* Related Jobs from Company (As in user screenshot) */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <h4 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                                Vị trí thực tập liên quan
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
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* 4. APPLY MODAL (STUDENT CV & LETTER) */}
            {/* ========================================================================= */}
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
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleApplySubmit} className="space-y-4">
                            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-900 space-y-1">
                                <div className="font-semibold">Ứng viên: {user?.fullName || "Sinh viên ĐH Cần Thơ"}</div>
                                <div className="text-sky-700">Email chính thức: {user?.email}</div>
                                <div className="text-sky-700">Vai trò: Sinh viên đủ điều kiện thực tập tốt nghiệp</div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Thư giới thiệu & Mục tiêu thực tập
                                </label>
                                <textarea
                                    rows={4}
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    placeholder="Nêu ngắn gọn kinh nghiệm đồ án môn học, định hướng kỹ thuật và lý do bạn muốn thực tập tại doanh nghiệp..."
                                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                                    required
                                />
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Hồ sơ học tập và bảng điểm tích lũy của bạn sẽ được gửi kèm hồ sơ thẩm định.</span>
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
                                    disabled={isSubmitting}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
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
