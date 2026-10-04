import { Award, CheckCircle2 } from "lucide-react";

interface JobLearningOutcomesSectionProps {
  targetLearningOutcomes?: string[];
}

export function JobLearningOutcomesSection({
  targetLearningOutcomes,
}: JobLearningOutcomesSectionProps) {
  if (!targetLearningOutcomes || targetLearningOutcomes.length === 0)
    return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Award className="w-5 h-5 text-indigo-700" />
        Chuẩn đầu ra học phần đáp ứng (CLO)
      </h3>
      <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
        {targetLearningOutcomes.map((clo) => (
          <li key={clo} className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{clo}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
