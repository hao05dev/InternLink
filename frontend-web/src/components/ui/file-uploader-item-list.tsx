"use client";

import React from "react";
import {
  FileText,
  Image as ImageIcon,
  X,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  Eye,
} from "lucide-react";
import { UploadedFileItem } from "./file-uploader";
import { useFilePreview } from "@/features/documents/hooks/use-file-preview";
import { FilePreviewModal } from "@/features/documents/components/modals/file-preview-modal";

interface FileUploaderItemListProps {
  files: UploadedFileItem[];
  onRemove: (id: string) => void;
}

export function FileUploaderItemList({ files, onRemove }: FileUploaderItemListProps) {
  const { previewFile, isOpen, openPreview, closePreview } = useFilePreview();

  if (files.length === 0) return null;

  const renderFileIcon = (type?: UploadedFileItem["fileType"]) => {
    switch (type) {
      case "IMAGE":
        return <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />;
      case "PDF":
        return <FileText className="w-4 h-4 text-rose-600 shrink-0" />;
      case "DOCX":
        return <FileText className="w-4 h-4 text-blue-600 shrink-0" />;
      case "XLSX":
        return <FileSpreadsheet className="w-4 h-4 text-teal-600 shrink-0" />;
      case "ZIP":
        return <FileArchive className="w-4 h-4 text-amber-600 shrink-0" />;
      default:
        return <FileCode className="w-4 h-4 text-slate-600 shrink-0" />;
    }
  };

  return (
    <>
      <div className="space-y-1.5 pt-1">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
          >
            <div
              className={`flex items-center gap-2 min-w-0 flex-1 ${
                file.fileUrl ? "cursor-pointer hover:text-sky-700" : ""
              }`}
              onClick={() => {
                if (file.fileUrl) {
                  openPreview({
                    id: file.id,
                    fileName: file.fileName,
                    fileUrl: file.fileUrl,
                    fileSize: file.fileSize,
                  });
                }
              }}
            >
              {renderFileIcon(file.fileType)}
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={file.fileName}>
                {file.fileName}
              </span>
              {file.fileSize && (
                <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                  ({file.fileSize})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {file.fileUrl && (
                <button
                  type="button"
                  onClick={() =>
                    openPreview({
                      id: file.id,
                      fileName: file.fileName,
                      fileUrl: file.fileUrl,
                      fileSize: file.fileSize,
                    })
                  }
                  className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Xem trước tệp"
                  aria-label="Xem trước tệp"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onRemove(file.id)}
                className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer"
                aria-label="Xóa tệp"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <FilePreviewModal file={previewFile} isOpen={isOpen} onClose={closePreview} />
    </>
  );
}
