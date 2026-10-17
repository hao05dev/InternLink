import { Building2 } from "lucide-react";
import { MediaRichContent } from "@/components/ui/media-rich-content";

export function CompanyIntroductionSection({ description }: { description?: string | null }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-900"><Building2 className="h-5 w-5 text-sky-700" />Về doanh nghiệp</h2>
    {description?.replace(/<[^>]*>/g, "").trim()
      ? <div className="break-words text-sm leading-7 text-slate-600"><MediaRichContent text={description} /></div>
      : <p className="text-sm leading-7 text-slate-500">Doanh nghiệp đang cập nhật phần giới thiệu. Bạn có thể khám phá các vị trí thực tập đang tuyển bên dưới.</p>}
  </section>;
}
