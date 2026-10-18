'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/use-auth';
import { KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function ForceChangePasswordModal() {
    const { user, refreshUser } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!user || !user.mustChangePassword) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!currentPassword) {
            setError('Vui lòng nhập mật khẩu tạm thời nhận từ email.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
            return;
        }

        if (newPassword === currentPassword) {
            setError('Mật khẩu mới không được trùng với mật khẩu tạm thời.');
            return;
        }

        try {
            setIsLoading(true);
            await authService.changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });
            setIsSuccess(true);
            setTimeout(async () => {
                await refreshUser();
            }, 1200);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu tạm thời.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={() => {}}
            title="Đổi Mật Khẩu Lần Đầu Đăng Nhập"
            description="Tài khoản của bạn vừa được cấp phát. Vui lòng thiết lập mật khẩu mới để tiếp tục."
            maxWidth="md"
        >
            {isSuccess ? (
                <div className="py-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-base">Đổi mật khẩu thành công!</h3>
                    <p className="text-xs text-slate-500">Đang chuyển bạn đến không gian làm việc...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                            Đây là yêu cầu bảo mật bắt buộc của Nhà trường. Bạn cần đổi mật khẩu tạm thời thành mật khẩu cá nhân trước khi sử dụng hệ thống.
                        </span>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                            Mật khẩu tạm thời (nhận qua Email) <span className="text-rose-500">*</span>
                        </label>
                        <Input
                            type="password"
                            placeholder="Nhập mật khẩu ngẫu nhiên trong email"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                            Mật khẩu mới <span className="text-rose-500">*</span>
                        </label>
                        <Input
                            type="password"
                            placeholder="Tối thiểu 8 ký tự"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                            Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                        </label>
                        <Input
                            type="password"
                            placeholder="Nhập lại mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full flex items-center justify-center gap-2"
                            isLoading={isLoading}
                        >
                            <KeyRound className="w-4 h-4" />
                            Xác nhận đổi mật khẩu
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
