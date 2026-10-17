"use client";
import Link from "next/link";
import { useCompanyProfile } from "../hooks/use-company-profile";
import { CompanyProfileForm } from "./forms/company-profile-form";
import { Button } from "@/components/ui/button";

export function CompanyProfileView() {
  const profile = useCompanyProfile();
  return <div className="mx-auto max-w-5xl space-y-6 pb-10">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Hồ sơ doanh nghiệp</h1><p className="mt-2 text-sm text-slate-500">Giới thiệu môi trường làm việc và giúp sinh viên tìm hiểu công ty của bạn.</p></div>
      {profile.company?.verificationStatus === "VERIFIED" && <Link className="text-sm font-semibold text-sky-700 hover:underline" href={`/companies/${profile.company.id}`}>Xem trang công khai ↗</Link>}
    </div>
    {profile.loading ? <p role="status" className="animate-pulse rounded-2xl bg-white p-8 text-slate-500">Đang tải hồ sơ…</p>
      : profile.error ? <div role="alert" className="space-y-3 rounded-2xl bg-rose-50 p-6 text-rose-700"><p>{profile.error}</p><Button onClick={profile.retry} variant="outline">Thử lại</Button></div>
      : profile.company && <CompanyProfileForm key={profile.company.id} company={profile.company} onSave={profile.save} />}
  </div>;
}
