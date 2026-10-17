"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicShell } from "@/components/layouts/public-shell";
import { Button } from "@/components/ui/button";
import { usePublicCompany } from "../hooks/use-public-company";
import { useCompanyPublicJobs } from "@/features/jobs/hooks/use-company-public-jobs";
import { CompanyOpenJobsSection } from "@/features/jobs/components/public-search/company-open-jobs-section";
import { CompanyProfileHeader } from "./public/company-profile-header";
import { CompanyIntroductionSection } from "./public/company-introduction-section";
import { CompanyFactsSection } from "./public/company-facts-section";
import { CompanyLocationSection } from "./public/company-location-section";

export function CompanyPublicDetailView({ id }: { id: string }) {
  const profile = usePublicCompany(id);
  const jobs = useCompanyPublicJobs(profile.company?.id);
  return <PublicShell><main className="min-h-screen bg-slate-50/80 py-8 sm:py-10">
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      <Link href="/companies" className="inline-flex min-h-10 items-center gap-2 text-sm text-slate-500 hover:text-sky-700"><ArrowLeft className="h-4 w-4" />Danh bạ doanh nghiệp</Link>
      {profile.loading ? <div role="status" className="animate-pulse space-y-6"><span className="sr-only">Đang tải hồ sơ doanh nghiệp</span><div className="h-80 rounded-3xl bg-slate-200" /><div className="h-64 rounded-3xl bg-slate-200" /></div>
        : !profile.company ? <div className="space-y-4 rounded-3xl border bg-white p-10 text-center"><h1 className="text-xl font-bold text-slate-900">{profile.notFound ? "Hồ sơ doanh nghiệp chưa được công khai" : "Không tải được hồ sơ"}</h1><p className="text-sm text-slate-500">{profile.notFound ? "Hồ sơ có thể đang được cập nhật hoặc chưa hoàn tất xác minh." : profile.error}</p>{!profile.notFound && <Button onClick={profile.retry}>Thử lại</Button>}</div>
        : <><CompanyProfileHeader company={profile.company} />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="min-w-0 space-y-6 lg:col-span-2"><CompanyIntroductionSection description={profile.company.description} /><CompanyOpenJobsSection {...jobs} onRetry={jobs.retry} /></div>
            <aside className="min-w-0 space-y-6"><CompanyFactsSection company={profile.company} /><CompanyLocationSection company={profile.company} /></aside>
          </div></>}
    </div>
  </main></PublicShell>;
}
