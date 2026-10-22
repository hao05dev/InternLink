export type PreviewType =
  | "pdf"
  | "image"
  | "text"
  | "audio"
  | "video"
  | "office"
  | "unsupported";

export interface PreviewableFile {
  id?: string;
  fileName: string;
  fileUrl: string;
  fileSize?: string | number;
  mimeType?: string;
  downloadUrl?: string;
}

export interface PreviewState {
  file: PreviewableFile | null;
  isOpen: boolean;
}
