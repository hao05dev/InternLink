"use client";
import { useState } from "react";
import { Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicCompany } from "../../types/public-company.types";
import type { CompanyProfileValues } from "../../types/company-profile.types";
import { useCompanyProfileForm } from "../../hooks/use-company-profile-form";
import { CompanyOverviewFields } from "./company-overview-fields";
import { CompanyIntroductionField } from "./company-introduction-field";
import { CompanyBrandingFields } from "./company-branding-fields";
import { CompanyLocationFields } from "./company-location-fields";
import { CompanyProfilePreviewModal } from "../modals/company-profile-preview-modal";

interface Props { company: PublicCompany; onSave: (values: CompanyProfileValues) => Promise<PublicCompany> }

export function CompanyProfileForm({ company, onSave }: Props) {
  const form = useCompanyProfileForm(company, onSave);
  const [preview, setPreview] = useState(false);
  const fields = { values: form.values, onChange: form.change, disabled: form.saving };
  return <>
    <form onSubmit={e => { e.preventDefault(); void form.submit(); }} className="space-y-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <CompanyOverviewFields {...fields} />
      <CompanyIntroductionField {...fields} />
      <CompanyBrandingFields {...fields} companyId={company.id} onUploadStateChange={form.uploadState} />
      <CompanyLocationFields {...fields} />
      {form.error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{form.error}</p>}
      {form.saved && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Đã lưu hồ sơ doanh nghiệp.</p>}
      <div className="space-y-3 border-t border-slate-100 pt-5">
        <p className="text-xs leading-5 text-slate-500">Thông tin đã lưu được dùng chung cho hồ sơ công ty và các tin tuyển dụng. Hồ sơ công khai khi doanh nghiệp đã được xác minh.</p>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={form.saving || !!form.uploads} className="gap-2"><Save className="h-4 w-4" />{form.saving ? "Đang lưu…" : form.uploads ? "Đang tải ảnh…" : "Lưu hồ sơ"}</Button>
          <Button type="button" variant="outline" onClick={() => setPreview(true)} className="gap-2"><Eye className="h-4 w-4" />Xem trước</Button>
          <Button type="button" variant="ghost" onClick={form.reset} disabled={form.saving || !!form.uploads || !form.dirty}>Hoàn tác thay đổi</Button>
        </div>
      </div>
    </form>
    {preview && <CompanyProfilePreviewModal company={{ ...company, ...form.values }} onClose={() => setPreview(false)} />}
  </>;
}
