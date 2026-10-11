import { Metadata } from "next";
import { CompanyRegisterView } from "@/features/auth/components/company-register-view";

export const metadata: Metadata = {
  title: "Đăng Ký Doanh Nghiệp | InternLink - CICT CTU",
  description:
    "Đăng ký tài khoản doanh nghiệp tiếp nhận thực tập sinh Trường CNTT&TT – Đại học Cần Thơ. Đăng tuyển vị trí, quản lý ứng viên và kết nối giảng viên hướng dẫn.",
};

export default function RegisterPage() {
  return <CompanyRegisterView />;
}
