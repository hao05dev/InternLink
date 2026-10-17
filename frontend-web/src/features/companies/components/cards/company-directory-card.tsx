import Link from "next/link";
import { ArrowUpRight, BadgeCheck, MapPin } from "lucide-react";
import type { PublicCompany } from "../../types/public-company.types";
import { CompanyLogo } from "../company-logo";

export function CompanyDirectoryCard({ company }: { company: PublicCompany }) {
  const snippet = company.description?.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  return <article className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-sky-300 hover:shadow-md">
    <div className="mb-5 flex items-start justify-between gap-3"><CompanyLogo src={company.logoUrl} name={company.companyName} /><span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800"><BadgeCheck className="h-3.5 w-3.5" />Đã xác minh</span></div>
    <h2 className="text-lg font-bold text-slate-900"><Link className="hover:text-sky-700" href={`/companies/${company.id}`}>{company.companyName}</Link></h2>
    <p className="mt-1 text-xs font-medium text-sky-700">{company.industry || "Doanh nghiệp đối tác"}</p>
    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{snippet || "Khám phá môi trường làm việc và cơ hội thực tập tại doanh nghiệp."}</p>
    {company.officeAddress && <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span className="line-clamp-2">{company.officeAddress}</span></p>}
    <div className="mt-auto pt-5"><Link href={`/companies/${company.id}`} className="flex min-h-11 items-center justify-between rounded-xl bg-sky-50 px-4 text-sm font-semibold text-sky-800 group-hover:bg-sky-100">Xem hồ sơ doanh nghiệp<ArrowUpRight className="h-4 w-4" /></Link></div>
  </article>;
}
