"use client";

import React from "react";
import { Music, Video } from "lucide-react";

interface MediaViewerProps {
  url: string;
  fileName: string;
  type: "audio" | "video";
}

export function MediaViewer({ url, fileName, type }: MediaViewerProps) {
  return (
    <div className="w-full min-h-[360px] flex flex-col items-center justify-center p-6 bg-slate-950/5 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 gap-4">
      <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600">
        {type === "video" ? <Video className="w-6 h-6" /> : <Music className="w-6 h-6" />}
      </div>

      <div className="text-center space-y-1">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-md">
          {fileName}
        </h4>
        <p className="text-xs text-slate-400">
          Đang phát nội dung {type === "video" ? "video" : "âm thanh"} đa phương tiện
        </p>
      </div>

      <div className="w-full max-w-xl">
        {type === "video" ? (
          <video
            controls
            playsInline
            src={url}
            className="w-full rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 max-h-[50vh] bg-black"
          >
            Trình duyệt của bạn không hỗ trợ thẻ video HTML5.
          </video>
        ) : (
          <audio controls src={url} className="w-full">
            Trình duyệt của bạn không hỗ trợ thẻ audio HTML5.
          </audio>
        )}
      </div>
    </div>
  );
}
