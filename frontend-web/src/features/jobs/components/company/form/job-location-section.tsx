import { Input } from "@/components/ui/input";
import { MapLocationField } from "@/components/ui/map-location-field";
import type { PublicCompany } from "@/features/companies/types/public-company.types";
import type { JobFormValues } from "../../../types/job-form.types";

interface Props { values: JobFormValues; company: PublicCompany | null; onChange: <K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) => void; disabled?: boolean }

export function JobLocationSection({ values, company, onChange, disabled }: Props) {
  const remote = values.workFormat === "REMOTE";
  return <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
    <h2 className="text-sm font-bold text-slate-900">Địa điểm làm việc</h2>
    {remote ? <p className="text-sm text-slate-500">Làm việc từ xa. Bạn có thể ghi thêm khu vực hoặc yêu cầu múi giờ bên dưới.</p>
      : <label className="flex items-start gap-3 text-sm text-slate-700"><input className="mt-1 accent-sky-600" type="checkbox" checked={values.useCompanyLocation} disabled={disabled || !company?.officeAddress}
        onChange={e => onChange("useCompanyLocation", e.target.checked)} /><span>Dùng địa chỉ văn phòng công ty<span className="mt-1 block text-xs text-slate-500">{company?.officeAddress || "Bổ sung địa chỉ trong hồ sơ doanh nghiệp để sử dụng."}</span></span></label>}
    {(!values.useCompanyLocation || remote) && <>
      <Input label={remote ? "Khu vực / Múi giờ (tùy chọn)" : "Địa điểm làm việc cụ thể *"} value={values.location} maxLength={1000}
        disabled={disabled} onChange={e => onChange("location", e.target.value)} placeholder="Số nhà, tên đường, phường/xã, tỉnh/thành phố" />
      {!remote && <MapLocationField address={values.location} mapEmbedUrl={values.mapEmbedUrl} mapsUrl={values.mapsUrl}
        disabled={disabled} onEmbedChange={v => onChange("mapEmbedUrl", v)} onMapsChange={v => onChange("mapsUrl", v)} />}
    </>}
  </section>;
}
