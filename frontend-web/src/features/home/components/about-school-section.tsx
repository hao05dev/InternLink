import Link from "next/link";
import { Award, Building2, BookOpenCheck, Cpu, ArrowUpRight, CheckCircle2 } from "lucide-react";

const pillars = [
  {
    icon: Award,
    title: "Đào tạo chuẩn quốc tế AUN-QA",
    description:
      "Các chương trình Kỹ thuật phần mềm, Khoa học máy tính, Hệ thống thông tin... được kiểm định đạt chuẩn chất lượng quốc tế AUN-QA.",
  },
  {
    icon: Building2,
    title: "Mạng lưới 200+ Doanh nghiệp",
    description:
      "Hợp tác chiến lược cùng các tập đoàn công nghệ và doanh nghiệp phần mềm hàng đầu, mở rộng cơ hội tiếp nhận thực tập và tuyển dụng.",
  },
  {
    icon: BookOpenCheck,
    title: "Thực tập chuẩn hóa 3 bên",
    description:
      "Quy trình kết nối minh bạch giữa Nhà trường – Doanh nghiệp – Sinh viên, thẩm định vị trí và bảo trợ công nhận tín chỉ học phần.",
  },
  {
    icon: Cpu,
    title: "Nghiên cứu & Chuyển giao công nghệ",
    description:
      "Tiên phong phát triển các giải pháp Trí tuệ nhân tạo (AI), Khoa học dữ liệu và Chuyển đổi số phục vụ kinh tế - xã hội vùng ĐBSCL.",
  },
];

export function AboutSchoolSection() {
  return (
    <section id="about" aria-labelledby="about-heading" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Anchor fallback for old links */}
      <div id="portals" className="scroll-mt-28" />

      <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end sm:gap-6">
        <div className="max-w-3xl">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-sky-700" />
            Trường Đại học Cần Thơ • CICT
          </div>
          <h2 id="about-heading" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Về Trường CNTT&TT – Đại học Cần Thơ
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            Trung tâm đào tạo nguồn nhân lực chất lượng cao, nghiên cứu khoa học và chuyển giao công nghệ hàng đầu khu vực Đồng bằng sông Cửu Long và cả nước trong lĩnh vực Công nghệ thông tin & Truyền thông.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:shrink-0 sm:self-auto">
          <Link
            href="/about"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow-2xs transition hover:bg-sky-800"
          >
            <span>Tìm hiểu chi tiết</span>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <a
            href="https://cict.ctu.edu.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <span>Cổng CICT</span>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-slate-400" />
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex min-w-0 flex-col rounded-2xl border border-slate-200/80 bg-white p-5 transition-all hover:border-sky-300 hover:shadow-xs sm:p-6"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <Icon aria-hidden="true" className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
