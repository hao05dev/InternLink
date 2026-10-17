import type { JobFormValues } from "../types/job-form.types";
import { normalizeMapEmbed, normalizeMapsLink } from "@/lib/map-location";

export function validateJobForm(values: JobFormValues): string | null {
  if (!values.title.trim() || !values.description.replace(/<[^>]*>/g, "").trim()) return "Vui lòng điền đầy đủ Tiêu đề và Mô tả.";
  if (!values.selectedDeptId || !values.selectedTermId) return "Vui lòng chọn khoa và học kỳ tiếp nhận.";
  if (values.workFormat !== "REMOTE" && !values.useCompanyLocation && !values.location.trim()) return "Vui lòng điền Địa điểm làm việc.";
  if (!Number.isInteger(Number(values.vacancies)) || Number(values.vacancies) < 1) return "Chỉ tiêu phải là số nguyên từ 1 trở lên.";
  if (!values.isNegotiable && (!values.stipendAmount.trim() || !Number.isFinite(Number(values.stipendAmount)) || Number(values.stipendAmount) < 0)) return "Mức hỗ trợ không hợp lệ.";
  if (values.workFormat !== "REMOTE" && !values.useCompanyLocation && (normalizeMapEmbed(values.mapEmbedUrl) === null || normalizeMapsLink(values.mapsUrl) === null)) return "Liên kết bản đồ chưa hợp lệ.";
  return null;
}
