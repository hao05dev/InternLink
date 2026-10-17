import { Input } from "@/components/ui/input";
import { MapLocationField } from "@/components/ui/map-location-field";
import type { CompanyProfileFieldsProps } from "../../types/company-profile.types";

export function CompanyLocationFields({ values, onChange, disabled }: CompanyProfileFieldsProps) {
  return <section className="space-y-4">
    <h2 className="text-base font-bold text-slate-900">Văn phòng & Bản đồ</h2>
    <Input label="Địa chỉ văn phòng công khai" value={values.officeAddress} maxLength={1000} disabled={disabled}
      placeholder="Số nhà, tên đường, phường/xã, tỉnh/thành phố" onChange={e => onChange("officeAddress", e.target.value)} />
    <MapLocationField address={values.officeAddress} mapEmbedUrl={values.mapEmbedUrl} mapsUrl={values.mapsUrl} disabled={disabled}
      onEmbedChange={v => onChange("mapEmbedUrl", v)} onMapsChange={v => onChange("mapsUrl", v)} />
  </section>;
}
