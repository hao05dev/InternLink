"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  FileCode,
  FileSpreadsheet,
  FileArchive,
} from "lucide-react";

export interface UploadedFileItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: string;
  fileType?: "PDF" | "DOCX" | "XLSX" | "ZIP" | "IMAGE" | "OTHER";
}

interface FileUploaderProps {
  label?: string;
  description?: string;
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
  value?: UploadedFileItem[];
  onChange: (files: UploadedFileItem[]) => void;
  allowUrlInput?: boolean;
  upload?: (file: File) => Promise<UploadedFileItem>;
  disabled?: boolean;
  onUploadStateChange?: (busy: boolean) => void;
}

export function FileUploader({
  label = "Tải lên tệp đính kèm",
  description = "Hỗ trợ kéo thả file PDF, DOCX, XLSX hoặc ảnh PNG/JPG (tối đa 15MB)",
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.zip,.png,.jpg,.jpeg,.webp",
  maxSizeMb = 15,
  multiple = true,
  value = [],
  onChange,
  allowUrlInput = true,
  upload,
  disabled = false,
  onUploadStateChange,
}: FileUploaderProps) {
  const uploadingRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlName, setUrlName] = useState("");
  const [urlLink, setUrlLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const getFileType = (fileName: string): UploadedFileItem["fileType"] => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext || ""))
      return "IMAGE";
    if (["pdf"].includes(ext || "")) return "PDF";
    if (["doc", "docx"].includes(ext || "")) return "DOCX";
    if (["xls", "xlsx"].includes(ext || "")) return "XLSX";
    if (["zip", "rar", "7z"].includes(ext || "")) return "ZIP";
    return "OTHER";
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || uploadingRef.current || disabled) return;
    if (!upload) {
      setError("Chưa cấu hình nơi tải tệp.");
      return;
    }
    uploadingRef.current = true;
    setError(null);
    setBusy(true);
    onUploadStateChange?.(true);
    const newItems: UploadedFileItem[] = [];
    try {
      for (const file of Array.from(files)) {
        if (!file.size || file.size > maxSizeMb * 1024 * 1024)
          throw new Error(`Tệp ${file.name} rỗng hoặc vượt ${maxSizeMb} MiB.`);
        newItems.push(await upload(file));
        if (!multiple) break;
      }
    } catch (failure) {
      if (mounted.current)
        setError(
          failure instanceof Error ? failure.message : "Không tải được tệp.",
        );
    } finally {
      if (mounted.current && newItems.length)
        onChange(multiple ? [...value, ...newItems] : newItems);
      uploadingRef.current = false;
      if (mounted.current) setBusy(false);
      onUploadStateChange?.(false);
    }
  };
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlLink.trim()) return;

    const name =
      urlName.trim() ||
      urlLink.split("/").pop()?.split("?")[0] ||
      "Tài liệu liên kết";
    const newItem: UploadedFileItem = {
      id: `url-${Date.now()}`,
      fileName: name,
      fileUrl: urlLink.trim(),
      fileSize: "Link ngoài",
      fileType: getFileType(name),
    };

    onChange(multiple ? [...value, ...(newItem ? [newItem] : [])] : [newItem]);
    setUrlName("");
    setUrlLink("");
    setShowUrlInput(false);
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((f) => f.id !== id));
  };

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
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">
            {label}
          </label>
          {allowUrlInput && (
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[11px] font-medium text-sky-700 hover:text-sky-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <LinkIcon className="w-3 h-3" />
              <span>
                {showUrlInput
                  ? "Ẩn nhập link"
                  : "+ Chèn link file Google Drive / URL"}
              </span>
            </button>
          )}
        </div>
      )}

      {/* URL Input Bar */}
      {showUrlInput && (
        <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={urlName}
              onChange={(e) => setUrlName(e.target.value)}
              placeholder="Tên hiển thị (VD: Biểu mẫu thực tập M-TT-01)"
              className="px-3 py-1.5 rounded-xl border border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
            />
            <input
              type="url"
              value={urlLink}
              onChange={(e) => setUrlLink(e.target.value)}
              placeholder="https://drive.google.com/... hoặc link trực tiếp"
              className="px-3 py-1.5 rounded-xl border border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowUrlInput(false)}
              className="text-xs py-1"
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddUrl}
              className="text-xs py-1"
            >
              Thêm liên kết
            </Button>
          </div>
        </div>
      )}

      {busy && (
        <p role="status" className="text-sm text-slate-500">
          Đang tải tệp…
        </p>
      )}
      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => {
          if (!busy && !disabled) fileInputRef.current?.click();
        }}
        className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
          isDragging
            ? "border-sky-500 bg-sky-50/50"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled || busy}
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-1.5 text-slate-500">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <UploadCloud className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-xs font-semibold text-slate-800">
            Nhấn để chọn file hoặc kéo thả tệp vào đây
          </p>
          <p className="text-[11px] text-slate-400">{description}</p>
        </div>
      </div>

      {error && (
        <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </p>
      )}

      {/* Uploaded File List */}
      {value.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {value.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {renderFileIcon(file.fileType)}
                <span
                  className="font-semibold text-slate-800 truncate"
                  title={file.fileName}
                >
                  {file.fileName}
                </span>
                {file.fileSize && (
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    ({file.fileSize})
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemove(file.id)}
                className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                aria-label="Xóa tệp"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
