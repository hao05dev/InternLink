"use client";

import React, { useState } from "react";
import { CheckCircle, AlertCircle, ArrowRight, Sparkles, BookOpen, Building2, GraduationCap, ShieldCheck } from "lucide-react";

export default function Home() {
  const [analyzing, setAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);

  const sampleStudentSkills = ["Java", "Spring Boot", "PostgreSQL", "Git"];
  const sampleJobRequired = ["Java", "Spring Boot", "PostgreSQL", "Docker", "Microservices"];

  const handleTestMatching = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setMatchResult({
        score: 82,
        matched: ["Java", "Spring Boot", "PostgreSQL"],
        missing: ["Docker", "Microservices"],
        semanticFit: "Rất phù hợp (88% tương đồng về chuyên môn Backend)",
        advice: "Bạn đã đáp ứng toàn bộ công nghệ cốt lõi! Nên bổ sung kiến thức cơ bản về Docker containerization trước khi phỏng vấn để đạt điểm tuyệt đối."
      });
      setAnalyzing(false);
    }, 600);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-slate-50 pt-16 pb-20 border-b">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-4 h-4" /> Luận văn tốt nghiệp ngành Công nghệ Thông tin
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Quản Lý Toàn Trình Thực Tập & Đối Sánh Năng Lực Tích Hợp AI
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Giải quyết bài toán khoảng cách kỹ năng (Skill Gap) giữa Sinh viên và Doanh nghiệp. 
            Chuẩn hóa quy trình thực tập 12 bước theo khung tiêu chuẩn <strong>Erasmus+, ILO, QAA và NACE</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <a href="#ai-matching" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition">
              Trải nghiệm AI Matching
            </a>
            <a href="#portals" className="px-6 py-3 bg-white border hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition">
              Khám phá các Cổng Truy Cập
            </a>
          </div>
        </div>
      </section>

      {/* 4 Portals Section */}
      <section id="portals" className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Hệ Sinh Thái Phân Quyền</h2>
          <p className="text-slate-600 mt-2">Dành cho 4 nhóm người dùng trọng tâm trong toàn trình thực tập</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sinh vien */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
            <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Sinh Viên</h3>
            <p className="text-sm text-slate-600 mt-2">
              Hồ sơ năng lực, tìm kiếm vị trí có giải thích AI, ký thỏa thuận 3 bên điện tử, ghi nhật ký & đính kèm minh chứng.
            </p>
          </div>

          {/* Doanh nghiep */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Doanh Nghiệp & Mentor</h3>
            <p className="text-sm text-slate-600 mt-2">
              Đề xuất vị trí, lọc ứng viên theo độ khớp kỹ năng, phê duyệt nhật ký hàng tuần và đánh giá rubric giữa kỳ / cuối kỳ.
            </p>
          </div>

          {/* Khoa */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
            <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Khoa / Ban Quản Lý</h3>
            <p className="text-sm text-slate-600 mt-2">
              Thẩm định tư cách pháp nhân DN, phê duyệt chuẩn đầu ra vị trí thực tập, giám sát sự cố và tổng hợp dữ liệu cải tiến.
            </p>
          </div>

          {/* Giang vien */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Giảng Viên Hướng Dẫn</h3>
            <p className="text-sm text-slate-600 mt-2">
              Đồng hành cùng thỏa thuận học tập, phản hồi nhật ký thực tế, đối chiếu chuẩn đầu ra học phần và chấm điểm kết thúc.
            </p>
          </div>
        </div>
      </section>

      {/* AI Matching Interactive Demo */}
      <section id="ai-matching" className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-blue-600">Explainable AI Demo</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Mô phỏng Xếp hạng & Phân tích Khoảng cách Kỹ năng</h2>
            </div>
            <button
              onClick={handleTestMatching}
              disabled={analyzing}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm disabled:opacity-50"
            >
              {analyzing ? "Đang tính toán..." : "Chạy Thử Nghiệm Đối Sánh"}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-xl border">
              <h4 className="font-semibold text-slate-800 text-sm mb-3">Hồ Sơ Năng Lực Sinh Viên</h4>
              <p className="text-xs text-slate-500 mb-2">Chuyên ngành: Kỹ thuật Phần mềm (GPA: 3.45)</p>
              <div className="flex flex-wrap gap-2">
                {sampleStudentSkills.map((s) => (
                  <span key={s} className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border">
              <h4 className="font-semibold text-slate-800 text-sm mb-3">Vị Trí Tuyển Dụng: Java Backend Intern</h4>
              <p className="text-xs text-slate-500 mb-2">Doanh nghiệp: FPT Software (TP.HCM)</p>
              <div className="flex flex-wrap gap-2">
                {sampleJobRequired.map((s) => (
                  <span key={s} className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded-md">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {matchResult && (
            <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Kết quả Đối sánh Thông minh</h4>
                  <p className="text-xs text-slate-600">{matchResult.semanticFit}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-blue-600">{matchResult.score}%</span>
                  <p className="text-xs text-slate-500">Mức độ phù hợp</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm mb-2">
                    <CheckCircle className="w-4 h-4" /> Kỹ năng đã đạt ({matchResult.matched.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matched.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-2">
                    <AlertCircle className="w-4 h-4" /> Khoảng cách kỹ năng cần bù đắp ({matchResult.missing.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missing.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded border border-amber-200 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border text-sm text-slate-700">
                <strong className="text-slate-900">Khuyến nghị lộ trình: </strong>
                {matchResult.advice}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 12-Step Business Workflow */}
      <section id="quy-trinh" className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Quy Trình Quản Lý Toàn Trình 12 Bước</h2>
          <p className="text-slate-600 mt-2">Được thiết kế State Machine chặt chẽ từ khi tiếp nhận đến đánh giá cuối kỳ</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { step: 1, title: "Đăng ký & Xác minh DN", desc: "Xác minh pháp lý, địa chỉ, lịch sử hợp tác." },
            { step: 2, title: "Đề xuất Vị trí", desc: "Yêu cầu kỹ năng, chuẩn đầu ra, số lượng tuyển." },
            { step: 3, title: "Phê duyệt Vị trí", desc: "Khoa rà soát chuẩn đầu ra & lưu phiên bản." },
            { step: 4, title: "Hồ sơ Sinh viên", desc: "CV, học phần, kỹ năng chuẩn hóa ESCO." },
            { step: 5, title: "Gợi ý & Ứng tuyển", desc: "AI xếp hạng, phân tích kỹ năng thiếu." },
            { step: 6, title: "Sơ tuyển & Phỏng vấn", desc: "DN quản lý vòng tuyển, lịch hẹn và offer." },
            { step: 7, title: "Thỏa thuận 3 bên", desc: "Learning Agreement theo chuẩn Erasmus+." },
            { step: 8, title: "Nhật ký Thực tập", desc: "Bằng chứng công việc, Mentor duyệt tuần." },
            { step: 9, title: "Theo dõi Sự cố", desc: "Quản lý nghỉ phép, đổi việc hoặc chấm dứt sớm." },
            { step: 10, title: "Đánh giá Rubric", desc: "Chấm giữa kỳ & cuối kỳ theo khung NACE/QAA." },
            { step: 11, title: "Đối chiếu Chuẩn đầu ra", desc: "Tổng hợp kỹ năng đạt & gap phân tích." },
            { step: 12, title: "Báo cáo Cải tiến", desc: "Thống kê chất lượng đối tác & tỷ lệ việc làm." },
          ].map((item) => (
            <div key={item.step} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold text-center leading-6 mb-2">
                  {item.step}
                </span>
                <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}