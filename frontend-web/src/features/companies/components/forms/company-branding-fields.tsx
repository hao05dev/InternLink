import { MediaImageInput } from "@/components/ui/media-image-input";
import type { CompanyProfileFieldsProps } from "../../types/company-profile.types";

interface Props extends CompanyProfileFieldsProps { companyId: string; onUploadStateChange: (busy: boolean) => void }

export function CompanyBrandingFields({ companyId, values, onChange, disabled, onUploadStateChange }: Props) {
  return <section className="space-y-4">
    <h2 className="text-base font-bold text-slate-900">Nhận diện doanh nghiệp</h2>
    <p className="text-sm text-slate-500">Logo vuông và ảnh bìa ngang giúp hồ sơ của bạn nổi bật trên trang tuyển dụng.</p>
    <div className="grid gap-5 sm:grid-cols-2">
      <MediaImageInput label="Logo công ty" purpose="COMPANY_LOGO" contextId={companyId} value={values.logoUrl}
        onChange={v => onChange("logoUrl", v)} disabled={disabled} onUploadStateChange={onUploadStateChange} />
      <MediaImageInput label="Ảnh bìa công ty" purpose="COMPANY_COVER" contextId={companyId} value={values.coverImageUrl}
        onChange={v => onChange("coverImageUrl", v)} disabled={disabled} onUploadStateChange={onUploadStateChange} />
    </div>
  </section>;
}
