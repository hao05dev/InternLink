import { EditorContent, type Editor } from "@tiptap/react";
import { Eye } from "lucide-react";
import { MediaRichContent } from "./media-rich-content";
import type { EditorViewMode } from "./rich-editor-toolbar";

export function RichEditorContent({ editor, viewMode, minHeight }: { editor: Editor; viewMode: EditorViewMode; minHeight: string }) {
  return (<div style={{ minHeight }}>
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
                </div>);
}
