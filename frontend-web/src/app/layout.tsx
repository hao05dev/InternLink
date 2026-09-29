import type { Metadata } from "next";
import "./globals.css";
import { Be_Vietnam_Pro } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "InternLink - Cổng Thông Tin Thực Tập & Tuyển Dụng Doanh Nghiệp | CICT CTU",
  description: "Cổng thông tin quản lý toàn trình thực tập và kết nối tuyển dụng doanh nghiệp - Trường Công nghệ Thông tin & Truyền thông, Trường Đại học Cần Thơ",
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
      <body className={cn(beVietnamPro.className, "min-h-screen bg-slate-50 antialiased text-slate-900")}>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
