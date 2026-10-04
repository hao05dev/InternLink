import { GraduationCap } from "lucide-react";

const PROGRAM_LABELS: Record<string, string> = {
  SE: "Kỹ thuật phần mềm (SE)",
  IT: "Công nghệ thông tin (IT)",
  IS: "Hệ thống thông tin (IS)",
  CS: "Khoa học máy tính (CS)",
  DS: "Khoa học dữ liệu (DS)",
  NET: "Mạng máy tính & TT (NET)",
  AI: "Trí tuệ nhân tạo (AI)",
  CNTT: "Công nghệ thông tin (CNTT)",
};

interface JobProgramsSectionProps {
  targetProgramCodes?: string[];
}

export function JobProgramsSection({
  targetProgramCodes,
}: JobProgramsSectionProps) {
  if (!targetProgramCodes || targetProgramCodes.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <GraduationCap className="w-5 h-5 text-indigo-700" />
        Chương trình & Ngành đào tạo mục tiêu
      </h3>
      <div className="flex flex-wrap gap-2 pt-1">
        {targetProgramCodes.map((code) => (
          <span
            key={code}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-semibold border border-indigo-200"
          >
            {PROGRAM_LABELS[code] || code}
          </span>
        ))}
      </div>
    </div>
  );
}
