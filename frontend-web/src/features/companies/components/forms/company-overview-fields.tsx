import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CompanyProfileFieldsProps } from "../../types/company-profile.types";

export function CompanyOverviewFields({ values, onChange, disabled }: CompanyProfileFieldsProps) {
  return <section className="space-y-4">
    <h2 className="text-base font-bold text-slate-900">Thông tin tổng quan</h2>
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Lĩnh vực hoạt động" value={values.industry} maxLength={100} disabled={disabled} placeholder="Ví dụ: Công nghệ thông tin" onChange={e => onChange("industry", e.target.value)} />
      <Select label="Quy mô nhân sự" value={values.employeeRange} disabled={disabled} onChange={e => onChange("employeeRange", e.target.value)}
        options={[{ value: "", label: "Chọn quy mô" }, ...["1–10", "11–50", "51–200", "201–500", "501–1.000", "Trên 1.000"].map(value => ({ value, label: `${value} nhân sự` }))]} />
    </div>
    <Input label="Website công ty" value={values.website} maxLength={255} disabled={disabled} placeholder="https://congty.vn" onChange={e => onChange("website", e.target.value)} />
  </section>;
}
