"use client";

import { useState, useCallback } from "react";
import { PreviewableFile } from "../types/preview.types";

export function useFilePreview() {
  const [previewFile, setPreviewFile] = useState<PreviewableFile | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openPreview = useCallback((file: PreviewableFile) => {
    setPreviewFile(file);
    setIsOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsOpen(false);
    setPreviewFile(null);
  }, []);

  return {
    previewFile,
    isOpen,
    openPreview,
    closePreview,
  };
}
