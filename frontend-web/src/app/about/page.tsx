import { Metadata } from "next";
import AboutView from "@/features/about/components/about-view";

export const metadata: Metadata = {
  title: "Về Trường CNTT&TT – Đại học Cần Thơ | InternLink",
  description:
    "Giới thiệu Trường Công nghệ Thông tin & Truyền thông (CICT) – Đại học Cần Thơ. Cơ cấu 6 khoa chuyên môn, kiểm định quốc tế AUN-QA và hệ sinh thái thực tập 3 bên.",
};

export default function AboutPage() {
  return <AboutView />;
}
