"use client";
import { Building2 } from "lucide-react";
import { PublicShell } from "@/components/layouts/public-shell";
import { Button } from "@/components/ui/button";
import { useCompanyDirectory } from "../hooks/use-company-directory";
import { CompanyDirectoryCard } from "./cards/company-directory-card";

export default function CompanyDirectoryView() {
  const { companies, loading, error, retry } = useCompanyDirectory();
  return <PublicShell><main className="min-h-screen bg-slate-50 py-10 sm:py-14">
    <div className="mx-auto max-w-7xl space-y-9 px-4 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-2xl space-y-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-xs font-semibold text-sky-800"><Building2 className="h-4 w-4" />Mạng lưới doanh nghiệp đối tác</span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Tìm nơi bắt đầu hành trình nghề nghiệp</h1>
        <p className="text-sm leading-7 text-slate-600 sm:text-base">Khám phá doanh nghiệp đã được xác minh, tìm hiểu môi trường làm việc và lựa chọn cơ hội thực tập phù hợp.</p>
      </header>
      {loading ? <div role="status" className="grid animate-pulse gap-6 md:grid-cols-2 lg:grid-cols-3"><span className="sr-only">Đang tải danh bạ</span>{[1,2,3].map(i => <div key={i} className="h-80 rounded-3xl bg-slate-200" />)}</div>
        : error ? <div role="alert" className="space-y-4 rounded-3xl border bg-white p-8 text-center"><p className="text-sm text-rose-700">{error}</p><Button onClick={retry} variant="outline">Thử lại</Button></div>
        : companies.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{companies.map(company => <CompanyDirectoryCard key={company.id} company={company} />)}</div>
        : <div className="rounded-3xl border border-dashed bg-white p-12 text-center"><h2 className="font-bold text-slate-800">Chưa có doanh nghiệp được xác minh</h2><p className="mt-3 text-sm text-slate-500">Danh bạ đang được cập nhật. Bạn có thể quay lại sau để khám phá các đối tác mới.</p></div>}
    </div>
  </main></PublicShell>;
}
