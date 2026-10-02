'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Copy, Eye, EyeOff } from 'lucide-react';
import { ProvisionResult } from '../../types/roster.types';

interface ProvisionResultModalProps {
    isOpen: boolean;
    result: ProvisionResult | null;
    onClose: () => void;
}

export function ProvisionResultModal({
    isOpen,
    result,
    onClose,
}: ProvisionResultModalProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!result || !result.password) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tạo tài khoản thành công!"
            maxWidth="md"
        >
            <div className="space-y-5">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-emerald-800 space-y-1">
                            <p className="font-semibold">Tài khoản đã được tạo thành công!</p>
                            <p>Sinh viên có thể đăng nhập ngay bằng thông tin dưới đây.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Email đăng nhập</label>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                            <span className="flex-1 text-sm font-mono text-slate-800">{result.email}</span>
                            <button
                                onClick={() => copyToClipboard(result.email)}
                                className="text-slate-400 hover:text-slate-700 transition shrink-0"
                                title="Sao chép email"
                            >
                                <Copy className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Mật khẩu mặc định</label>
                        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
                            <span className="flex-1 text-sm font-mono text-slate-800 tracking-wider">
                                {showPassword ? result.password : '•'.repeat(result.password.length)}
                            </span>
                            <button
                                onClick={() => setShowPassword(v => !v)}
                                className="text-slate-400 hover:text-slate-700 transition shrink-0"
                                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                                onClick={() => copyToClipboard(result.password)}
                                className="text-slate-400 hover:text-slate-700 transition shrink-0"
                                title="Sao chép mật khẩu"
                            >
                                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800">
                    <p className="font-semibold">⚠ Lưu ý bảo mật:</p>
                    <p>Hãy thông báo mật khẩu này trực tiếp cho sinh viên. Mật khẩu chỉ hiển thị 1 lần và không thể xem lại sau khi đóng cửa sổ này.</p>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                    <Button
                        variant="secondary"
                        onClick={() => copyToClipboard(`Email: ${result.email}\nMật khẩu: ${result.password}`)}
                        className="gap-2"
                    >
                        <Copy className="w-4 h-4" />
                        Sao chép cả hai
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onClose}
                        className="gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Đã ghi nhận, đóng
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
