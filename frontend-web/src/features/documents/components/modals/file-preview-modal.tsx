"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, FileText, Image as ImageIcon, Music, Video, FileSpreadsheet, FileArchive } from "lucide-react";
import { PreviewableFile } from "../../types/preview.types";
import { getPreviewType, formatFileSize } from "../../utils/file-preview-utils";
import { PdfViewer } from "../preview/pdf-viewer";
import { ImageViewer } from "../preview/image-viewer";
import { TextViewer } from "../preview/text-viewer";
import { MediaViewer } from "../preview/media-viewer";
import { OfficeFallbackViewer } from "../preview/office-fallback-viewer";
import { UnsupportedViewer } from "../preview/unsupported-viewer";

export interface FilePreviewModalProps {
  file: PreviewableFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FilePreviewModal({ file, isOpen, onClose }: FilePreviewModalProps) {
  if (!file) return null;

  const type = getPreviewType(file.fileName, file.mimeType);
  const targetDownload = file.downloadUrl || file.fileUrl;
  const sizeText = formatFileSize(file.fileSize);

  const getHeaderIcon = () => {
    switch (type) {
      case "pdf":
        return <FileText className="w-5 h-5 text-rose-600" />;
      case "image":
        return <ImageIcon className="w-5 h-5 text-emerald-600" />;
      case "audio":
        return <Music className="w-5 h-5 text-indigo-600" />;
      case "video":
        return <Video className="w-5 h-5 text-purple-600" />;
      case "office":
        return <FileSpreadsheet className="w-5 h-5 text-teal-600" />;
      default:
        return <FileArchive className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTypeBadgeLabel = () => {
    switch (type) {
      case "pdf": return "Tài liệu PDF";
      case "image": return "Hình ảnh";
      case "text": return "Tệp văn bản / Mã nguồn";
      case "audio": return "Tệp âm thanh";
      case "video": return "Tệp video";
      case "office": return "Tài liệu văn phòng";
      default: return "Tệp đính kèm";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5 min-w-0 pr-6">
          <div className="shrink-0 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
            {getHeaderIcon()}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-md sm:max-w-xl">
              {file.fileName}
            </h3>
            <div className="flex items-center gap-2 pt-0.5">
              <Badge variant="outline" className="text-[10px] font-medium py-0 px-1.5 rounded-full">
                {getTypeBadgeLabel()}
              </Badge>
              {sizeText && (
                <span className="text-[11px] text-slate-400 font-normal">
                  {sizeText}
                </span>
              )}
            </div>
          </div>
        </div>
      }
      maxWidth="5xl"
    >
      <div className="space-y-4">
        {/* Content Viewer based on Preview Type */}
        <div className="w-full">
          {type === "pdf" && (
            <PdfViewer url={file.fileUrl} fileName={file.fileName} downloadUrl={targetDownload} />
          )}
          {type === "image" && (
            <ImageViewer url={file.fileUrl} fileName={file.fileName} />
          )}
          {type === "text" && (
            <TextViewer url={file.fileUrl} fileName={file.fileName} />
          )}
          {(type === "audio" || type === "video") && (
            <MediaViewer url={file.fileUrl} fileName={file.fileName} type={type} />
          )}
          {type === "office" && (
            <OfficeFallbackViewer url={file.fileUrl} fileName={file.fileName} downloadUrl={targetDownload} />
          )}
          {type === "unsupported" && (
            <UnsupportedViewer
              url={file.fileUrl}
              fileName={file.fileName}
              downloadUrl={targetDownload}
              fileSize={sizeText}
            />
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <a
            href={file.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-sky-700 dark:hover:text-sky-400 flex items-center gap-1.5 font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Mở trong cửa sổ mới</span>
          </a>

          <div className="flex items-center gap-2">
            <a href={targetDownload} download={file.fileName}>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold">
                <Download className="w-3.5 h-3.5" />
                <span>Tải về</span>
              </Button>
            </a>
            <Button size="sm" onClick={onClose} className="text-xs">
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
