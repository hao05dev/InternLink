import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { CompanySummary } from "../../types/public-company.types";
import { CompanyLogo } from "../company-logo";

export function CompanySummaryCard({ company }: { company: CompanySummary }) {
  return <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Doanh nghiệp tuyển dụng</p>
    <div className="flex items-center gap-3"><CompanyLogo src={company.logoUrl} name={company.companyName} /><h2 className="min-w-0 break-words text-base font-bold text-slate-900">{company.companyName}</h2></div>
    {company.industry && <p className="text-sm text-slate-600">{company.industry}</p>}
    {company.officeAddress && <p className="flex items-start gap-2 text-sm text-slate-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{company.officeAddress}</p>}
    {company.publicProfile && <Link href={`/companies/${company.id}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-sky-700 hover:underline">Khám phá doanh nghiệp<ArrowUpRight className="h-4 w-4" /></Link>}
  </section>;
}
