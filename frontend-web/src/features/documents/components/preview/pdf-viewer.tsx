"use client";

import React, { useState } from "react";
import { ExternalLink, Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfViewerProps {
  url: string;
  fileName: string;
  downloadUrl?: string;
}

export function PdfViewer({ url, fileName, downloadUrl }: PdfViewerProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const targetDownload = downloadUrl || url;

  return (
    <div className="relative w-full h-[70vh] min-h-[480px] bg-slate-900/5 dark:bg-slate-950 rounded-2xl overflow-hidden flex flex-col">
      {loading && !loadError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 gap-2">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Đang tải tài liệu PDF…</p>
        </div>
      )}

      {loadError ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Trình duyệt không hỗ trợ xem trực tiếp tài liệu này
            </h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Bạn có thể mở tài liệu trong tab mới hoặc tải về máy để xem với ứng dụng đọc PDF.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ExternalLink className="w-3.5 h-3.5" />
                Mở trong tab mới
              </Button>
            </a>
            <a href={targetDownload} download={fileName}>
              <Button size="sm" className="gap-1.5 text-xs bg-sky-700 hover:bg-sky-800 text-white">
                <Download className="w-3.5 h-3.5" />
                Tải về máy
              </Button>
            </a>
          </div>
        </div>
      ) : (
        <iframe
          src={`${url}#toolbar=1&navpanes=0`}
          title={fileName}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setLoadError(true);
          }}
        />
      )}
    </div>
  );
}
