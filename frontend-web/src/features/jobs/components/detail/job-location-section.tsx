import { LocationMap } from "@/components/ui/location-map";
import type { JobPosition } from "../../types/job.types";

export function JobLocationSection({ job }: { job: JobPosition }) {
  return <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <h2 className="text-base font-bold text-slate-900">Địa điểm làm việc</h2>
    {job.workFormat === "REMOTE" ? <p className="text-sm leading-6 text-slate-600">Làm việc từ xa{job.location && job.location !== "Làm việc từ xa" ? ` · ${job.location}` : ""}</p>
      : <><p className="text-xs font-medium text-slate-500">{job.useCompanyLocation ? "Tại văn phòng công ty" : "Địa điểm của vị trí tuyển dụng"}</p><LocationMap address={job.location} mapEmbedUrl={job.mapEmbedUrl} mapsUrl={job.mapsUrl} /></>}
  </section>;
}
