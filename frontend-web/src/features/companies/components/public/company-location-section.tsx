import { LocationMap } from "@/components/ui/location-map";
import type { PublicCompany } from "../../types/public-company.types";

export function CompanyLocationSection({ company }: { company: PublicCompany }) {
  return <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-base font-bold text-slate-900">Văn phòng công ty</h2>
    <LocationMap address={company.officeAddress} mapEmbedUrl={company.mapEmbedUrl} mapsUrl={company.mapsUrl} />
  </section>;
}
