"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, WrapText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TextViewerProps {
  url: string;
  fileName: string;
}

export function TextViewer({ url, fileName }: TextViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wrapLines, setWrapLines] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (active) {
          setContent(text);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Không thể nạp nội dung văn bản");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [url]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="h-80 flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-2xl">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Đang đọc nội dung tệp tin…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-80 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
        <AlertCircle className="w-10 h-10 text-amber-500" />
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Không thể hiển thị nội dung trực tiếp: {error}
        </p>
      </div>
    );
  }

  const lines = content.split("\n");

  return (
    <div className="flex flex-col gap-2 w-full h-[65vh] min-h-[400px]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
        <span className="text-[11px] text-slate-500 font-mono">
          {lines.length} dòng · {new Blob([content]).size} bytes
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWrapLines(!wrapLines)}
            className="h-7 px-2 text-[11px] gap-1 rounded-lg text-slate-600 dark:text-slate-300"
          >
            <WrapText className="w-3.5 h-3.5" />
            <span>{wrapLines ? "Bỏ ngắt dòng" : "Tự ngắt dòng"}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-[11px] gap-1 rounded-lg text-slate-600 dark:text-slate-300"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 leading-relaxed border border-slate-800">
        <pre className={wrapLines ? "whitespace-pre-wrap break-words" : "whitespace-pre"}>
          {content}
        </pre>
      </div>
    </div>
  );
}
