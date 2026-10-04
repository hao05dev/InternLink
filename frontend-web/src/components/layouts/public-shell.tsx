"use client";

import React from "react";
import { Navbar } from "@/components/layouts/navbar";
import { GraduationCap, MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";

interface PublicShellProps {
    children: React.ReactNode;
    hideNavbar?: boolean;
}

const footerLinkClassName = "inline-flex min-h-11 items-center rounded-md hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2";

export function PublicShell({ children, hideNavbar = false }: PublicShellProps) {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-50">
            {!hideNavbar && <Navbar />}
            <main className="flex-1">{children}</main>
            <footer className="border-t border-slate-200 bg-slate-50 py-8 text-sm text-slate-600">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-6 md:grid-cols-2 md:gap-12">
                        <div>
                            <div className="flex items-center gap-2 text-slate-900">
                                <GraduationCap aria-hidden="true" className="h-6 w-6 text-sky-700" />
                                <span className="text-lg font-semibold">InternLink</span>
                            </div>
                            <p className="mt-3 max-w-md text-sm leading-relaxed">
                                Kết nối và quản lý thực tập tại Trường Công nghệ Thông tin & Truyền thông – Đại học Cần Thơ.
                            </p>
                            <nav aria-label="Liên kết chân trang" className="mt-2 flex flex-wrap gap-x-5">
                                <Link href="/jobs" className={footerLinkClassName}>Vị trí thực tập</Link>
                                <Link href="/companies" className={footerLinkClassName}>Doanh nghiệp</Link>
                                <Link href="/career-guide" className={footerLinkClassName}>Tin tức & Blog</Link>
                                <Link href="/#about" className={footerLinkClassName}>Về trường</Link>
                            </nav>
                        </div>
                        <div>
                            <h2 className="font-semibold text-slate-900">Liên hệ Ban quản lý thực tập</h2>
                            <address className="mt-3 space-y-2 text-sm not-italic">
                                <p className="flex items-start gap-2 leading-relaxed">
                                    <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                    <span>Khu II, Đường 3/2, P. Xuân Khánh, Q. Ninh Kiều, TP. Cần Thơ</span>
                                </p>
                                <div className="flex flex-wrap gap-x-5">
                                    <a href="tel:+842923831301" className={footerLinkClassName + " gap-2"}>
                                        <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
                                        (0292) 3831 301
                                    </a>
                                    <a href="mailto:cict@ctu.edu.vn" className={footerLinkClassName + " gap-2"}>
                                        <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
                                        cict@ctu.edu.vn
                                    </a>
                                </div>
                            </address>
                        </div>
                    </div>
                    <p className="mt-6 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-500">
                        © 2026 Trường Công nghệ Thông tin và Truyền thông – Đại học Cần Thơ.
                    </p>
                </div>
            </footer>
        </div>
    );
}