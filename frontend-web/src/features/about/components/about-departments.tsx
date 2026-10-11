"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Code2,
  BrainCircuit,
  Database,
  Network,
  Sparkles,
  Laptop,
  Briefcase,
  Users,
  Search,
} from "lucide-react";
import { DEPARTMENTS } from "../data/about-cict-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  BrainCircuit,
  Database,
  Network,
  Sparkles,
  Laptop,
};

export function AboutDepartments() {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredDepts = activeFilter === "all"
    ? DEPARTMENTS
    : DEPARTMENTS.filter((d) => d.id === activeFilter);

  return (
    <section id="departments" aria-labelledby="departments-heading" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-800">
              Cơ Cấu Học Thuật
            </span>
            <h2 id="departments-heading" className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              06 Khoa Chuyên Môn Đào Tạo
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Định vị chuyên sâu từng lĩnh vực công nghệ số, giúp doanh nghiệp dễ dàng tìm kiếm và kết nối nguồn nhân lực thực tập phù hợp với nhu cầu dự án.
            </p>
          </div>

          {/* Quick tab filter */}
          <div className="flex flex-wrap gap-1.5 self-start md:self-auto">
            <button
              onClick={() => setActiveFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeFilter === "all"
                  ? "bg-sky-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất cả (6 Khoa)
            </button>
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setActiveFilter(dept.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeFilter === dept.id
                    ? "bg-sky-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {dept.shortCode}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDepts.map((dept) => {
            const Icon = iconMap[dept.iconName] || Code2;
            return (
              <div
                key={dept.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/40 p-6 transition duration-200 hover:-translate-y-1 hover:border-sky-300 hover:bg-white hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100/70 text-sky-700 transition group-hover:bg-sky-700 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      <Users className="h-3 w-3 text-slate-500" />
                      {dept.studentCount} SV
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-sky-700">
                    {dept.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500">
                    {dept.englishName}
                  </p>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {dept.description}
                  </p>

                  {/* Majors */}
                  <div className="mt-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Chuyên ngành đào tạo:
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {dept.majors.map((m) => (
                        <span
                          key={m}
                          className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Target roles */}
                <div className="mt-5 border-t border-slate-200/60 pt-4">
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-sky-800">
                    <Briefcase className="h-3 w-3" />
                    Vị trí thực tập định hướng:
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {dept.targetRoles.map((role) => (
                      <span
                        key={role}
                        className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-700"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA for searching internships */}
        <div className="mt-10 rounded-2xl border border-sky-100 bg-sky-50/60 p-6 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Bạn là Doanh nghiệp đang tìm kiếm thực tập sinh từ các khoa trên?
            </h4>
            <p className="mt-1 text-sm text-slate-600">
              Đăng tin tuyển dụng và kết nối trực tiếp với sinh viên CICT thông qua cổng InternLink.
            </p>
          </div>
          <Link
            href="/jobs"
            className="mt-4 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-800 sm:mt-0"
          >
            <Search className="h-4 w-4" />
            <span>Xem các vị trí đang tuyển</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
