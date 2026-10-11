'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { uploadMedia, type MediaScope } from '@/lib/media-upload';
import { MediaRichContent } from './media-rich-content';
import { RichEditorToolbar, type EditorViewMode } from './rich-editor-toolbar';
import { RichEditorLinkBar } from './rich-editor-link-bar';
import { JOB_TEMPLATE_HTML } from './rich-editor-templates';
import { Eye } from 'lucide-react';
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
}: RichEditorProps) {
    const [viewMode, setViewMode] = useState<EditorViewMode>('write');
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
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
            Image.configure({
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-xl border border-slate-200 max-h-96 mx-auto my-3 object-contain shadow-xs',
                },
            }),
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

    const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;

        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
            setUploadError('Chỉ hỗ trợ tệp ảnh PNG, JPEG hoặc WEBP.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Ảnh tối đa 5 MiB.');
            return;
        }

        if (!mediaScope) {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    editor.chain().focus().setImage({ src: reader.result, alt: file.name }).run();
                }
            };
            reader.readAsDataURL(file);
            return;
        }

        setIsUploadingImage(true);
        setUploadError(null);
        onUploadStateChange?.(true);

        try {
            const asset = await uploadMedia(file, mediaScope);
            editor.chain().focus().setImage({ src: asset.url, alt: file.name }).run();
        } catch (err: unknown) {
            setUploadError(err instanceof Error ? err.message : 'Tải ảnh thất bại.');
        } finally {
            setIsUploadingImage(false);
            onUploadStateChange?.(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
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
                <div style={{ minHeight }}>
                    {viewMode === 'split' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                            <div className="p-1 overflow-y-auto" style={{ minHeight }}>
                                <EditorContent editor={editor} />
                            </div>
                            <div className="p-5 bg-slate-50/60 overflow-y-auto max-h-[550px]">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Xem trước trực quan (Sinh viên sẽ thấy)</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                                    <MediaRichContent text={editor.getHTML()} />
                                </div>
                            </div>
                        </div>
                    ) : viewMode === 'preview' ? (
                        <div className="p-6 bg-slate-50/40 overflow-y-auto max-h-[550px]" style={{ minHeight }}>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs max-w-4xl mx-auto">
                                <MediaRichContent text={editor.getHTML()} />
                            </div>
                        </div>
                    ) : (
                        <div className="p-1" style={{ minHeight }}>
                            <EditorContent editor={editor} />
                        </div>
                    )}
                </div>

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
