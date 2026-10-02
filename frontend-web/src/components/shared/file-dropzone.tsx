"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileDropzoneProps {
    onFileSelect: (file: File) => void;
    acceptedExtensions?: string[]; // e.g. [".xlsx", ".xls", ".csv"]
    maxSizeMB?: number;
    title?: string;
    description?: string;
    className?: string;
    disabled?: boolean;
}

export function FileDropzone({
    onFileSelect,
    acceptedExtensions = [".xlsx", ".xls", ".csv"],
    maxSizeMB = 10,
    title = "Kéo thả file danh sách vào đây",
    description = "Hỗ trợ định dạng .xlsx, .xls, .csv (Tối đa 10MB)",
    className,
    disabled = false,
}: FileDropzoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateAndSetFile = (file: File) => {
        setErrorMsg(null);
        
        // Validate extension
        const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
        const isValidExt = acceptedExtensions.some((ext) => ext.toLowerCase() === fileExt);

        if (!isValidExt) {
            setErrorMsg(`Định dạng không hợp lệ (${fileExt}). Vui lòng chọn file: ${acceptedExtensions.join(", ")}`);
            return;
        }

        // Validate size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            setErrorMsg(`Kích thước file (${fileSizeMB.toFixed(1)}MB) vượt quá giới hạn cho phép (${maxSizeMB}MB).`);
            return;
        }

        setSelectedFile(file);
        onFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            validateAndSetFile(file);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            validateAndSetFile(file);
        }
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setErrorMsg(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div className={cn("w-full space-y-2", className)}>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && inputRef.current?.click()}
                className={cn(
                    "relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center",
                    isDragOver
                        ? "border-blue-500 bg-blue-50/60 scale-[1.01] shadow-md shadow-blue-500/10"
                        : "border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-blue-400/80 shadow-2xs",
                    disabled && "opacity-50 cursor-not-allowed hover:bg-slate-50/50 hover:border-slate-200/90"
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={acceptedExtensions.join(",")}
                    onChange={handleFileInputChange}
                    disabled={disabled}
                    className="hidden"
                />

                {selectedFile ? (
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-emerald-200 shadow-xs max-w-md w-full animate-in zoom-in-95 duration-150">
                        <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <FileSpreadsheet className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                            <p className="text-[11px] text-slate-500">
                                {(selectedFile.size / 1024).toFixed(1)} KB • Sẵn sàng nhập
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa file đã chọn"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div
                            className={cn(
                                "mx-auto h-12 w-12 rounded-2xl flex items-center justify-center transition-transform duration-200",
                                isDragOver ? "bg-blue-600 text-white scale-110" : "bg-blue-50 text-blue-600"
                            )}
                        >
                            <UploadCloud className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">{title}</p>
                            <p className="text-xs text-slate-500 mt-1">{description}</p>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50">
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                            <span>Hoặc duyệt tìm file từ máy tính</span>
                        </div>
                    </div>
                )}
            </div>

            {errorMsg && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{errorMsg}</span>
                </div>
            )}
        </div>
    );
}
