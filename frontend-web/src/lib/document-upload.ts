import { apiClient } from "./api-client";
type Context =
  | "PROFILE"
  | "APPLICATION"
  | "SELF_FOUND"
  | "AGREEMENT"
  | "PLACEMENT"
  | "TASK"
  | "LOGBOOK"
  | "EVALUATION"
  | "CASE";
type DocumentType =
  | "CV"
  | "AGREEMENT"
  | "EVIDENCE"
  | "CERTIFICATE"
  | "REPORT"
  | "ACCEPTANCE_LETTER"
  | "EXTERNAL_EVALUATION";
export type UploadedDocument = { id: string };
const mime: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  txt: "text/plain",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};
export async function uploadDocument(
  file: File,
  contextType: Context,
  contextId: string,
  documentType: DocumentType,
) {
  const capabilities = await apiClient.get<{
    directUpload: boolean;
    maxBytes: number;
  }>("/api/v1/documents/uploads/capabilities");
  if (file.size === 0 || file.size > capabilities.data.maxBytes)
    throw new Error("Tệp rỗng hoặc vượt giới hạn upload.");
  const mimeType =
    mime[file.name.split(".").pop()?.toLowerCase() ?? ""] ?? file.type;
  if (!capabilities.data.directUpload) {
    const form = new FormData();
    form.append(
      "file",
      file.type === mimeType
        ? file
        : new File([file], file.name, { type: mimeType }),
    );
    return apiClient.upload<UploadedDocument>(
      `/api/v1/documents/upload?contextType=${contextType}&contextId=${encodeURIComponent(contextId)}&docType=${documentType}`,
      form,
    );
  }
  const digest = await crypto.subtle.digest(
    "SHA-256",
    await file.arrayBuffer(),
  );
  const checksum = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const ticket = await apiClient.post<{
    id: string;
    uploadUrl: string;
    headers: Record<string, string>;
  }>("/api/v1/documents/uploads", {
    contextType,
    contextId,
    documentType,
    fileName: file.name,
    mimeType,
    sizeBytes: file.size,
    checksum,
  });
  const sent = await fetch(ticket.data.uploadUrl, {
    method: "PUT",
    headers: ticket.data.headers,
    body: file,
    credentials: "omit",
  });
  if (!sent.ok)
    throw new Error("Upload R2 thất bại. Kiểm tra CORS và thời hạn URL.");
  return apiClient.post<UploadedDocument>(
    `/api/v1/documents/uploads/${ticket.data.id}/finalize`,
  );
}
