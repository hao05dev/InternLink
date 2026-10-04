import { Gift, Check } from "lucide-react";

interface JobBenefitsSectionProps {
  benefits?: string[];
}

export function JobBenefitsSection({ benefits }: JobBenefitsSectionProps) {
  if (!benefits || benefits.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Gift className="w-5 h-5 text-emerald-600" />
        Quyền lợi & Chế độ đãi ngộ dành cho sinh viên
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {benefits.map((benefit, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 text-xs sm:text-sm text-slate-800"
          >
            <div className="p-1 rounded-full bg-emerald-100 text-emerald-700 mt-0.5 shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="leading-relaxed font-medium">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
