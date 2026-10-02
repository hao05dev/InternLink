"use client";

import React, { useState } from "react";
import { ArrowUpRight, Sparkles, FileCheck, CheckCircle2, Award, Calendar, UserCheck, ShieldCheck } from "lucide-react";

export function InteractiveWorkflowSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "1",
      number: "(1)",
      title: "Đề xuất & Tìm kiếm vị trí (AI Matching)",
      shortDesc: "Khám phá danh sách cơ hội tiếp nhận thực tập đã được Khoa thẩm định tư cách pháp nhân.",
      previewTitle: "Hệ thống AI gợi ý vị trí thực tập",
      previewSubtitle: "Dựa trên kỹ năng (Java, React, SQL...) và nguyện vọng của sinh viên",
      badgeText: "AI Engine v2.4",
      visualContent: (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Độ phù hợp 98%
              </span>
              <p className="text-sm font-bold text-slate-900">Frontend React Developer Intern</p>
              <p className="text-xs text-slate-500">Tập đoàn Công nghệ FPT • Cần Thơ</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xs">
              JD
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between opacity-80">
            <div className="space-y-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Độ phù hợp 92%
              </span>
              <p className="text-sm font-bold text-slate-900">Backend Java Spring Boot Intern</p>
              <p className="text-xs text-slate-500">Viettel Digital • Remote / Hybrid</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
              JD
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "2",
      number: "(2)",
      title: "Ứng tuyển & Ký thỏa thuận 3 bên",
      shortDesc: "Ký kết thỏa thuận tiếp nhận thực tập điện tử giữa Sinh viên – Doanh nghiệp – Khoa CICT.",
      previewTitle: "Thỏa thuận thực tập 3 bên điện tử",
      previewSubtitle: "Bảo đảm quyền lợi, phụ cấp và bảo hiểm thực tập cho sinh viên",
      badgeText: "Pháp lý xác thực",
      visualContent: (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-900">Thỏa thuận tiếp nhận thực tập</p>
              <p className="text-[11px] text-slate-500">Mã văn bản: HD-2026-CICT-089</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
              Đã ký số 3/3
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="font-semibold text-slate-800 text-[11px]">Sinh viên</p>
              <p className="text-[10px] text-emerald-600 font-medium">Đã xác nhận</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="font-semibold text-slate-800 text-[11px]">Doanh nghiệp</p>
              <p className="text-[10px] text-emerald-600 font-medium">Đã phê duyệt</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="font-semibold text-slate-800 text-[11px]">Ban QL Khoa</p>
              <p className="text-[10px] text-emerald-600 font-medium">Đã phê duyệt</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "3",
      number: "(3)",
      title: "Nhật ký công việc & Đánh giá định kỳ",
      shortDesc: "Ghi chép công việc hàng ngày, nhận phản hồi trực tiếp từ Mentor và Giảng viên hướng dẫn.",
      previewTitle: "Nhật ký thực tập & Giám sát tiến độ",
      previewSubtitle: "Theo dõi 12 tuần làm việc với phản hồi 2 chiều",
      badgeText: "Tuần 04 / 12",
      visualContent: (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Báo cáo tuần 04: Xây dựng Module Auth</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold">
                Mentor đã duyệt
              </span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-2">
              Hoàn thiện tích hợp JWT, phân quyền RBAC và kiểm thử Unit test với độ phủ 90%...
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Đánh giá của Mentor:</span>
              <strong className="text-emerald-600 font-bold">Xuất sắc (9.5/10)</strong>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "4",
      number: "(4)",
      title: "Chấm điểm 3 bên & Cấp chứng chỉ số",
      shortDesc: "Tự động tổng hợp điểm đánh giá từ Mentor, Giảng viên và xuất chứng nhận thực tập chính thức.",
      previewTitle: "Bảng điểm tổng hợp & Chứng nhận số",
      previewSubtitle: "Cơ sở dữ liệu đồng bộ trực tiếp vào hệ thống đào tạo CICT • CTU",
      badgeText: "Hoàn tất học phần",
      visualContent: (
        <div className="p-5 rounded-2xl bg-gradient-to-tr from-sky-900 to-indigo-950 text-white shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-200">Digital Certificate</span>
            </div>
            <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-sky-300">
              #VERIFIED-CTU
            </span>
          </div>

          <div>
            <p className="text-base font-bold">Học phần Thực tập Doanh nghiệp</p>
            <p className="text-xs text-slate-300 mt-1">Kết quả chung cuộc: <strong className="text-emerald-400 font-bold text-sm">Điểm A (9.4 / 10.0)</strong></p>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
            <span>Xác thực bởi CICT • Đại học Cần Thơ</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#f8fafc] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Pill Image Badge */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Quy trình chuẩn hóa</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
            Quy trình thực tập{" "}
            <span className="inline-flex items-center align-middle mx-1 px-3 py-1 bg-sky-100 rounded-full border border-sky-300 text-sky-800 text-xs sm:text-sm font-semibold">
              🎓 CICT
            </span>{" "}
            khép kín, minh bạch.
          </h2>
          <p className="text-slate-500 text-xs sm:text-base mt-3 max-w-xl mx-auto">
            Hỗ trợ 4 bước hoàn chỉnh từ giai đoạn định hướng vị trí đến khi nhận điểm và chứng nhận số.
          </p>
        </div>

        {/* Interactive List & Preview Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Numbered List */}
          <div className="lg:col-span-6 space-y-3">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-300 flex items-center justify-between group ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                      : "bg-white text-slate-800 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 pr-3">
                    <span
                      className={`font-mono font-bold text-xs sm:text-sm shrink-0 pt-0.5 sm:pt-0 ${
                        isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-700"
                      }`}
                    >
                      {step.number}
                    </span>
                    <div>
                      <h3
                        className={`text-sm sm:text-base font-bold ${
                          isActive ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {step.title}
                      </h3>
                      {isActive && (
                        <p className="text-xs text-slate-300 mt-1 font-light leading-relaxed animate-in fade-in duration-200">
                          {step.shortDesc}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isActive
                        ? "bg-sky-600 text-white shadow-xs scale-105"
                        : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-700"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Dynamic Visual Mockup */}
          <div className="lg:col-span-6">
            <div className="bg-gradient-to-b from-slate-100 to-slate-200/80 p-6 sm:p-8 rounded-[2rem] border border-slate-300/60 shadow-inner">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    {steps[activeStep].previewTitle}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {steps[activeStep].previewSubtitle}
                  </p>
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white text-slate-800 border border-slate-200 shadow-2xs">
                  {steps[activeStep].badgeText}
                </span>
              </div>

              {/* Dynamic View Card for active step */}
              <div className="transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                {steps[activeStep].visualContent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
