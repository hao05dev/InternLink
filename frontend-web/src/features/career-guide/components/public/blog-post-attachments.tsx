"use client";

import React from "react";
import { Download, FileText, FileSpreadsheet, FileArchive, Paperclip, Eye } from "lucide-react";
import { PostAttachment } from "../../types/post.types";
import { useFilePreview } from "@/features/documents/hooks/use-file-preview";
import { FilePreviewModal } from "@/features/documents/components/modals/file-preview-modal";

interface BlogPostAttachmentsProps {
    attachments: PostAttachment[];
}

export function BlogPostAttachments({ attachments }: BlogPostAttachmentsProps) {
    const { previewFile, isOpen, openPreview, closePreview } = useFilePreview();

    if (!attachments || attachments.length === 0) return null;

    const getFileIcon = (fileName: string, fileType?: string) => {
        const ext = (fileType || fileName.split(".").pop() || "").toLowerCase();
        if (ext.includes("pdf")) return <FileText className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
        if (ext.includes("xls") || ext.includes("csv")) return <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
        if (ext.includes("zip") || ext.includes("rar")) return <FileArchive className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
        return <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
    };

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Tài liệu & Biểu mẫu đính kèm ({attachments.length})
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((att, idx) => (
                    <div
                        key={att.id || idx}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-xs transition-all group"
                    >
                        <div
                            className="flex items-center gap-3 min-w-0 pr-2 flex-1 cursor-pointer"
                            onClick={() =>
                                openPreview({
                                    id: att.id,
                                    fileName: att.fileName,
                                    fileUrl: att.fileUrl,
                                    fileSize: att.fileSize,
                                    mimeType: att.fileType,
                                })
                            }
                        >
                            <div className="shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-50 dark:group-hover:bg-sky-950 transition-colors">
                                {getFileIcon(att.fileName, att.fileType)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                    {att.fileName}
                                </p>
                                {att.fileSize && (
                                    <span className="text-[11px] text-slate-400">
                                        {att.fileSize}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                type="button"
                                onClick={() =>
                                    openPreview({
                                        id: att.id,
                                        fileName: att.fileName,
                                        fileUrl: att.fileUrl,
                                        fileSize: att.fileSize,
                                        mimeType: att.fileType,
                                    })
                                }
                                className="p-1.5 rounded-md text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                title="Xem trước tài liệu"
                                aria-label="Xem trước tài liệu"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <a
                                href={att.fileUrl}
                                download={att.fileName}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-md text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                title="Tải xuống tài liệu"
                                aria-label="Tải xuống tài liệu"
                            >
                                <Download className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <FilePreviewModal file={previewFile} isOpen={isOpen} onClose={closePreview} />
        </div>
    );
}
