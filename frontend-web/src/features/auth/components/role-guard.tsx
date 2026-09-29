"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { UserRole } from "@/features/auth/types/auth.types";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RoleGuardProps {
    allowedRoles: UserRole[];
    children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-sky-600 border-t-transparent animate-spin" />
                    <p className="text-xs text-slate-500 font-medium">Đang xác thực quyền truy cập...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    if (!allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Truy cập bị từ chối (403 Forbidden)</h2>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Tài khoản của bạn ({user.email} - Vai trò: <strong>{user.role}</strong>) không có quyền truy cập vào phân hệ này.
                        </p>
                    </div>
                    <div className="pt-2">
                        <Button
                            variant="default"
                            onClick={() => router.push("/")}
                            className="text-xs"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                            Quay lại trang chủ
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
