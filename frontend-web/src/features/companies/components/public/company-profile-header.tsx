"use client";
import { useState } from "react";
import { BadgeCheck, MapPin } from "lucide-react";
import type { PublicCompany } from "../../types/public-company.types";
import { CompanyLogo } from "../company-logo";

export function CompanyProfileHeader({ company }: { company: PublicCompany }) {
  const [failedCover, setFailedCover] = useState<string | null>(null);
  return <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="relative h-40 bg-gradient-to-br from-sky-900 via-sky-700 to-cyan-500 sm:h-56">
      {company.coverImageUrl && failedCover !== company.coverImageUrl
        ? <img src={company.coverImageUrl} alt={`Văn phòng ${company.companyName}`} className="h-full w-full object-cover" onError={() => setFailedCover(company.coverImageUrl ?? null)} />
        : <div aria-hidden className="absolute inset-0 overflow-hidden"><div className="absolute -right-16 -top-24 h-96 w-96 rounded-full border-[48px] border-white/10" /><div className="absolute left-6 top-7 text-xs font-semibold uppercase tracking-[0.2em] text-white/75 sm:left-8">Doanh nghiệp · InternLink</div></div>}
    </div>
    <div className="relative px-6 pb-7 sm:px-8">
      <div className="-mt-9 mb-4 inline-block rounded-3xl bg-white p-1"><CompanyLogo src={company.logoUrl} name={company.companyName} large /></div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h1 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{company.companyName}</h1>
          {company.industry && <p className="text-sm font-medium text-sky-800">{company.industry}</p>}
          {company.officeAddress && <p className="flex items-start gap-2 text-sm text-slate-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{company.officeAddress}</p>}
        </div>
        {company.verificationStatus === "VERIFIED" && <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"><BadgeCheck className="h-4 w-4" />Doanh nghiệp đã xác minh</span>}
      </div>
    </div>
  </header>;
}
