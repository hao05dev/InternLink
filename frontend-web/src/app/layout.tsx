import type { Metadata } from "next";
import "./globals.css";
import { Be_Vietnam_Pro } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
import { Navbar } from "@/components/shared/navbar";
import { cn } from "@/lib/utils";
import { MapPin, Phone, Mail, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "InternLink - Cổng Thông Tin Thực Tập & Tuyển Dụng Doanh Nghiệp | CICT CTU",
  description: "Cổng thông tin quản lý toàn trình thực tập và kết nối tuyển dụng doanh nghiệp - Khoa Công nghệ Thông tin & Truyền thông, Trường Đại học Cần Thơ",
};

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={cn(beVietnamPro.className, "min-h-screen bg-slate-50 antialiased text-slate-900 flex flex-col justify-between")}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>

          {/* Footer Chuẩn Cổng Thông Tin Trường Đại Học */}
          <footer className="border-t bg-white pt-12 pb-8 text-slate-600 text-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-200">
                {/* Cột 1: Giới thiệu đơn vị */}
                <div className="space-y-3 md:col-span-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold text-slate-900">InternLink</span>
                  </div>
                  <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                    Hệ thống quản lý thực tập và kết nối nghề nghiệp trực thuộc Khoa Công nghệ Thông tin & Truyền thông – Trường Đại học Cần Thơ. Chuẩn hóa quy trình tiếp nhận, theo dõi nhật ký thực tập và đối chiếu kết quả đào tạo thực tế.
                  </p>
                </div>

                {/* Cột 2: Liên kết nhanh */}
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">
                    Phân hệ truy cập
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li><a href="#portals" className="hover:text-blue-600 transition">Cổng Sinh viên</a></li>
                    <li><a href="#portals" className="hover:text-blue-600 transition">Cổng Doanh nghiệp & Mentor</a></li>
                    <li><a href="#portals" className="hover:text-blue-600 transition">Cổng Giảng viên hướng dẫn</a></li>
                    <li><a href="#portals" className="hover:text-blue-600 transition">Ban Quản lý Thực tập Khoa</a></li>
                  </ul>
                </div>

                {/* Cột 3: Thông tin liên hệ */}
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">
                    Thông tin liên hệ
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-500">
                    <li className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>Khu II, Đường 3 Tháng 2, P. Xuân Khánh, Q. Ninh Kiều, TP. Cần Thơ</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>(0292) 3831301 - Văn phòng Khoa</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>cict@ctu.edu.vn</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Dòng bản quyền */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
                <p>© 2026 InternLink. Khoa Công nghệ Thông tin & Truyền thông – Trường Đại học Cần Thơ.</p>
                <div className="flex space-x-4">
                  <a href="#quy-trinh" className="hover:text-slate-600">Quy định thực tập</a>
                  <span>•</span>
                  <a href="#portals" className="hover:text-slate-600">Hỗ trợ kỹ thuật</a>
                </div>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}