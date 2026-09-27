import React from "react";
import { Navbar } from "@/components/shared/navbar";
import { GraduationCap, MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";

export function PublicShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-50">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t bg-white pt-12 pb-8 text-slate-600 text-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-200">
                        {/* Unit info */}
                        <div className="space-y-3 md:col-span-2">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-lg bg-sky-700 flex items-center justify-center text-white">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <span className="text-lg font-bold text-slate-900">InternLink CICT • CTU</span>
                            </div>
                            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                                Cổng thông tin quản lý toàn trình thực tập và tuyển dụng doanh nghiệp trực thuộc Trường Công nghệ Thông tin & Truyền thông – Trường Đại học Cần Thơ. Chuẩn hóa quy trình tiếp nhận, theo dõi nhật ký thực tập và đối chiếu kết quả đào tạo thực tế.
                            </p>
                        </div>

                        {/* Quick access */}
                        <div>
                            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">
                                Phân hệ Cổng thông tin
                            </h4>
                            <ul className="space-y-2 text-xs">
                                <li><Link href="/login" className="hover:text-sky-700 transition">Cổng Sinh viên thực tập</Link></li>
                                <li><Link href="/login" className="hover:text-sky-700 transition">Cổng Doanh nghiệp & Mentor</Link></li>
                                <li><Link href="/login" className="hover:text-sky-700 transition">Cổng Giảng viên hướng dẫn</Link></li>
                                <li><Link href="/login" className="hover:text-sky-700 transition">Ban Quản lý Thực tập CICT</Link></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">
                                Liên hệ Ban QLTT
                            </h4>
                            <div className="space-y-2 text-xs text-slate-500">
                                <div className="flex items-start space-x-2">
                                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <span>Khu II, Đường 3/2, P. Xuân Khánh, Q. Ninh Kiều, TP. Cần Thơ</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>(0292) 3831 301</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>cict@ctu.edu.vn</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
                        <p>© 2026 Trường Công nghệ Thông tin và Truyền thông – Đại học Cần Thơ.</p>
                        <div className="flex space-x-6 mt-4 sm:mt-0">
                            <Link href="/cam-nang" className="hover:text-slate-600 transition">Quy chế học phần</Link>
                            <Link href="/doanh-nghiep" className="hover:text-slate-600 transition">Mạng lưới đối tác</Link>
                            <Link href="/jobs" className="hover:text-slate-600 transition">Vị trí tuyển dụng</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
