import {
  Paperclip,
  Download,
  FileText,
  FileSpreadsheet,
  FileArchive,
} from "lucide-react";

interface AttachmentItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: string;
  fileType?: string;
}

interface JobAttachmentsSectionProps {
  attachments?: AttachmentItem[];
}

export function JobAttachmentsSection({
  attachments,
}: JobAttachmentsSectionProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Paperclip className="w-5 h-5 text-sky-700" />
        Tài liệu đính kèm ({attachments.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.map((att) => {
          const ext =
            att.fileType?.toLowerCase() ||
            att.fileName.split(".").pop()?.toLowerCase() ||
            "";
          return (
            <a
              key={att.id}
              href={att.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-sky-300 bg-slate-50/50 hover:bg-sky-50/30 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs group-hover:border-sky-200">
                  {ext.includes("pdf") ? (
                    <FileText className="w-4 h-4 text-rose-600" />
                  ) : ext.includes("xls") ? (
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  ) : ext.includes("zip") || ext.includes("rar") ? (
                    <FileArchive className="w-4 h-4 text-amber-600" />
                  ) : (
                    <FileText className="w-4 h-4 text-sky-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-sky-700">
                    {att.fileName}
                  </p>
                  {att.fileSize && (
                    <span className="text-[11px] text-slate-400">
                      {att.fileSize}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 group-hover:text-sky-600 group-hover:border-sky-300">
                <Download className="w-3.5 h-3.5" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
