import Link from "next/link";
import { GraduationCap, Building2, UserCheck, ShieldCheck, ArrowRight } from "lucide-react";

const portals = [
  { role: "Sinh viên", description: "Ứng tuyển và quản lý quá trình thực tập.", icon: GraduationCap },
  { role: "Doanh nghiệp & Mentor", description: "Tuyển dụng và hướng dẫn sinh viên thực tập.", icon: Building2 },
  { role: "Giảng viên", description: "Theo dõi tiến độ và đánh giá sinh viên.", icon: UserCheck },
  { role: "Ban quản lý Khoa", description: "Điều phối và quản lý kỳ thực tập.", icon: ShieldCheck },
];

export function RolePortalsSection() {
  return (
    <section id="portals" aria-labelledby="portals-heading" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <h2 id="portals-heading" className="mb-6 text-2xl font-semibold tracking-tight text-slate-900">Không gian làm việc</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {portals.map(({ role, description, icon: Icon }) => (
          <Link key={role} href="/login" className="group flex min-w-0 flex-col rounded-2xl border border-slate-200/80 bg-white p-5 transition-all hover:border-sky-300 hover:bg-sky-50/30 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2">
            <Icon aria-hidden="true" className="mb-4 h-6 w-6 text-sky-700" />
            <h3 className="text-base font-semibold text-slate-900">{role}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
            <span className="mt-auto flex items-center gap-2 pt-4 text-sm font-medium text-sky-700 group-hover:text-sky-900">
              Truy cập <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}