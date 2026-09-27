"use client";

import Link from "next/link";
import { Building2, MapPin, Globe, Users, ExternalLink, CheckCircle2, ChevronRight, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/layouts/public-shell";

const PARTNER_COMPANIES = [
    {
        id: "33333333-3333-3333-3333-333333333333",
        name: "FPT Software Cần Thơ",
        logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg",
        partnershipType: "Đối tác Chiến lược Toàn diện (MOU)",
        industry: "Công nghệ thông tin & Phần mềm Xuất khẩu",
        scale: "1.000 - 4.999 nhân viên",
        address: "Đường số 1, KDC Nam Long, Phường Hưng Thạnh, Quận Cái Răng, Cần Thơ",
        website: "https://fptsoftware.com",
        activeJobsCount: 2,
        description: "Doanh nghiệp công nghệ hàng đầu tại khu vực Đồng bằng Sông Cửu Long, tiếp nhận hàng trăm sinh viên CICT - ĐH Cần Thơ thực tập và làm việc mỗi năm trong các lĩnh vực Cloud, AI, Backend và Automation Test."
    },
    {
        id: "44444444-4444-4444-4444-444444444444",
        name: "VNPT Cần Thơ - Trung tâm Công nghệ Thông tin",
        logo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Logo_VNPT.svg",
        partnershipType: "Đối tác Chuyển đổi số Địa phương",
        industry: "Viễn thông & Giải pháp Chính phủ điện tử",
        scale: "500 - 1.000 nhân viên",
        address: "Số 02 Nguyễn Trãi, Phường Tân An, Quận Ninh Kiều, Cần Thơ",
        website: "https://vnptcantho.vn",
        activeJobsCount: 1,
        description: "Đơn vị nòng cốt triển khai các hệ thống dịch vụ công, thành phố thông minh và chuyển đổi số cho TP. Cần Thơ và các tỉnh Tây Nam Bộ."
    },
    {
        id: "a1b2c3d4-0000-0000-0000-111122223333",
        name: "LG CNS Việt Nam",
        logo: "https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_CNS_logo.svg",
        partnershipType: "Đối tác Doanh nghiệp Đa quốc gia",
        industry: "Giải pháp CNTT Toàn cầu & Smart Factory",
        scale: "500 - 1.000 nhân viên",
        address: "Tầng 15, Bitexco Financial Tower, Quận 1, TP. Hồ Chí Minh",
        website: "https://lgcns.com",
        activeJobsCount: 1,
        description: "Công ty thành viên thuộc Tập đoàn LG chuyên phát triển các hệ thống CNTT lõi, tự động hóa nhà máy thông minh và giải pháp điện toán đám mây cho thị trường quốc tế."
    }
];

export default function CompaniesPage() {
    return (
        <PublicShell>
            <div className="min-h-screen bg-slate-50 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold">
                        <Building2 className="w-3.5 h-3.5 text-sky-600" />
                        Mạng lưới Doanh nghiệp Tiếp nhận Thực tập
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Đối tác Hợp tác Đào tạo & Tiếp nhận Thực tập
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        Các tập đoàn công nghệ và doanh nghiệp đã ký kết biên bản ghi nhớ hợp tác (MOU) cùng Trường CNTT&TT - ĐH Cần Thơ, cam kết đồng hành đào tạo và cấp chỉ tiêu thực tập chất lượng cao.
                    </p>
                </div>

                {/* Companies Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PARTNER_COMPANIES.map(company => (
                        <div 
                            key={company.id}
                            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all duration-200 flex flex-col justify-between group"
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2.5 shrink-0 shadow-2xs">
                                        <Building2 className="w-8 h-8 text-sky-700" />
                                    </div>
                                    <Badge variant="success" className="text-[10px] py-0.5 px-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                                        {company.partnershipType}
                                    </Badge>
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                                        {company.name}
                                    </h3>
                                    <div className="text-xs text-slate-500 mt-1">{company.industry}</div>
                                </div>

                                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                                    {company.description}
                                </p>

                                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>Quy mô: <strong>{company.scale}</strong></span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                        <span className="line-clamp-1">{company.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <span className="text-emerald-700 font-semibold">Đang tuyển: {company.activeJobsCount} vị trí thực tập</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                                <a 
                                    href={company.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                                >
                                    Website
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                                <Link href={`/jobs?companyId=${company.id}`}>
                                    <Button 
                                        variant="default"
                                        size="sm"
                                        className="bg-sky-700 hover:bg-sky-600 text-white font-medium text-xs px-3 cursor-pointer shadow-2xs"
                                    >
                                        Xem vị trí tuyển
                                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </div>
        </PublicShell>
    );
}
