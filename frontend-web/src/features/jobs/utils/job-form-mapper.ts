import type { JobFormValues } from "../types/job-form.types";
import type { JobPosition } from "../types/job.types";
import type { JobFormPayload } from "../services/job.service";
import { normalizeMapEmbed, normalizeMapsLink } from "@/lib/map-location";
import type { UploadedFileItem } from "@/components/ui/file-uploader";

function attachmentType(value?: string): UploadedFileItem["fileType"] {
  switch (value) {
    case "PDF": case "DOCX": case "XLSX": case "ZIP": case "IMAGE": return value;
    default: return "OTHER";
  }
}

export function emptyJobForm(): JobFormValues {
  return { title: "", workFormat: "ONSITE", location: "", useCompanyLocation: false,
    mapEmbedUrl: "", mapsUrl: "", vacancies: "3", stipendAmount: "", isNegotiable: true,
    description: "", skillsText: "", benefitsText: "", bannerUrl: "", attachmentUrls: [],
    selectedDeptId: "", selectedTermId: "" };
}

export function jobToForm(job: JobPosition): JobFormValues {
  return { ...emptyJobForm(), title: job.title, workFormat: job.workFormat || "ONSITE", location: job.location ?? "",
    useCompanyLocation: job.useCompanyLocation ?? false, mapEmbedUrl: job.mapEmbedUrl ?? "", mapsUrl: job.mapsUrl ?? "",
    vacancies: String(job.vacancies ?? 1), stipendAmount: String(job.stipendAmount ?? ""), isNegotiable: !job.stipendAmount,
    description: job.description ?? "", skillsText: job.skills?.map(s => s.skillName || s.skillId).join(", ") || job.mandatorySkillIds?.join(", ") || "",
    benefitsText: job.benefits?.join(", ") ?? "", bannerUrl: job.bannerUrl ?? "", attachmentUrls: (job.attachmentUrls ?? []).map(file => ({ ...file, fileType: attachmentType(file.fileType) })),
    selectedDeptId: job.departmentId ?? "", selectedTermId: job.termId ?? "" };
}

export function jobFormPayload(values: JobFormValues, companyId: string): JobFormPayload {
  return { companyId, title: values.title.trim(), departmentId: values.selectedDeptId, termId: values.selectedTermId,
    workFormat: values.workFormat, location: values.location.trim(), useCompanyLocation: values.useCompanyLocation && values.workFormat !== "REMOTE",
    mapEmbedUrl: values.workFormat === "REMOTE" || values.useCompanyLocation ? "" : normalizeMapEmbed(values.mapEmbedUrl) || "",
    mapsUrl: values.workFormat === "REMOTE" || values.useCompanyLocation ? "" : normalizeMapsLink(values.mapsUrl) || "",
    vacancies: Number(values.vacancies), stipendAmount: values.isNegotiable ? 0 : Number(values.stipendAmount),
    description: values.description.trim(), bannerUrl: values.bannerUrl || undefined, attachmentUrls: values.attachmentUrls,
    mandatorySkillIds: values.skillsText.split(",").map(s => s.trim()).filter(Boolean),
    benefits: values.benefitsText.split(",").map(s => s.trim()).filter(Boolean) };
}
