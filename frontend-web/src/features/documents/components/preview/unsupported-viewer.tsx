"use client";

import React from "react";
import { Download, FileArchive } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnsupportedViewerProps {
  url: string;
  fileName: string;
  downloadUrl?: string;
  fileSize?: string;
}

export function UnsupportedViewer({
  url,
  fileName,
  downloadUrl,
  fileSize,
}: UnsupportedViewerProps) {
  const targetDownload = downloadUrl || url;

  return (
    <div className="min-h-[340px] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
        <FileArchive className="w-8 h-8" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
          {fileName}
        </h4>
        {fileSize && <p className="text-xs text-slate-400">Dung lượng: {fileSize}</p>}
        <p className="text-xs text-slate-500">
          Định dạng tệp này không hỗ trợ xem trực tiếp trên trình duyệt. Vui lòng tải về máy để mở bằng ứng dụng tương ứng.
        </p>
      </div>

      <a href={targetDownload} download={fileName} className="pt-2">
        <Button size="sm" className="gap-2 text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white rounded-xl shadow-xs px-4">
          <Download className="w-4 h-4" />
          Tải xuống tệp
        </Button>
      </a>
    </div>
  );
}
