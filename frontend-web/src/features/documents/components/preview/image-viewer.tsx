"use client";

import React, { useState } from "react";
import { ZoomIn, ZoomOut, RotateCw, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageViewerProps {
  url: string;
  fileName: string;
}

export function ImageViewer({ url, fileName }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  if (hasError) {
    return (
      <div className="h-80 flex flex-col items-center justify-center text-center p-6 space-y-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Không thể tải hình ảnh này hoặc liên kết đã hết hạn.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Zoom / Rotate Toolbar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          className="h-7 w-7 p-0 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-300"
          title="Thu nhỏ"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-2 min-w-[48px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          disabled={scale >= 3}
          className="h-7 w-7 p-0 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-300"
          title="Phóng to"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRotate}
          className="h-7 w-7 p-0 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-300"
          title="Xoay 90 độ"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-7 w-7 p-0 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-300"
          title="Khôi phục kích thước ban đầu"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Image Viewport */}
      <div className="w-full h-[65vh] min-h-[400px] flex items-center justify-center overflow-auto rounded-2xl bg-slate-950/5 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800">
        <img
          src={url}
          alt={fileName}
          onError={() => setHasError(true)}
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: "transform 0.15s ease-out",
          }}
          className="max-h-full max-w-full object-contain rounded-lg select-none shadow-md"
        />
      </div>
    </div>
  );
}
