import { z } from "zod";
import { normalizeMapEmbed, normalizeMapsLink, safeWebsite } from "@/lib/map-location";

export const companyProfileSchema = z.object({
  description: z.string().max(30000, "Giới thiệu tối đa 30.000 ký tự."),
  industry: z.string().trim().max(100), employeeRange: z.string().trim().max(100),
  website: z.string().trim().max(255).refine(v => !v || !!safeWebsite(v), "Website phải là liên kết HTTPS hợp lệ.")
    .transform(v => safeWebsite(v) ?? ""),
  logoUrl: z.string().max(2048), coverImageUrl: z.string().max(2048),
  officeAddress: z.string().trim().max(1000),
  mapEmbedUrl: z.string().refine(v => normalizeMapEmbed(v) !== null, "URL nhúng Google Maps chưa hợp lệ.")
    .transform(v => normalizeMapEmbed(v) ?? ""),
  mapsUrl: z.string().refine(v => normalizeMapsLink(v) !== null, "Liên kết chỉ đường chưa hợp lệ.")
    .transform(v => normalizeMapsLink(v) ?? ""),
}).refine(v => !v.mapEmbedUrl && !v.mapsUrl || !!v.officeAddress, "Nhập địa chỉ văn phòng trước khi thêm bản đồ.");
