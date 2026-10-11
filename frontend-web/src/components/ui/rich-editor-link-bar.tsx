'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface RichEditorLinkBarProps {
    linkUrl: string;
    onLinkUrlChange: (url: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

export function RichEditorLinkBar({
    linkUrl,
    onLinkUrlChange,
    onSubmit,
    onClose,
}: RichEditorLinkBarProps) {
    return (
        <form
            onSubmit={onSubmit}
            className="p-2.5 bg-sky-50 border-b border-sky-200 text-xs flex flex-wrap items-center gap-2"
        >
            <input
                type="text"
                value={linkUrl}
                onChange={(e) => onLinkUrlChange(e.target.value)}
                placeholder="Nhập đường dẫn liên kết (VD: https://...)"
                className="flex-1 min-w-[220px] px-3 py-1.5 rounded-lg border border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white text-sm"
                autoFocus
            />
            <Button type="submit" variant="primary" size="sm" className="text-xs py-1">
                {linkUrl.trim() ? 'Lưu liên kết' : 'Bỏ liên kết'}
            </Button>
            <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="text-xs py-1"
            >
                Đóng
            </Button>
        </form>
    );
}
