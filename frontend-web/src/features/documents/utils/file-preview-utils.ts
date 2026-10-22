import { PreviewType } from "../types/preview.types";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"]);
const PDF_EXTENSIONS = new Set(["pdf"]);
const TEXT_EXTENSIONS = new Set(["txt", "csv", "json", "md", "log", "xml", "yaml", "yml", "js", "ts", "html"]);
const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "ogg", "m4a", "flac"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "ogv", "mov"]);
const OFFICE_EXTENSIONS = new Set(["doc", "docx", "xls", "xlsx", "ppt", "pptx"]);

export function getFileExtension(fileName?: string): string {
  if (!fileName) return "";
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase().trim() : "";
}

export function getPreviewType(fileName?: string, mimeType?: string): PreviewType {
  const mime = mimeType?.toLowerCase() || "";
  const ext = getFileExtension(fileName);

  if (mime.includes("pdf") || PDF_EXTENSIONS.has(ext)) {
    return "pdf";
  }
  if (mime.startsWith("image/") || IMAGE_EXTENSIONS.has(ext)) {
    return "image";
  }
  if (mime.startsWith("audio/") || AUDIO_EXTENSIONS.has(ext)) {
    return "audio";
  }
  if (mime.startsWith("video/") || VIDEO_EXTENSIONS.has(ext)) {
    return "video";
  }
  if (
    mime.startsWith("text/") ||
    mime.includes("json") ||
    mime.includes("xml") ||
    TEXT_EXTENSIONS.has(ext)
  ) {
    return "text";
  }
  if (
    mime.includes("officedocument") ||
    mime.includes("msword") ||
    mime.includes("ms-excel") ||
    mime.includes("ms-powerpoint") ||
    OFFICE_EXTENSIONS.has(ext)
  ) {
    return "office";
  }
  return "unsupported";
}

export function isDirectlyPreviewable(fileName?: string, mimeType?: string): boolean {
  const type = getPreviewType(fileName, mimeType);
  return type === "pdf" || type === "image" || type === "text" || type === "audio" || type === "video";
}

export function getGoogleDocsViewerUrl(fileUrl: string): string {
  return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
}

export function formatFileSize(size?: number | string): string {
  if (size === undefined || size === null || size === "") return "";
  if (typeof size === "string") return size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
