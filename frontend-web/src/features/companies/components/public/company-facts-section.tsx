import { Globe, Users, BriefcaseBusiness } from "lucide-react";
import { safeWebsite } from "@/lib/map-location";
import type { PublicCompany } from "../../types/public-company.types";

export function CompanyFactsSection({ company }: { company: PublicCompany }) {
  const website = safeWebsite(company.website);
  return <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-base font-bold text-slate-900">Thông tin doanh nghiệp</h2>
    <dl className="space-y-4 text-sm">
      {company.industry && <div><dt className="mb-1 flex items-center gap-2 text-slate-500"><BriefcaseBusiness className="h-4 w-4" />Lĩnh vực</dt><dd className="font-medium text-slate-800">{company.industry}</dd></div>}
      {company.employeeRange && <div><dt className="mb-1 flex items-center gap-2 text-slate-500"><Users className="h-4 w-4" />Quy mô</dt><dd className="font-medium text-slate-800">{company.employeeRange} nhân sự</dd></div>}
      {website && <div><dt className="mb-1 flex items-center gap-2 text-slate-500"><Globe className="h-4 w-4" />Website</dt><dd><a className="break-all font-medium text-sky-700 hover:underline" href={website} target="_blank" rel="noopener noreferrer">{new URL(website).hostname}</a></dd></div>}
      {!company.industry && !company.employeeRange && !website && <p className="text-slate-500">Thông tin đang được cập nhật.</p>}
    </dl>
  </section>;
}
