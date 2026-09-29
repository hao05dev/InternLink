"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  BookOpen, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  FileCheck2, 
  Briefcase,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { SmartJobSearch } from "@/features/jobs/components/smart-job-search";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/layouts/public-shell";

// Dữ liệu mẫu vị trí thực tập thực tế của các doanh nghiệp đối tác
const FEATURED_JOBS = [
  {
    id: "job-1",
    title: "Thực tập sinh Lập trình Java Backend",
    company: "FPT Software Cần Thơ",
    location: "Khu Công nghệ cao, Q. Ninh Kiều, Cần Thơ",
    workFormat: "ONSITE",
    stipend: "3.500.000 - 5.000.000 đ",
    deadline: "15/11/2026",
    skills: ["Java", "Spring Boot", "PostgreSQL", "Git"],
    vacancies: 5
  },
  {
    id: "job-2",
    title: "Thực tập sinh Lập trình Frontend (React / Next.js)",
    company: "TMA Solutions Cần Thơ Lab",
    location: "Đại lộ Hòa Bình, Q. Ninh Kiều, Cần Thơ",
    workFormat: "HYBRID",
    stipend: "3.000.000 - 4.500.000 đ",
    deadline: "20/11/2026",
    skills: ["React", "TypeScript", "Tailwind CSS", "REST API"],
    vacancies: 3
  },
  {
    id: "job-3",
    title: "Thực tập sinh Kiểm thử Phần mềm (QA / QC)",
    company: "VNPT Cần Thơ",
    location: "Số 2 Nguyễn Thái Học, Q. Ninh Kiều, Cần Thơ",
    workFormat: "ONSITE",
    stipend: "2.500.000 - 3.500.000 đ",
    deadline: "10/11/2026",
    skills: ["Manual Testing", "Test Cases", "SQL", "Postman"],
    vacancies: 2
  },
  {
    id: "job-4",
    title: "Thực tập sinh DevOps & Vận hành Hệ thống Cloud",
    company: "Viettel Solutions - Chi nhánh Tây Nam Bộ",
    location: "Đường 30 Tháng 4, Q. Ninh Kiều, Cần Thơ",
    workFormat: "ONSITE",
    stipend: "4.000.000 - 6.000.000 đ",
    deadline: "30/11/2026",
    skills: ["Linux", "Docker", "CI/CD", "Networking"],
    vacancies: 2
  }
];

// 12 Bước chuẩn hóa của Khoa theo 4 giai đoạn
const WORKFLOW_PHASES = [
  {
    phase: "Giai đoạn 1",
    title: "Chuẩn bị & Phê duyệt",
    color: "border-blue-500 bg-blue-50/50 text-blue-700",
    steps: [
      { step: 1, title: "Xác minh Doanh nghiệp", desc: "Khoa thẩm định tư cách pháp nhân và điều kiện an toàn nơi làm việc." },
      { step: 2, title: "Đề xuất Vị trí", desc: "Doanh nghiệp đăng ký số lượng, yêu cầu kỹ năng và phân công Mentor." },
      { step: 3, title: "Phê duyệt Vị trí", desc: "Bộ môn kiểm duyệt tính tương thích với chuẩn đầu ra học phần thực tập." }
    ]
  },
  {
    phase: "Giai đoạn 2",
    title: "Tiếp nhận & Tuyển chọn",
    color: "border-emerald-500 bg-emerald-50/50 text-emerald-700",
    steps: [
      { step: 4, title: "Hồ sơ Năng lực Sinh viên", desc: "Sinh viên hoàn thiện CV, danh mục kỹ năng và bảng điểm tích lũy." },
      { step: 5, title: "Tìm kiếm & Ứng tuyển", desc: "Sinh viên lựa chọn vị trí phù hợp từ đối tác hoặc nộp đơn tự tìm." },
      { step: 6, title: "Sơ tuyển & Phỏng vấn", desc: "Doanh nghiệp phỏng vấn, gửi Thư tiếp nhận (Offer) chính thức." }
    ]
  },
  {
    phase: "Giai đoạn 3",
    title: "Thực tập & Giám sát",
    color: "border-amber-500 bg-amber-50/50 text-amber-700",
    steps: [
      { step: 7, title: "Ký Thỏa thuận 3 bên", desc: "Sinh viên, Doanh nghiệp và Khoa ký xác nhận trách nhiệm đào tạo." },
      { step: 8, title: "Nhật ký Thực tập tuần", desc: "Sinh viên ghi nhận nhiệm vụ, Mentor duyệt và Giảng viên theo dõi." },
      { step: 9, title: "Giám sát & Xử lý Sự cố", desc: "Quản lý phép, điều chỉnh nhiệm vụ hoặc can thiệp khi có phát sinh." }
    ]
  },
  {
    phase: "Giai đoạn 4",
    title: "Đánh giá & Hoàn tất",
    color: "border-purple-500 bg-purple-50/50 text-purple-700",
    steps: [
      { step: 10, title: "Chấm điểm Rubric", desc: "Mentor và Giảng viên đánh giá độc lập theo đề cương chi tiết học phần." },
      { step: 11, title: "Đối chiếu Chuẩn đầu ra", desc: "Đo lường mức độ đạt chuẩn đầu ra (CLO) của từng sinh viên." },
      { step: 12, title: "Tổng hợp Điểm & Cải tiến", desc: "Hội đồng Khoa chốt điểm học phần chính thức và công bố kết quả." }
    ]
  }
];

