import { RichEditor } from "@/components/ui/rich-editor";
import type { CompanyProfileFieldsProps } from "../../types/company-profile.types";

export function CompanyIntroductionField({ values, onChange, disabled }: CompanyProfileFieldsProps) {
  return <section className="space-y-2">
    <h2 className="text-base font-bold text-slate-900">Giới thiệu doanh nghiệp</h2>
    <p className="text-sm leading-6 text-slate-500">Chia sẻ về sản phẩm, văn hóa làm việc và những điều sinh viên có thể học hỏi tại công ty.</p>
    <RichEditor value={values.description} onChange={value => onChange("description", value)} disabled={disabled}
      showTemplateButton={false} allowImages={false} minHeight="220px" placeholder="Giới thiệu về công ty của bạn…" />
  </section>;
}
