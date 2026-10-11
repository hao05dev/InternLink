import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "InternLink - Quản lý Thực tập & Tuyển dụng CICT CTU",
    short_name: "InternLink",
    description: "Hệ thống quản lý thực tập và đối sánh năng lực sinh viên doanh nghiệp - Đại học Cần Thơ",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
