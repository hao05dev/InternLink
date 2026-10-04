"use client";
import { createContext } from "react";
import type { MediaScope } from "@/lib/media-upload";
export const PortfolioMediaScope = createContext<
  | (MediaScope & {
      uploading?: boolean;
      onUploadStateChange?: (busy: boolean) => void;
    })
  | null
>(null);
