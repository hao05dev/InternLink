import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/features/companies/components/company-logo";
import type { PublicCompany } from "@/features/companies/types/public-company.types";

interface Props { company: PublicCompany | null; loading: boolean; error: string; onEdit: () => void; onRetry: () => void }

export function JobCompanyProfileSection({ company, loading, error, onEdit, onRetry }: Props) {
  return <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sky-200 bg-sky-50/60 p-5">
    {company ? <><div className="flex items-center gap-3"><CompanyLogo src={company.logoUrl} name={company.companyName} /><div><h2 className="font-bold text-slate-900">{company.companyName}</h2><p className="mt-1 text-sm text-slate-600">{company.description ? "Hồ sơ công ty được hiển thị cùng các tin tuyển dụng." : "Bổ sung giới thiệu để sinh viên hiểu hơn về công ty."}</p></div></div><Button type="button" variant="outline" onClick={onEdit}>Chỉnh sửa hồ sơ</Button></>
      : <><p className="text-sm text-slate-600">{loading ? "Đang tải hồ sơ doanh nghiệp…" : error || "Chưa có hồ sơ doanh nghiệp."}</p>{error && <Button type="button" variant="outline" onClick={onRetry}>Thử lại hồ sơ</Button>}</>}
  </section>;
}
