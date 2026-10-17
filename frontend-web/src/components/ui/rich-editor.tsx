'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { type MediaScope } from '@/lib/media-upload';
import { RichEditorToolbar, type EditorViewMode } from './rich-editor-toolbar';
import { RichEditorLinkBar } from './rich-editor-link-bar';
import { JOB_TEMPLATE_HTML } from './rich-editor-templates';
import { useEditorImageUpload } from './hooks/use-editor-image-upload';
import { RichEditorContent } from './rich-editor-content';
import './rich-editor.css';

export interface RichEditorProps {
    mediaScope?: MediaScope;
    onUploadStateChange?: (busy: boolean) => void;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
    label?: string;
    description?: string;
    required?: boolean;
    disabled?: boolean;
    showTemplateButton?: boolean;
    allowImages?: boolean;
}

export function RichEditor({
    value,
    onChange,
    mediaScope,
    onUploadStateChange,
    placeholder = 'Nhập nội dung mô tả chi tiết tại đây...',
    minHeight = '240px',
    label,
    description,
    required = false,
    disabled = false,
    showTemplateButton = true,
    allowImages = true,
}: RichEditorProps) {
    const [viewMode, setViewMode] = useState<EditorViewMode>('write');
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                link: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    rel: 'noopener noreferrer',
                    target: '_blank',
                    class: 'text-sky-600 underline font-medium hover:text-sky-800',
                },
            }),
            ...(allowImages ? [Image.configure({
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-xl border border-slate-200 max-h-96 mx-auto my-3 object-contain shadow-xs',
                },
            })] : []),
        ],
        content: value || '',
        immediatelyRender: false,
        editable: !disabled,
        editorProps: {
            attributes: {
                class: 'tiptap-editor-content focus:outline-none p-4',
                'data-placeholder': placeholder,
            },
        },
        onUpdate: ({ editor: currentEditor }) => {
            onChangeRef.current(currentEditor.getHTML());
        },
    });

    const { isUploadingImage, uploadError, setUploadError, fileInputRef, handleImageFileChange } = useEditorImageUpload(editor, mediaScope, onUploadStateChange);

    const editorState = useEditorState({
        editor,
        selector: ({ editor: e }) => ({
            isBold: e?.isActive('bold') ?? false,
            isItalic: e?.isActive('italic') ?? false,
            isStrike: e?.isActive('strike') ?? false,
            isHeading2: e?.isActive('heading', { level: 2 }) ?? false,
            isHeading3: e?.isActive('heading', { level: 3 }) ?? false,
            isBulletList: e?.isActive('bulletList') ?? false,
            isOrderedList: e?.isActive('orderedList') ?? false,
            isBlockquote: e?.isActive('blockquote') ?? false,
            isCodeBlock: e?.isActive('codeBlock') ?? false,
            isLink: e?.isActive('link') ?? false,
            canUndo: e?.can().undo() ?? false,
            canRedo: e?.can().redo() ?? false,
        }),
    });

    // Keep editor content in sync with external value changes
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '', { emitUpdate: false });
        }
    }, [editor, value]);

    useEffect(() => {
        editor?.setEditable(!disabled);
    }, [disabled, editor]);

    const handleInsertLink = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editor) return;

        if (!linkUrl.trim()) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            let finalUrl = linkUrl.trim();
            if (!/^https?:\/\//i.test(finalUrl)) {
                finalUrl = `https://${finalUrl}`;
            }
            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: finalUrl })
                .run();
        }
        setLinkUrl('');
        setShowLinkDialog(false);
    };

    const handleInsertTemplate = () => {
        if (!editor) return;
        if (editor.getText().trim().length > 0) {
            const confirmed = window.confirm(
                'Thao tác này sẽ chèn khung sườn mẫu tuyển dụng vào nội dung hiện tại. Bạn có muốn tiếp tục?'
            );
            if (!confirmed) return;
        }
        editor.chain().focus().setContent(JOB_TEMPLATE_HTML, { emitUpdate: true }).run();
    };

    if (!editor) {
        return (
            <div
                className="animate-pulse rounded-2xl bg-slate-100 border border-slate-200"
                style={{ minHeight }}
            />
        );
    }

    return (
        <div className="space-y-2">
            {label && (
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                        {label} {required && <span className="text-rose-500">*</span>}
                    </label>
                    {description && (
                        <span className="text-[11px] text-slate-400">{description}</span>
                    )}
                </div>
            )}

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/10 transition">
                {/* Modular Toolbar */}
                <RichEditorToolbar
                    editor={editor}
                    editorState={editorState ?? undefined}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    showLinkDialog={showLinkDialog}
                    onToggleLinkDialog={() => {
                        setShowLinkDialog(!showLinkDialog);
                        if (!showLinkDialog) {
                            setLinkUrl(editor.getAttributes('link').href || '');
                        }
                    }}
                    onTriggerImageUpload={() => fileInputRef.current?.click()}
                    allowImages={allowImages}
                    isUploadingImage={isUploadingImage}
                    onInsertTemplate={handleInsertTemplate}
                    showTemplateButton={showTemplateButton}
                    disabled={disabled}
                />

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageFileChange}
                    className="hidden"
                />

                {/* Modular Link Bar */}
                {showLinkDialog && (
                    <RichEditorLinkBar
                        linkUrl={linkUrl}
                        onLinkUrlChange={setLinkUrl}
                        onSubmit={handleInsertLink}
                        onClose={() => setShowLinkDialog(false)}
                    />
                )}

                {/* Upload Error Banner */}
                {uploadError && (
                    <div className="p-2 bg-rose-50 border-b border-rose-200 text-xs text-rose-700 flex items-center justify-between">
                        <span>{uploadError}</span>
                        <button
                            type="button"
                            onClick={() => setUploadError(null)}
                            className="text-rose-500 hover:text-rose-800 font-bold ml-2"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Editor Content Layout: Write, True 2-column Split, or Preview */}
                <RichEditorContent editor={editor} viewMode={viewMode} minHeight={minHeight} />

                {/* Accessible sync textarea for form testing and screen-readers */}
                <textarea
                    tabIndex={-1}
                    className="sr-only"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        if (editor && editor.getHTML() !== e.target.value) {
                            editor.commands.setContent(e.target.value);
                        }
                    }}
                />
            </div>
        </div>
    );
}

export default RichEditor;
