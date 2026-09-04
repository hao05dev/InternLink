import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InternLink - Nền tảng Quản lý Toàn trình Thực tập & Đối sánh Năng lực Tích hợp AI",
  description: "Hệ sinh thái kết nối Sinh viên - Doanh nghiệp - Nhà trường với AI Explainable Matching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-black text-blue-600">InternLink</span>
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">AI-Powered</span>
            </div>
            <nav className="flex items-center space-x-6 text-sm font-medium text-slate-600">
              <a href="#quy-trinh" className="hover:text-blue-600">Quy trình 12 bước</a>
              <a href="#ai-matching" className="hover:text-blue-600">AI Đối sánh Kỹ năng</a>
              <a href="#portals" className="hover:text-blue-600">Cổng truy cập</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t py-8 text-center text-sm text-slate-500 bg-white">
          <p>InternLink - Luận văn tốt nghiệp: Nền tảng quản lý toàn trình thực tập tích hợp AI</p>
          <p className="mt-1">Spring Boot 3 • Python FastAPI (Gemini API) • Next.js • PostgreSQL & pgvector</p>
        </footer>
      </body>
    </html>
  );
}