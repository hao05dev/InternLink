"use client";

import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText, ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGoogleDocsViewerUrl } from "../../utils/file-preview-utils";

interface OfficeFallbackViewerProps {
  url: string;
  fileName: string;
  downloadUrl?: string;
}

export function OfficeFallbackViewer({ url, fileName, downloadUrl }: OfficeFallbackViewerProps) {
  const isWebUrl = url.startsWith("http://") || url.startsWith("https://");
  const [showEmbed, setShowEmbed] = useState(isWebUrl);
  const targetDownload = downloadUrl || url;
  const isExcel = fileName.toLowerCase().includes("xls");

  if (showEmbed && isWebUrl) {
    return (
      <div className="flex flex-col gap-2 w-full h-[70vh] min-h-[480px]">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            Đang hiển thị qua trình xem trực tuyến
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEmbed(false)}
              className="text-[11px] text-slate-500 hover:text-slate-800 underline"
            >
              Xem thông tin tệp
            </button>
            <a href={targetDownload} download={fileName}>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                <Download className="w-3 h-3" />
                Tải về
              </Button>
            </a>
          </div>
        </div>
        <iframe
          src={getGoogleDocsViewerUrl(url)}
          title={fileName}
          className="w-full flex-1 rounded-xl border border-slate-200 dark:border-slate-800"
        />
      </div>
    );
  }

  return (
    <div className="min-h-[360px] flex flex-col items-center justify-center p-8 text-center space-y-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
        {isExcel ? <FileSpreadsheet className="w-8 h-8 text-teal-600" /> : <FileText className="w-8 h-8 text-blue-600" />}
      </div>

      <div className="space-y-1.5 max-w-md">
        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">
          {fileName}
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          Định dạng tài liệu văn phòng này cần ứng dụng tương thích (Microsoft Office, Google Docs/Sheets hoặc LibreOffice) để hiển thị đầy đủ và chính xác nhất.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {isWebUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEmbed(true)}
            className="gap-1.5 text-xs rounded-xl"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Xem trước qua Google Docs Viewer
          </Button>
        )}
        <a href={targetDownload} download={fileName}>
          <Button
            size="sm"
            className="gap-2 text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white rounded-xl shadow-xs px-4"
          >
            <Download className="w-4 h-4" />
            Tải tệp tin về máy
          </Button>
        </a>
      </div>
    </div>
  );
}
