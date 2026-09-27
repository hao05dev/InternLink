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
import { SmartJobSearch } from "@/components/modules/smart-job-search";
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

export default function Home() {
  return (
    <PublicShell>
      <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-sky-50/80 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold tracking-wide">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            Trường Đại học Cần Thơ • Khoa Công nghệ Thông tin & Truyền thông
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Cổng Thông Tin Thực Tập & Tuyển Dụng Doanh Nghiệp
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Nền tảng kết nối trực tiếp sinh viên với mạng lưới doanh nghiệp công nghệ đối tác, chuẩn hóa quy trình tiếp nhận, theo dõi nhật ký thực tập và quản lý đánh giá học phần theo chuẩn đào tạo.
          </p>

          {/* Thanh Tìm Kiếm Trực Tiếp Server-Side */}
          <div className="pt-4 max-w-2xl mx-auto text-left">
            <SmartJobSearch />
          </div>

          {/* Số liệu thống kê uy tín (Institutional Proof) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto border-t border-slate-200/80">
            <div className="p-3 text-center">
              <span className="text-2xl sm:text-3xl font-black text-blue-600">500+</span>
              <p className="text-xs text-slate-500 font-medium mt-1">Sinh viên tham gia / năm</p>
            </div>
            <div className="p-3 text-center">
              <span className="text-2xl sm:text-3xl font-black text-blue-600">80+</span>
              <p className="text-xs text-slate-500 font-medium mt-1">Doanh nghiệp liên kết</p>
            </div>
            <div className="p-3 text-center">
              <span className="text-2xl sm:text-3xl font-black text-blue-600">100%</span>
              <p className="text-xs text-slate-500 font-medium mt-1">Nhật ký số hóa</p>
            </div>
            <div className="p-3 text-center">
              <span className="text-2xl sm:text-3xl font-black text-blue-600">4</span>
              <p className="text-xs text-slate-500 font-medium mt-1">Ngành đào tạo chính thức</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VỊ TRÍ TUYỂN DỤNG NỔI BẬT (#jobs) */}
      <section id="jobs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Cơ hội việc làm</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Vị Trí Thực Tập Doanh Nghiệp Mới Nhất
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Được phê duyệt chính thức bởi Ban Quản lý Thực tập Khoa
            </p>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm" className="gap-1.5">
              Xem tất cả vị trí <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {FEATURED_JOBS.map((job) => (
            <div 
              key={job.id} 
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition">
                      {job.title}
                    </h3>
                    <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mt-1">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      {job.company}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    {job.workFormat}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Hạn: {job.deadline}
                  </span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Phụ cấp: {job.stipend}
                  </span>
                </div>

                {/* Tags Kỹ Năng */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {job.skills.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Tuyển {job.vacancies} chỉ tiêu</span>
                <Link href="/login">
                  <Button size="sm" variant="primary" className="gap-1.5 text-xs">
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
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Hệ Thống Phân Quyền</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Cổng Truy Cập Dành Cho Các Bên</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl mx-auto">
            Mỗi nhóm người dùng được cung cấp giao diện quản trị chuyên biệt phục vụ toàn trình thực tập
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Cổng Sinh viên */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sinh Viên</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-2">
                Tra cứu vị trí, nộp CV ứng tuyển hoặc đơn tự tìm nơi thực tập, ký thỏa thuận 3 bên điện tử, ghi nhật ký tuần và nộp báo cáo tốt nghiệp.
              </p>
            </div>
            <div className="pt-6">
              <Link href="/login">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Truy cập Cổng Sinh viên
                </Button>
              </Link>
            </div>
          </div>

          {/* Cổng Doanh nghiệp */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Doanh Nghiệp & Mentor</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-2">
                Đăng tuyển vị trí, tiếp nhận hồ sơ ứng viên, phân công người hướng dẫn (Mentor), duyệt nhật ký hàng tuần và đánh giá rubric định kỳ.
              </p>
            </div>
            <div className="pt-6">
              <Link href="/login">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Truy cập Cổng Doanh nghiệp
                </Button>
              </Link>
            </div>
          </div>

          {/* Cổng Giảng viên */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Giảng Viên Hướng Dẫn</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-2">
                Theo dõi danh sách sinh viên phụ trách, nhận xét tiến độ thực tế, duyệt nhật ký luồng tự tìm, chấm báo cáo giữa kỳ và cuối kỳ.
              </p>
            </div>
            <div className="pt-6">
              <Link href="/login">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Truy cập Cổng Giảng viên
                </Button>
              </Link>
            </div>
          </div>

          {/* Cổng Khoa / Ban Quản Lý */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Ban Quản Lý Khoa</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-2">
                Thẩm định tư cách pháp nhân đối tác, phê duyệt chuẩn đầu ra vị trí thực tập, phân công giảng viên và tổng hợp chốt điểm học phần.
              </p>
            </div>
            <div className="pt-6">
              <Link href="/login">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Quản Trị Thực Tập
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. QUY TRÌNH THỰC TẬP 12 BƯỚC CHUẨN HÓA (#quy-trinh) */}
      <section id="quy-trinh" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Khung Quản Lý Đào Tạo</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Quy Trình Quản Lý Thực Tập 12 Bước
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl mx-auto">
            Chuẩn hóa quy trình chặt chẽ từ khâu tiếp nhận đến đánh giá kết thúc học phần
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {WORKFLOW_PHASES.map((phaseGroup, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold inline-block ${phaseGroup.color}`}>
                {phaseGroup.phase}: {phaseGroup.title}
              </div>

              <div className="space-y-3.5">
                {phaseGroup.steps.map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-normal mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. DOANH NGHIỆP LIÊN KẾT (#companies) */}
      <section id="companies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t pt-16">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Đối Tác Chiến Lược</span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Mạng Lưới Doanh Nghiệp Hợp Tác Tuyển Dụng
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Các đơn vị tiếp nhận sinh viên thực tập thường niên trực thuộc Khoa CNTT&TT
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-75">
          {["FPT Software", "TMA Solutions", "VNPT Technology", "Viettel Solutions", "NashTech Vietnam", "Axon Active", "Bosch Global"].map((name) => (
            <div 
              key={name}
              className="px-5 py-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 text-sm tracking-tight shadow-2xs hover:border-blue-400 hover:text-blue-600 transition"
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