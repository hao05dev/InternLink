import { apiClient } from "./api-client";
export type MediaPurpose =
  | "COMPANY_LOGO"
  | "COMPANY_COVER"
  | "JOB_BANNER"
  | "JOB_IMAGE"
  | "JOB_ATTACHMENT"
  | "POST_COVER"
  | "POST_IMAGE"
  | "POST_ATTACHMENT"
  | "PORTFOLIO_IMAGE";
export type MediaScope = {
  purpose: MediaPurpose;
  contextId?: string;
  scope?: string;
};
export type UploadedMedia = {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};
export async function uploadMedia(file: File, scope: MediaScope) {
  const max = scope.purpose.endsWith("_ATTACHMENT") ? 20 : 5;
  if (file.size === 0 || file.size > max * 1024 * 1024)
    throw new Error(`Tệp phải có dung lượng từ 1 byte đến ${max} MiB.`);
  const params = new URLSearchParams({ purpose: scope.purpose });
  if (scope.contextId) params.set("contextId", scope.contextId);
  if (scope.scope) params.set("scope", scope.scope);
  const body = new FormData();
  body.append("file", file);
  return (
    await apiClient.upload<UploadedMedia>(`/api/v1/media?${params}`, body)
  ).data;
}
