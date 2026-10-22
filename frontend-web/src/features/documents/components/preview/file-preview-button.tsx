"use client";

import React from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreviewableFile } from "../../types/preview.types";

interface FilePreviewButtonProps {
  file: PreviewableFile;
  onPreview: (file: PreviewableFile) => void;
  variant?: "icon" | "button" | "pill";
  label?: string;
  className?: string;
}

export function FilePreviewButton({
  file,
  onPreview,
  variant = "icon",
  label = "Xem trước",
  className = "",
}: FilePreviewButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPreview(file);
  };

  if (variant === "button") {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleClick}
        className={`gap-1.5 text-xs font-semibold ${className}`}
      >
        <Eye className="w-3.5 h-3.5 text-sky-600" />
        <span>{label}</span>
      </Button>
    );
  }

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 transition cursor-pointer ${className}`}
      >
        <Eye className="w-3 h-3" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition cursor-pointer ${className}`}
      title={label}
      aria-label={label}
    >
      <Eye className="w-4 h-4" />
    </button>
  );
}
