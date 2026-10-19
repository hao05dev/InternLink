import type { Metadata } from "next";
import "./globals.css";
import { Be_Vietnam_Pro } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "InternLink - Cổng Thông Tin Thực Tập & Tuyển Dụng Doanh Nghiệp | CICT CTU",
  description: "Cổng thông tin quản lý toàn trình thực tập và kết nối tuyển dụng doanh nghiệp - Trường Công nghệ Thông tin & Truyền thông, Trường Đại học Cần Thơ",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
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
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={cn(beVietnamPro.className, "min-h-screen bg-slate-50 dark:bg-slate-950 antialiased text-slate-900 dark:text-slate-100 transition-colors")}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
