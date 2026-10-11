"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { PublicShell } from "@/components/layouts/public-shell";
import { Button } from "@/components/ui/button";
import { authService } from "@/features/auth/services/auth.service";
import { CompanyInfoFields } from "./register/company-info-fields";
import { CompanyAddressFields } from "./register/company-address-fields";
import { CompanyContactFields } from "./register/company-contact-fields";
import { RegisterSuccessModal } from "./register/register-success-modal";

export function CompanyRegisterView() {
  const [companyName, setCompanyName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");

  const [street, setStreet] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("Cần Thơ");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await authService.registerCompany({
        companyName,
        taxCode,
        industry: industry || undefined,
        website: website || undefined,
        address: {
          street,
          ward: ward || undefined,
          district,
          province,
        },
        fullName,
        email,
        phoneNumber,
        password,
      });

      setIsSuccess(true);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicShell>
      <div className="min-h-screen bg-slate-50/70 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-semibold text-sky-800">
              <ShieldCheck className="h-4 w-4 text-sky-700" />
              Cổng Đối Tác Doanh Nghiệp • CICT – CTU
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Đăng Ký Hồ Sơ Tiếp Nhận Thực Tập
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Kết nối trực tiếp cùng hơn 5.000 sinh viên công nghệ Trường CNTT&TT – Đại học Cần Thơ
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <p className="font-bold">Lỗi đăng ký</p>
                <p className="mt-0.5 text-xs text-rose-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <CompanyInfoFields
              companyName={companyName}
              setCompanyName={setCompanyName}
              taxCode={taxCode}
              setTaxCode={setTaxCode}
              industry={industry}
              setIndustry={setIndustry}
              website={website}
              setWebsite={setWebsite}
            />

            <CompanyAddressFields
              street={street}
              setStreet={setStreet}
              ward={ward}
              setWard={setWard}
              district={district}
              setDistrict={setDistrict}
              province={province}
              setProvince={setProvince}
            />

            <CompanyContactFields
              fullName={fullName}
              setFullName={setFullName}
              email={email}
              setEmail={setEmail}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              password={password}
              setPassword={setPassword}
            />

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
              Bằng việc đăng ký, bạn đồng ý với Quy chế phối hợp thực tập giữa Nhà trường và Doanh nghiệp của Trường CNTT&TT – ĐH Cần Thơ.
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/login" className="text-xs font-semibold text-sky-700 hover:text-sky-900">
                Đã có tài khoản? Đăng nhập tại đây
              </Link>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-h-11 bg-sky-700 hover:bg-sky-800 text-white font-bold px-6 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang khởi tạo hồ sơ...
                  </>
                ) : (
                  <>
                    <span>Hoàn tất đăng ký</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <RegisterSuccessModal isOpen={isSuccess} companyName={companyName} />
    </PublicShell>
  );
}
