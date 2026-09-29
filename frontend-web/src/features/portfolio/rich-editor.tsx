'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyleKit } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import DOMPurify from 'dompurify';
import { fieldClass } from './types';
import './portfolio.css';

export function SafeRichText({ html, className = '' }: { html: string; className?: string }) {
  return <div className={`portfolio-prose ${className}`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html, { ADD_ATTR: ['style'], FORBID_TAGS: ['style', 'iframe', 'object', 'video', 'audio'] }) }} />;
}

export default function RichEditor({ value, onChange, label, compact = false, disabled = false }: {
  value: string; onChange: (html: string) => void; label: string; compact?: boolean; disabled?: boolean;
}) {
  const id = useId(); const imageInput = useRef<HTMLInputElement>(null); const [notice, setNotice] = useState('');
  const changeRef = useRef(onChange);
  useEffect(() => { changeRef.current = onChange; }, [onChange]);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false } }), TextStyleKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }), Image.configure({ allowBase64: true }), TableKit.configure({ table: { resizable: false } })],
    content: value, immediatelyRender: false, editable: !disabled,
    editorProps: { attributes: { class: 'portfolio-prose outline-none', 'aria-label': label, role: 'textbox', 'aria-multiline': 'true' } },
    onUpdate: ({ editor: current }) => changeRef.current(current.getHTML()),
  });
  const active = useEditorState({ editor, selector: ({ editor: e }) => ({ bold: e?.isActive('bold'), italic: e?.isActive('italic'), underline: e?.isActive('underline'), font: e?.getAttributes('textStyle').fontFamily || 'Times New Roman', size: e?.getAttributes('textStyle').fontSize || '13pt' }) });
  useEffect(() => { if (editor && value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false }); }, [editor, value]);
  useEffect(() => { editor?.setEditable(!disabled); }, [disabled, editor]);
  if (!editor) return <div className="h-36 animate-pulse rounded-lg bg-slate-100" aria-label={`Đang tải ${label}`} />;
  const button = (text: string, action: () => void, pressed?: boolean) => <button type="button" title={text} aria-label={text} aria-pressed={pressed} disabled={disabled} onClick={action} className={`rounded px-2 py-1 text-xs font-medium hover:bg-sky-100 disabled:opacity-40 ${pressed ? 'bg-sky-100 text-sky-900' : 'text-slate-700'}`}>{text}</button>;
  async function addImage(file?: File) {
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 2 * 1024 * 1024) { setNotice('Chọn ảnh PNG/JPEG tối đa 2 MB.'); return; }
    const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
    editor?.chain().focus().setImage({ src: data, alt: file.name }).run(); setNotice('');
  }
  return <div className="space-y-1">
    <div id={id} className="block text-sm font-semibold text-slate-800">{label}</div>
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-sky-100">
      <div role="toolbar" aria-label={`Định dạng ${label}`} className="flex flex-wrap items-center gap-1 border-b bg-slate-50 p-2">
        {button('Đậm', () => editor.chain().focus().toggleBold().run(), active?.bold)}
        {button('Nghiêng', () => editor.chain().focus().toggleItalic().run(), active?.italic)}
        {button('Gạch chân', () => editor.chain().focus().toggleUnderline().run(), active?.underline)}
        {!compact && <><select aria-label="Font chữ" disabled={disabled} value={active?.font} onChange={e => editor.chain().focus().setFontFamily(e.target.value).run()} className="max-w-40 rounded border bg-white px-1 py-1 text-xs">{['Times New Roman', 'Arial', 'Calibri'].map(font => <option key={font}>{font}</option>)}</select>
          <select aria-label="Cỡ chữ" disabled={disabled} value={active?.size} onChange={e => editor.chain().focus().setFontSize(e.target.value).run()} className="rounded border bg-white px-1 py-1 text-xs">{[11, 12, 13, 14, 16, 18, 20, 24].map(size => <option key={size} value={`${size}pt`}>{size}</option>)}</select>
          <select aria-label="Kiểu đoạn" disabled={disabled} value={editor.isActive('heading', { level: 2 }) ? '2' : editor.isActive('heading', { level: 3 }) ? '3' : 'p'} onChange={e => e.target.value === 'p' ? editor.chain().focus().setParagraph().run() : editor.chain().focus().toggleHeading({ level: Number(e.target.value) as 2 | 3 }).run()} className="rounded border bg-white px-1 py-1 text-xs"><option value="p">Văn bản</option><option value="2">Tiêu đề mục</option><option value="3">Tiêu đề nhỏ</option></select></>}
        {button('Trái', () => editor.chain().focus().setTextAlign('left').run())}{button('Giữa', () => editor.chain().focus().setTextAlign('center').run())}{button('Phải', () => editor.chain().focus().setTextAlign('right').run())}{button('Đều', () => editor.chain().focus().setTextAlign('justify').run())}
        {button('• Danh sách', () => editor.chain().focus().toggleBulletList().run())}{button('1. Danh sách', () => editor.chain().focus().toggleOrderedList().run())}
        {button('Ảnh', () => imageInput.current?.click())}
        {!compact && <>{button('Bảng', () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}
          {editor.isActive('table') && <>{button('+ Hàng', () => editor.chain().focus().addRowAfter().run())}{button('+ Cột', () => editor.chain().focus().addColumnAfter().run())}{button('Xóa bảng', () => editor.chain().focus().deleteTable().run())}</>}
          {button('Chú thích hình', () => editor.chain().focus().insertContent('<p><em>Hình: Nhập chú thích tại đây</em></p>').run())}
          <select aria-label="Giãn dòng" disabled={disabled} defaultValue="1.5" onChange={e => editor.chain().focus().setLineHeight(e.target.value).run()} className="rounded border bg-white px-1 py-1 text-xs"><option value="1">Dòng 1</option><option value="1.15">Dòng 1.15</option><option value="1.5">Dòng 1.5</option><option value="2">Dòng 2</option></select>
          {button('Định dạng mẫu', () => editor.chain().focus().setFontFamily('Times New Roman').setFontSize('13pt').setTextAlign('justify').setLineHeight('1.5').run())}</>}
        {button('Hoàn tác', () => editor.chain().focus().undo().run())}{button('Làm lại', () => editor.chain().focus().redo().run())}
        <input ref={imageInput} type="file" accept="image/png,image/jpeg" className="hidden" aria-label="Chèn ảnh minh chứng" onChange={e => { void addImage(e.target.files?.[0]).catch(() => setNotice('Không đọc được ảnh.')); e.target.value = ''; }} />
      </div>
      <div className={compact ? 'p-3 min-h-32' : 'p-5 min-h-80'} aria-labelledby={id}><EditorContent editor={editor} /></div>
    </div>
    {notice && <p role="alert" className="text-sm text-rose-700">{notice}</p>}
  </div>;
}
