import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { Company } from "@/features/companies/types/company.types";

interface VerifiedCompaniesSectionProps {
  companies: Array<Partial<Company> & { id: string; name?: string; companyName?: string }>;
}

export function VerifiedCompaniesSection({ companies }: VerifiedCompaniesSectionProps) {
  if (!companies?.length) return null;

  return (
    <section id="companies" aria-labelledby="companies-heading" className="mx-auto max-w-7xl scroll-mt-28 px-4 sm:px-6 lg:px-8">
      <div className="border-t border-slate-100 py-8 sm:py-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <h2 id="companies-heading" className="text-base font-semibold text-slate-900">Doanh nghiệp đã xác minh</h2>
          <Link href="/companies" className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium text-sky-700 transition-colors hover:text-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2">
            Xem tất cả <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-3">
          {companies.slice(0, 6).map((company) => (
            <li key={company.id} className="flex min-w-0 max-w-full items-start gap-2 text-sm text-slate-600">
              <Building2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span className="min-w-0 break-words">{company.companyName || company.name || "Doanh nghiệp đối tác"}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}