export default function HomeView() {
  const [activePhase, setActivePhase] = useState<number>(0);

  return (
    <PublicShell>
      <div className="space-y-16 sm:space-y-24 pb-20">
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-cict-dark via-cict-navy to-slate-900 text-white pt-16 sm:pt-24 pb-20 sm:pb-28">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-sky-500/15 to-transparent blur-3xl pointer-events-none" />
          
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-sky-200 text-xs font-semibold tracking-wide border border-white/15 shadow-inner">
              <GraduationCap className="w-4 h-4 text-sky-300" />
              <span>Đại học Cần Thơ • Trường Công nghệ Thông tin & Truyền thông</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white max-w-4xl mx-auto">
              Cổng Quản Lý Thực Tập & Tuyển Dụng Doanh Nghiệp
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
              Nền tảng kết nối trực tiếp sinh viên với mạng lưới doanh nghiệp công nghệ, chuẩn hóa quy trình tiếp nhận, theo dõi nhật ký thực tập số hóa và đối sánh chuẩn đầu ra tích hợp AI.
            </p>

            {/* Smart Search Bar Container */}
            <div className="pt-2 max-w-2xl mx-auto text-left">
              <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/20">
                <SmartJobSearch />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Gợi ý tìm nhanh:</span>
                {["Java Backend", "React / Next.js", "QA / Tester", "DevOps Cloud", "AI Engineer"].map((tag) => (
                  <Link
                    key={tag}
                    href={`/jobs?keyword=${encodeURIComponent(tag)}`}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors border border-white/10 text-[11px]"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Social Proof Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 pt-10 max-w-4xl mx-auto border-t border-white/10">
              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10 text-center">
                <span className="text-2xl sm:text-4xl font-black text-sky-400 tracking-tight">1,200+</span>
                <p className="text-xs text-slate-300 font-medium mt-1">Sinh viên tham gia / năm</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10 text-center">
                <span className="text-2xl sm:text-4xl font-black text-emerald-400 tracking-tight">120+</span>
                <p className="text-xs text-slate-300 font-medium mt-1">Doanh nghiệp hợp tác</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10 text-center">
                <span className="text-2xl sm:text-4xl font-black text-amber-400 tracking-tight">100%</span>
                <p className="text-xs text-slate-300 font-medium mt-1">Vị trí thẩm định chuẩn</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10 text-center">
                <span className="text-2xl sm:text-4xl font-black text-purple-400 tracking-tight">12 Bước</span>
                <p className="text-xs text-slate-300 font-medium mt-1">Quy trình đào tạo chuẩn</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. VỊ TRÍ TUYỂN DỤNG NỔI BẬT (#jobs) */}
        <section id="jobs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4 pb-4 border-b border-slate-200/80">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200/60 mb-2">
                <Briefcase className="w-3.5 h-3.5" />
                Cơ hội thực tập tốt nghiệp
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Vị Trí Thực Tập Doanh Nghiệp Mới Nhất
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Được thẩm định chuyên môn bởi Ban Quản lý Thực tập Khoa CNTT&TT — ĐH Cần Thơ
              </p>
            </div>
            <Link href="/jobs">
              <Button variant="outline" size="sm" className="gap-1.5 font-semibold text-xs border-slate-300 hover:border-sky-500 hover:text-sky-700">
                Khám phá tất cả vị trí <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
            {FEATURED_JOBS.map((job) => (
              <div 
                key={job.id} 
                className="modern-card p-6 flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <Link 
                        href="/jobs" 
                        className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-700 transition block line-clamp-1"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                        <span>{job.company}</span>
                      </p>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                      {job.workFormat}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{job.location}</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Hạn: {job.deadline}</span>
                    </span>
                  </div>

                  {/* Stipend Badge */}
                  <div className="pt-0.5">
                    <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                      Phụ cấp: {job.stipend}
                    </span>
                  </div>

                  {/* Tags Kỹ Năng */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.skills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Chỉ tiêu: <strong className="text-slate-800">{job.vacancies} sinh viên</strong></span>
                  <Link href="/login">
                    <Button size="sm" variant="primary" className="gap-1 text-xs bg-sky-700 hover:bg-sky-600 text-white font-semibold shadow-xs">
                      Ứng tuyển ngay <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 4 CỔNG PHÂN HỆ NGƯỜI DÙNG (#portals) */}
        <section id="portals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60 inline-block mb-2">
              Hệ Thống Phân Quyền Vai Trò
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Cổng Truy Cập Dành Cho Các Bên</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl mx-auto">
              Mỗi tác nhân trong hệ sinh thái thực tập được trang bị không gian làm việc chuyên biệt
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {/* Cổng Sinh viên */}
            <div className="modern-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200/60 flex items-center justify-center mb-4 shadow-2xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Sinh Viên</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-2">
                  Tìm kiếm vị trí thực tập, cập nhật hồ sơ năng lực & CV, ký thỏa thuận 3 bên điện tử, ghi nhật ký tuần và nộp báo cáo tốt nghiệp.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold hover:border-sky-500 hover:text-sky-700">
                    Truy cập Cổng Sinh viên
                  </Button>
                </Link>
              </div>
            </div>

            {/* Cổng Doanh nghiệp */}
            <div className="modern-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center mb-4 shadow-2xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Doanh Nghiệp & Mentor</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-2">
                  Đăng tin tuyển dụng, tiếp nhận hồ sơ ứng viên, phân công người hướng dẫn (Mentor), duyệt nhật ký hàng tuần và đánh giá rubric định kỳ.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold hover:border-emerald-500 hover:text-emerald-700">
                    Truy cập Cổng Doanh nghiệp
                  </Button>
                </Link>
              </div>
            </div>

            {/* Cổng Giảng viên */}
            <div className="modern-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center justify-center mb-4 shadow-2xs">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Giảng Viên Hướng Dẫn</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-2">
                  Theo dõi danh sách sinh viên phụ trách, nhận xét tiến độ thực tế, duyệt nhật ký luồng tự tìm, chấm báo cáo giữa kỳ và cuối kỳ.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold hover:border-indigo-500 hover:text-indigo-700">
                    Truy cập Cổng Giảng viên
                  </Button>
                </Link>
              </div>
            </div>

            {/* Cổng Khoa / Ban Quản Lý */}
            <div className="modern-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center mb-4 shadow-2xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Ban Quản Lý Khoa</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-2">
                  Thẩm định tư cách pháp nhân đối tác, phê duyệt chuẩn đầu ra vị trí thực tập, phân công giảng viên và tổng hợp chốt điểm học phần.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold hover:border-amber-500 hover:text-amber-700">
                    Quản Trị Thực Tập
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. QUY TRÌNH THỰC TẬP 12 BƯỚC CHUẨN HÓA (#quy-trinh) */}
        <section id="quy-trinh" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60 inline-block mb-2">
              Khung Đào Tạo Chuẩn Hóa
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Quy Trình Quản Lý Thực Tập 12 Bước (4 Giai Đoạn)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl mx-auto">
              Chuẩn hóa quy trình ba bên chặt chẽ từ thẩm định doanh nghiệp đến nghiệm thu chuẩn đầu ra CLO
            </p>

            {/* Phase Selector Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
              {WORKFLOW_PHASES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhase(idx)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activePhase === idx
                      ? "bg-cict-navy text-white shadow-sm ring-2 ring-cict-navy/20"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {p.phase}: {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Active Phase Detailed View */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {WORKFLOW_PHASES.map((phaseGroup, idx) => {
              const isSelected = activePhase === idx;
              return (
                <div 
                  key={idx} 
                  className={`rounded-2xl border p-5 transition-all ${
                    isSelected 
                      ? "bg-white border-sky-400 shadow-md ring-2 ring-sky-500/10" 
                      : "bg-white/70 border-slate-200/80 shadow-2xs opacity-90"
                  }`}
                >
                  <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold inline-block mb-4 ${phaseGroup.color}`}>
                    {phaseGroup.phase}: {phaseGroup.title}
                  </div>

                  <div className="space-y-4">
                    {phaseGroup.steps.map((item) => (
                      <div key={item.step} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                          {item.step}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. DOANH NGHIỆP ĐỐI TÁC (#companies) */}
        <section id="companies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 pt-16">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60 inline-block mb-2">
              Mạng Lưới Đối Tác Chiến Lược
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Các Doanh Nghiệp Đồng Hành Thường Niên
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Đơn vị tiếp nhận và đào tạo thực tập cho sinh viên Trường Công nghệ Thông tin & Truyền thông
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            {["FPT Software Cần Thơ", "TMA Solutions Lab", "VNPT Cần Thơ", "Viettel Solutions", "NashTech Vietnam", "Axon Active", "Bosch Global"].map((name) => (
              <div 
                key={name}
                className="px-4 py-2.5 rounded-xl border border-slate-200/80 bg-white font-bold text-slate-700 text-xs sm:text-sm tracking-tight shadow-2xs hover:border-sky-400 hover:text-sky-700 hover:shadow-xs transition"
              >
                {name}
              </div>
            ))}
          </div>
        </section>
      </div>
    </PublicShell>
  );
}