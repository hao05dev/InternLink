"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ApiError } from "@/lib/api-client";
import { PublicShell } from "@/components/layouts/public-shell";
import { LoginBrandingPanel, type LoginTabType } from "./login/login-branding-panel";
import { LoginDemoAccountsCard } from "./login/login-demo-accounts-card";
import { LoginFormCard } from "./login/login-form-card";

export default function LoginView() {
    const router = useRouter();
    const { login } = useAuth();

    const [activeTab, setActiveTab] = useState<LoginTabType>("school");
    const [email, setEmail] = useState("b2110940@student.ctu.edu.vn");
    const [password, setPassword] = useState("Password@123");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [retryAfterSeconds, setRetryAfterSeconds] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    const redirectAfterLogin = (role: string) => {
        const roleRedirects: Record<string, string> = {
            STUDENT: "/student/dashboard",
            COMPANY_REP: "/company/dashboard",
            COMPANY_MENTOR: "/mentor/dashboard",
            FACULTY_ADMIN: "/faculty/dashboard",
            LECTURER: "/lecturer/dashboard",
            ADMIN: "/admin/dashboard",
            BLOG_MANAGER: "/blog-manager/posts",
        };
        router.push(roleRedirects[role] || "/");
    };

    const handleLoginExecution = async (targetEmail: string, targetPass: string) => {
        setErrorMsg(null);
        setRetryAfterSeconds(0);
        setIsLoading(true);

        try {
            const authData = await login({ email: targetEmail.trim(), password: targetPass });
            redirectAfterLogin(authData.role);
        } catch (err: any) {
            if (err instanceof ApiError) {
                setErrorMsg(err.message || "Tài khoản hoặc mật khẩu không chính xác");
                if (err.retryAfter && err.retryAfter > 0) {
                    setRetryAfterSeconds(err.retryAfter);
                }
            } else {
                setErrorMsg(err?.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleLoginExecution(email, password);
    };

    const handleTabChange = (tab: LoginTabType) => {
        setActiveTab(tab);
        setErrorMsg(null);
        setRetryAfterSeconds(0);
        if (tab === "company") {
            setEmail("tuyendung.fptct@fpt.com");
            setPassword("Password@123");
        } else {
            setEmail("b2110940@student.ctu.edu.vn");
            setPassword("Password@123");
        }
    };

    const handleSelectTestAccount = (demoEmail: string) => {
        setEmail(demoEmail);
        setPassword("Password@123");
        setErrorMsg(null);
        setRetryAfterSeconds(0);
    };

    const handleQuickLogin = async (demoEmail: string) => {
        setEmail(demoEmail);
        setPassword("Password@123");
        await handleLoginExecution(demoEmail, "Password@123");
    };

    return (
        <PublicShell>
            <div className="min-h-[calc(100vh-8rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-200/80 bg-white shadow-xl overflow-hidden">
                    <LoginBrandingPanel activeTab={activeTab} />

                    <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                        <LoginFormCard
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            email={email}
                            setEmail={setEmail}
                            password={password}
                            setPassword={setPassword}
                            errorMsg={errorMsg}
                            retryAfterSeconds={retryAfterSeconds}
                            isLoading={isLoading}
                            onSubmit={handleSubmit}
                        />

                        <LoginDemoAccountsCard
                            activeTab={activeTab}
                            selectedEmail={email}
                            onSelectAccount={handleSelectTestAccount}
                            onQuickLogin={handleQuickLogin}
                        />
                    </div>
                </div>
            </div>
        </PublicShell>
    );
}
