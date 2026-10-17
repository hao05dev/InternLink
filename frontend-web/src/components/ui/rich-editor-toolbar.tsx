'use client';

import React from 'react';
import type { Editor } from '@tiptap/react';
import {
    Bold,
    Italic,
    Strikethrough,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Code,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
    Sparkles,
    Eye,
    Edit3,
    Columns,
    Loader2,
} from 'lucide-react';

export type EditorViewMode = 'write' | 'preview' | 'split';

export interface EditorActiveState {
    isBold: boolean;
    isItalic: boolean;
    isStrike: boolean;
    isHeading2: boolean;
    isHeading3: boolean;
    isBulletList: boolean;
    isOrderedList: boolean;
    isBlockquote: boolean;
    isCodeBlock: boolean;
    isLink: boolean;
    canUndo: boolean;
    canRedo: boolean;
}

interface RichEditorToolbarProps {
    editor: Editor;
    editorState?: EditorActiveState;
    viewMode: EditorViewMode;
    onViewModeChange: (mode: EditorViewMode) => void;
    showLinkDialog: boolean;
    onToggleLinkDialog: () => void;
    onTriggerImageUpload: () => void;
    isUploadingImage: boolean;
    onInsertTemplate: () => void;
    showTemplateButton?: boolean;
    allowImages?: boolean;
    disabled?: boolean;
}

export function RichEditorToolbar({
    editor,
    editorState,
    viewMode,
    onViewModeChange,
    showLinkDialog,
    onToggleLinkDialog,
    onTriggerImageUpload,
    isUploadingImage,
    onInsertTemplate,
    showTemplateButton = true,
    allowImages = true,
    disabled = false,
}: RichEditorToolbarProps) {
    return (
        <div className="bg-slate-50 border-b border-slate-200/90 p-2 flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex flex-wrap items-center gap-1">
                {/* Bold */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        editorState?.isBold
                            ? 'bg-sky-100 text-sky-800 font-bold'
                            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                    title="In đậm (Bold)"
                    disabled={disabled}
                >
                    <Bold className="w-4 h-4" />
                </button>

                {/* Italic */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        editorState?.isItalic
                            ? 'bg-sky-100 text-sky-800 font-bold'
                            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                    title="In nghiêng (Italic)"
                    disabled={disabled}
                >
                    <Italic className="w-4 h-4" />
                </button>

                {/* Strikethrough */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        editorState?.isStrike
                            ? 'bg-sky-100 text-sky-800'
                            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                    title="Gạch ngang (Strikethrough)"
                    disabled={disabled}
                >
                    <Strikethrough className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                {/* Heading 2 */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        editorState?.isHeading2
                            ? 'bg-sky-100 text-sky-800'
                            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                    title="Tiêu đề mục lớn (H2)"
                    disabled={disabled}
                >
                    <Heading2 className="w-4 h-4" />
                </button>

                {/* Heading 3 */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        editorState?.isHeading3
                            ? 'bg-sky-100 text-sky-800'
                            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                    title="Tiêu đề mục nhỏ (H3)"
                    disabled={disabled}
                >
                    <Heading3 className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                {/* Bullet List */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        editorState?.isBulletList
                            ? 'bg-sky-100 text-sky-800'
                            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                    title="Danh sách dấu chấm (Bullet List)"
                    disabled={disabled}
                >
                    <List className="w-4 h-4" />
                </button>

                {/* Ordered List */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        editorState?.isOrderedList
                            ? 'bg-sky-100 text-sky-800'
                            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                    title="Danh sách đánh số (Numbered List)"
                    disabled={disabled}
                >
                    <ListOrdered className="w-4 h-4" />
                </button>

                {/* Blockquote */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        editorState?.isBlockquote
                            ? 'bg-sky-100 text-sky-800'
                            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                    title="Trích dẫn / Ghi chú (Blockquote)"
                    disabled={disabled}
                >
                    <Quote className="w-4 h-4" />
                </button>

                {/* Code Block */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        editorState?.isCodeBlock
                            ? 'bg-sky-100 text-sky-800'
                            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                    title="Khối mã (Code Block)"
                    disabled={disabled}
                >
                    <Code className="w-4 h-4" />
                </button>

                <div className="w-px h-4 bg-slate-300 mx-1" />

                {/* Link Dialog Button */}
                <button
                    type="button"
                    onClick={onToggleLinkDialog}
                    className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        editorState?.isLink || showLinkDialog
                            ? 'bg-sky-100 text-sky-800'
                            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                    title="Chèn liên kết (Link)"
                    disabled={disabled}
                >
                    <LinkIcon className="w-4 h-4" />
                </button>

                {/* Image Upload Trigger */}
                {allowImages && (<button
                    type="button"
                    onClick={onTriggerImageUpload}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer disabled:opacity-40"
                    title="Tải ảnh chèn vào nội dung (tối đa 5MB)"
                    disabled={disabled || isUploadingImage}
                >
                    {isUploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                    ) : (
                        <ImageIcon className="w-4 h-4" />
                    )}
                </button>)}

                {/* 1-Click Template Button */}
                {showTemplateButton && (
                    <button
                        type="button"
                        onClick={onInsertTemplate}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 transition cursor-pointer ml-1"
                        title="Tự động điền dàn ý tuyển dụng chuẩn"
                        disabled={disabled}
                    >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mẫu tin chuẩn</span>
                    </button>
                )}

                <div className="w-px h-4 bg-slate-300 mx-1" />

                {/* Undo */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={disabled || !editorState?.canUndo}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer disabled:opacity-30"
                    title="Hoàn tác (Ctrl+Z)"
                >
                    <Undo className="w-4 h-4" />
                </button>

                {/* Redo */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={disabled || !editorState?.canRedo}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer disabled:opacity-30"
                    title="Làm lại (Ctrl+Y)"
                >
                    <Redo className="w-4 h-4" />
                </button>
            </div>

            {/* View Mode Switcher: Write, Split, Preview */}
            <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-xl text-xs font-medium text-slate-600">
                <button
                    type="button"
                    onClick={() => onViewModeChange('write')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        viewMode === 'write'
                            ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                            : 'hover:text-slate-900'
                    }`}
                    title="Chế độ soạn thảo trực quan"
                >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Soạn thảo</span>
                </button>

                <button
                    type="button"
                    onClick={() => onViewModeChange('split')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        viewMode === 'split'
                            ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                            : 'hover:text-slate-900'
                    }`}
                    title="Chia 2 cột: Soạn thảo (trái) và Xem trước (phải)"
                >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Chia đôi</span>
                </button>

                <button
                    type="button"
                    onClick={() => onViewModeChange('preview')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                        viewMode === 'preview'
                            ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                            : 'hover:text-slate-900'
                    }`}
                    title="Xem trước kết quả hoàn chỉnh"
                >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem trước</span>
                </button>
            </div>
        </div>
    );
}
