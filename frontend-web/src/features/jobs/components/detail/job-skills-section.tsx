import { Sparkles } from "lucide-react";
import { JobSkill } from "@/features/jobs/types/job.types";

interface JobSkillsSectionProps {
  skills?: JobSkill[];
}

export function JobSkillsSection({ skills }: JobSkillsSectionProps) {
  if (!skills || skills.length === 0) return null;

  const mandatorySkills = skills.filter((s) => s.isRequired);
  const optionalSkills = skills.filter((s) => !s.isRequired);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Sparkles className="w-5 h-5 text-sky-700" />
        Yêu cầu kỹ năng & Công nghệ
      </h3>

      {mandatorySkills.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Kỹ năng bắt buộc:
          </div>
          <div className="flex flex-wrap gap-2">
            {mandatorySkills.map((skill) => (
              <span
                key={skill.skillName || skill.skillId}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200/80 flex items-center gap-1"
              >
                <span>{skill.skillName || skill.skillId}</span>
                <span className="text-rose-500 font-bold">*</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {optionalSkills.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            Kỹ năng ưu tiên / Điểm cộng:
          </div>
          <div className="flex flex-wrap gap-2">
            {optionalSkills.map((skill) => (
              <span
                key={skill.skillName || skill.skillId}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
              >
                {skill.skillName || skill.skillId}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
