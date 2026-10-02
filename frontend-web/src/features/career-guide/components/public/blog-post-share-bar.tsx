"use client";

import { useState } from "react";
import { Share2, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BlogPostShareBarProps {
    title: string;
}

export function BlogPostShareBar({ title }: BlogPostShareBarProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-y border-slate-200 dark:border-slate-800">
            <Link
                href="/cam-nang"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Trở lại danh sách cẩm nang</span>
            </Link>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="rounded-full text-xs h-8 gap-1.5 border-slate-200 dark:border-slate-800"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Đã sao chép liên kết</span>
                        </>
                    ) : (
                        <>
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Chia sẻ bài viết</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
