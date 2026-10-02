'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Bold,
    Italic,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Code,
    Link as LinkIcon,
    Image as ImageIcon,
    Eye,
    Edit3,
    Columns,
    Minus,
    Table,
    HelpCircle
} from 'lucide-react';

interface RichEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
    label?: string;
    description?: string;
    required?: boolean;
}

export function RichEditor({
    value,
    onChange,
    placeholder = 'Nhập nội dung bài viết / mô tả chi tiết tại đây...',
    minHeight = '350px',
    label,
    description,
    required = false,
}: RichEditorProps) {
    const [viewMode, setViewMode] = useState<'write' | 'preview' | 'split'>('write');
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkText, setLinkText] = useState('');
    const [linkUrl, setLinkUrl] = useState('');

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end) || defaultText;

        const before = textarea.value.substring(0, start);
        const after = textarea.value.substring(end);

        const newContent = `${before}${prefix}${selectedText}${suffix}${after}`;
        onChange(newContent);

        // Reset cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + prefix.length,
                start + prefix.length + selectedText.length
            );
        }, 10);
    };

    const handleInsertImage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl.trim()) return;

        const alt = imageAlt.trim() || 'Hình ảnh';
        const imageMarkdown = `\n![${alt}](${imageUrl.trim()})\n*${alt}*\n`;
        insertFormatting(imageMarkdown);

        setImageUrl('');
        setImageAlt('');
        setShowImageDialog(false);
    };

    const handleInsertLink = (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkUrl.trim()) return;

        const text = linkText.trim() || linkUrl.trim();
        const linkMarkdown = `[${text}](${linkUrl.trim()})`;
        insertFormatting(linkMarkdown);

        setLinkText('');
        setLinkUrl('');
        setShowLinkDialog(false);
    };

    // Simple, robust Markdown parser for Live Preview
    const renderMarkdownPreview = (content: string) => {
        if (!content.trim()) {
            return (
                <p className="text-slate-400 italic text-center py-12">
                    Nội dung xem trước sẽ hiển thị tại đây khi bạn soạn thảo...
                </p>
            );
        }

        const lines = content.split('\n');
        const renderedElements: React.ReactNode[] = [];

        let inList = false;
        let listItems: string[] = [];

        const flushList = () => {
            if (listItems.length > 0) {
                renderedElements.push(
                    <ul key={`ul-${renderedElements.length}`} className="list-disc list-inside space-y-1 my-3 text-slate-700">
                        {listItems.map((item, idx) => (
                            <li key={idx} className="leading-relaxed">{item}</li>
                        ))}
                    </ul>
                );
                listItems = [];
                inList = false;
            }
        };

        lines.forEach((line, index) => {
            const trimmed = line.trim();

            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                inList = true;
                listItems.push(trimmed.substring(2));
                return;
            } else {
                flushList();
            }

            if (trimmed.startsWith('### ')) {
                renderedElements.push(
                    <h3 key={index} className="text-lg font-bold text-slate-900 mt-5 mb-2">
                        {trimmed.substring(4)}
                    </h3>
                );
            } else if (trimmed.startsWith('## ')) {
                renderedElements.push(
                    <h2 key={index} className="text-xl font-black text-slate-900 mt-6 mb-2 border-b border-slate-100 pb-1">
                        {trimmed.substring(3)}
                    </h2>
                );
            } else if (trimmed.startsWith('# ')) {
                renderedElements.push(
                    <h1 key={index} className="text-2xl font-black text-slate-900 mt-6 mb-3">
                        {trimmed.substring(2)}
                    </h1>
                );
            } else if (trimmed.startsWith('> ')) {
                renderedElements.push(
                    <blockquote key={index} className="border-l-4 border-sky-500 bg-sky-50/60 pl-4 py-2 my-3 rounded-r-xl italic text-slate-700">
                        {trimmed.substring(2)}
                    </blockquote>
                );
            } else if (trimmed.startsWith('![') && trimmed.includes('](')) {
                const alt = trimmed.substring(trimmed.indexOf('![') + 2, trimmed.indexOf(']('));
                const src = trimmed.substring(trimmed.indexOf('](') + 2, trimmed.indexOf(')'));
                renderedElements.push(
                    <div key={index} className="my-5 space-y-1.5 text-center">
                        <img
                            src={src}
                            alt={alt}
                            className="max-h-96 mx-auto rounded-2xl shadow-sm border border-slate-200 object-cover"
                        />
                        {alt && <p className="text-[11px] text-slate-500 italic">{alt}</p>}
                    </div>
                );
            } else if (trimmed === '---' || trimmed === '***') {
                renderedElements.push(<hr key={index} className="my-6 border-slate-200" />);
            } else if (trimmed) {
                // Parse bold and links
                renderedElements.push(
                    <p key={index} className="leading-relaxed text-slate-800 my-2 text-sm whitespace-pre-line">
                        {trimmed}
                    </p>
                );
            }
        });

        flushList();

        return <div className="space-y-1 prose prose-slate max-w-none">{renderedElements}</div>;
    };

    return (
        <div className="space-y-2">
            {label && (
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                        {label} {required && <span className="text-rose-500">*</span>}
                    </label>
                    {description && <span className="text-[11px] text-slate-400">{description}</span>}
                </div>
            )}

            <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-2xs focus-within:border-sky-500/80 focus-within:ring-2 focus-within:ring-sky-500/10 transition">
                {/* Editor Header Toolbar */}
                <div className="bg-slate-50/90 border-b border-slate-200/80 p-2 flex flex-wrap items-center justify-between gap-2">
                    {/* Formatting buttons */}
                    <div className="flex flex-wrap items-center gap-1 text-slate-600">
                        <button
                            type="button"
                            onClick={() => insertFormatting('**', '**', 'văn bản in đậm')}
                            className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                            title="In đậm (Bold - Ctrl+B)"
                        >
                            <Bold className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertFormatting('*', '*', 'văn bản in nghiêng')}
                            className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                            title="In nghiêng (Italic - Ctrl+I)"
                        >
                            <Italic className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertFormatting('~~', '~~', 'gạch ngang')}
                            className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                            title="Gạch ngang"
                        >
                            <Strikethrough className="w-4 h-4" />
                        </button>

                        <div className="w-px h-4 bg-slate-300 mx-1" />

                        <button
                            type="button"
                            onClick={() => insertFormatting('# ', '\n', 'Tiêu đề lớn')}
                            className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                            title="Tiêu đề 1"
                        >
                            <Heading1 className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertFormatting('## ', '\n', 'Tiêu đề phụ')}
                            className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                            title="Tiêu đề 2"
                        >
                            <Heading2 className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertFormatting('### ', '\n', 'Mục nhỏ')}
                            className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                            title="Tiêu đề 3"
                        >
                            <Heading3 className="w-4 h-4" />
                        </button>

                        <div className="w-px h-4 bg-slate-300 mx-1" />

                        <button
                            type="button"
                            onClick={() => insertFormatting('- ', '\n', 'Mục danh sách')}
                            className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                            title="Danh sách dấu chấm"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertFormatting('1. ', '\n', 'Mục số')}
                            className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                            title="Danh sách đánh số"
                        >
                            <ListOrdered className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertFormatting('> ', '\n', 'Đoạn trích dẫn hoặc lưu ý...')}
                            className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                            title="Trích dẫn / Ghi chú"
                        >
                            <Quote className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertFormatting('```\n', '\n```', '// Code snippet')}
                            className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                            title="Khối mã nguồn (Code block)"
                        >
                            <Code className="w-4 h-4" />
                        </button>

                        <div className="w-px h-4 bg-slate-300 mx-1" />

                        <button
                            type="button"
                            onClick={() => setShowLinkDialog(!showLinkDialog)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                                showLinkDialog ? 'bg-sky-100 text-sky-800' : 'hover:bg-slate-200 hover:text-slate-900'
                            }`}
                            title="Chèn liên kết (Link)"
                        >
                            <LinkIcon className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowImageDialog(!showImageDialog)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                                showImageDialog ? 'bg-sky-100 text-sky-800' : 'hover:bg-slate-200 hover:text-slate-900'
                            }`}
                            title="Chèn hình ảnh (Image)"
                        >
                            <ImageIcon className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertFormatting('\n---\n')}
                            className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                            title="Đường phân cách ngang"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* View mode toggle */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-full text-xs font-semibold text-slate-600">
                        <button
                            type="button"
                            onClick={() => setViewMode('write')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full transition cursor-pointer ${
                                viewMode === 'write' ? 'bg-slate-900 text-white shadow-2xs' : 'hover:text-slate-900'
                            }`}
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Soạn thảo</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('split')}
                            className={`hidden sm:flex items-center gap-1 px-3 py-1 rounded-full transition cursor-pointer ${
                                viewMode === 'split' ? 'bg-slate-900 text-white shadow-2xs' : 'hover:text-slate-900'
                            }`}
                        >
                            <Columns className="w-3.5 h-3.5" />
                            <span>Chia đôi</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('preview')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full transition cursor-pointer ${
                                viewMode === 'preview' ? 'bg-slate-900 text-white shadow-2xs' : 'hover:text-slate-900'
                            }`}
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem trước</span>
                        </button>
                    </div>
                </div>

                {/* Inline Image Inserter Bar */}
                {showImageDialog && (
                    <div className="p-3 bg-sky-50/70 border-b border-sky-200 text-xs flex flex-wrap items-center gap-2">
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="URL hình ảnh (https://...)"
                            className="flex-1 min-w-[200px] px-3 py-1.5 rounded-xl border border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
                        />
                        <input
                            type="text"
                            value={imageAlt}
                            onChange={(e) => setImageAlt(e.target.value)}
                            placeholder="Chú thích ảnh / Tiêu đề hình..."
                            className="w-48 px-3 py-1.5 rounded-xl border border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
                        />
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleInsertImage}
                            className="text-xs py-1"
                        >
                            Chèn ảnh
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowImageDialog(false)}
                            className="text-xs py-1"
                        >
                            Hủy
                        </Button>
                    </div>
                )}

                {/* Inline Link Inserter Bar */}
                {showLinkDialog && (
                    <div className="p-3 bg-sky-50/70 border-b border-sky-200 text-xs flex flex-wrap items-center gap-2">
                        <input
                            type="text"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            placeholder="Văn bản hiển thị (Anchor text)"
                            className="w-48 px-3 py-1.5 rounded-xl border border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
                        />
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="Đường dẫn liên kết (https://...)"
                            className="flex-1 min-w-[200px] px-3 py-1.5 rounded-xl border border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
                        />
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleInsertLink}
                            className="text-xs py-1"
                        >
                            Chèn link
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowLinkDialog(false)}
                            className="text-xs py-1"
                        >
                            Hủy
                        </Button>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="grid grid-cols-1 divide-y sm:divide-y-0 sm:divide-x divide-slate-200" style={{ minHeight }}>
                    {/* Write Mode */}
                    {(viewMode === 'write' || viewMode === 'split') && (
                        <div className={viewMode === 'split' ? 'p-4 sm:w-1/2' : 'p-4 w-full'}>
                            <textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder={placeholder}
                                className="w-full h-full p-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-y font-mono leading-relaxed bg-transparent"
                                style={{ minHeight: '300px' }}
                            />
                        </div>
                    )}

                    {/* Preview Mode */}
                    {(viewMode === 'preview' || viewMode === 'split') && (
                        <div className={viewMode === 'split' ? 'p-5 sm:w-1/2 bg-slate-50/40 overflow-y-auto max-h-[500px]' : 'p-6 w-full overflow-y-auto max-h-[500px]'}>
                            {renderMarkdownPreview(value)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default RichEditor;
