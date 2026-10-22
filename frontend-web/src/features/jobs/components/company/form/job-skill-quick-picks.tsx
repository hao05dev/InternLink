import { Check, Plus } from "lucide-react";
import { POPULAR_JOB_SKILLS } from "@/features/jobs/data/popular-job-skills";
import {
  ApprovedTaxonomySkill,
  findApprovedSkill,
} from "@/features/jobs/utils/job-skill-input-utils";

interface JobSkillQuickPicksProps {
  currentSkills: string[];
  taxonomySkills: ApprovedTaxonomySkill[];
  disabled: boolean;
  onAdd: (skill: ApprovedTaxonomySkill) => void;
  onRemove: (name: string) => void;
}

export function JobSkillQuickPicks({
  currentSkills,
  taxonomySkills,
  disabled,
  onAdd,
  onRemove,
}: JobSkillQuickPicksProps) {
  return <div className="pt-1">
    <span className="text-[11px] font-semibold text-slate-500 mr-2">Gợi ý chọn nhanh:</span>
    <div className="inline-flex flex-wrap gap-1.5 mt-1.5">
      {POPULAR_JOB_SKILLS.map((name) => {
        const approved = findApprovedSkill(name, taxonomySkills);
        const selected = currentSkills.some((skill) => skill.toLowerCase() === name.toLowerCase());
        return <button
          key={name}
          type="button"
          disabled={disabled || !approved}
          onClick={() => selected ? onRemove(name) : approved && onAdd(approved)}
          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${selected
            ? "bg-sky-100 text-sky-800 border-sky-300 font-semibold shadow-xs"
            : "bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-700 disabled:opacity-50"}`}
        >
          {selected ? <Check className="w-3 h-3 text-sky-600" /> : <Plus className="w-3 h-3 text-slate-400" />}
          <span>{name}</span>
        </button>;
      })}
    </div>
  </div>;
}
