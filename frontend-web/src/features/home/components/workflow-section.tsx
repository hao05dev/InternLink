import Link from "next/link";
import { ArrowRight } from "lucide-react";

const steps = [
  { title: "Tìm vị trí", description: "Khám phá cơ hội thực tập phù hợp với chuyên ngành." },
  { title: "Ứng tuyển & thỏa thuận", description: "Gửi hồ sơ và hoàn tất thỏa thuận thực tập." },
  { title: "Thực tập & nhật ký", description: "Ghi lại công việc và nhận phản hồi từ người hướng dẫn." },
  { title: "Báo cáo & đánh giá", description: "Nộp báo cáo và theo dõi kết quả học phần." },
];

export function WorkflowSection() {
  return (
    <section aria-labelledby="workflow-heading" className="border-y border-slate-200/60 bg-slate-50/70 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <h2 id="workflow-heading" className="text-2xl font-semibold tracking-tight text-slate-900">
            Quy trình thực tập
          </h2>
          <Link href="/career-guide" className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium text-sky-700 transition-colors hover:text-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2">
            Xem hướng dẫn <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, index) => (
            <li key={step.title} className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-white text-sm font-semibold text-sky-700">
                {index + 1}
              </span>
              <div className="pt-1">
                <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
