'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Download, CheckCircle2, AlertCircle, ShieldAlert, Key } from 'lucide-react';
import { BatchProvisionResult } from '../../types/roster.types';
import { downloadProvisionedAccountsExcel } from '../../utils/roster-excel-utils';

interface BatchProvisionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<BatchProvisionResult | null>;
    isLoading: boolean;
    eligibleWithoutAccountCount: number;
    termName: string;
}

export function BatchProvisionModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    eligibleWithoutAccountCount,
    termName,
}: BatchProvisionModalProps) {
    const [result, setResult] = useState<BatchProvisionResult | null>(null);

    const handleClose = () => {
        if (isLoading) return;
        setResult(null);
        onClose();
    };

    const handleExecute = async () => {
        const res = await onConfirm();
        if (res) {
            setResult(res);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Cấp Tài Khoản Nhanh Cho Sinh Viên Đủ Điều Kiện"
            description="Tự động khởi tạo tài khoản đăng nhập hoặc liên kết tài khoản cho các sinh viên đủ điều kiện"
            maxWidth="xl"
        >
            <div className="space-y-5">
                {!result ? (
                    <>
                        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-sky-700 shrink-0" />
                                <span className="text-sm font-bold text-sky-900">
                                    Thống kê sinh viên cần cấp tài khoản:
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="brand" className="text-sm py-1 px-3">
                                    {eligibleWithoutAccountCount} sinh viên đủ điều kiện chưa có tài khoản
                                </Badge>
                            </div>
                            <p className="text-xs text-sky-800 leading-relaxed">
                                Hệ thống sẽ duyệt toàn bộ danh sách trong kỳ <strong>{termName}</strong>:
                            </p>
                            <ul className="text-xs text-sky-800 list-disc list-inside space-y-1">
                                <li>
                                    <strong>Nếu sinh viên chưa có tài khoản:</strong> Khởi tạo tài khoản mới với vai trò <code>STUDENT</code>, mật khẩu mặc định <code>Internlink@&lt;6 số cuối MSSV&gt;</code> và yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.
                                </li>
                                <li>
                                    <strong>Nếu email sinh viên đã tồn tại trên hệ thống:</strong> Tự động liên kết hồ sơ thực tập với tài khoản có sẵn.
                                </li>
                            </ul>
                        </div>

                        {eligibleWithoutAccountCount === 0 ? (
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                                Hiện tại không có sinh viên đủ điều kiện nào chưa được cấp tài khoản.
                            </div>
                        ) : (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <span>
                                    Sau khi cấp tài khoản hàng loạt thành công, bạn có thể tải về file Excel danh sách tài khoản và mật khẩu khởi tạo để gửi cho sinh viên.
                                </span>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                            <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
                                Hủy
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleExecute}
                                isLoading={isLoading}
                                disabled={eligibleWithoutAccountCount === 0}
                                className="gap-2 bg-sky-600 hover:bg-sky-700"
                            >
                                <Key className="w-4 h-4" />
                                Cấp tài khoản cho {eligibleWithoutAccountCount} sinh viên
                            </Button>
                        </div>
                    </>
                ) : (
                    /* Result Screen */
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                <span>Cấp tài khoản hàng loạt thành công!</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 text-center">
                                    <p className="text-slate-500">Tổng đã xử lý</p>
                                    <p className="text-lg font-bold text-slate-800">{result.totalEligibleWithoutAccount}</p>
                                </div>
                                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 text-center">
                                    <p className="text-emerald-600">Tạo tài khoản mới</p>
                                    <p className="text-lg font-bold text-emerald-700">{result.newlyCreatedCount}</p>
                                </div>
                                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 text-center">
                                    <p className="text-sky-600">Đã có &amp; Liên kết</p>
                                    <p className="text-lg font-bold text-sky-700">{result.linkedExistingCount}</p>
                                </div>
                            </div>
                        </div>

                        {result.accounts.length > 0 && (
                            <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                                        <tr>
                                            <th className="py-2 px-3">MSSV</th>
                                            <th className="py-2 px-3">Họ tên</th>
                                            <th className="py-2 px-3">Email</th>
                                            <th className="py-2 px-3">Mật khẩu mặc định</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {result.accounts.slice(0, 50).map((acc) => (
                                            <tr key={acc.studentCode} className="hover:bg-slate-50/50">
                                                <td className="py-1.5 px-3 font-medium text-sky-700">{acc.studentCode}</td>
                                                <td className="py-1.5 px-3 text-slate-800">{acc.fullName}</td>
                                                <td className="py-1.5 px-3 text-slate-500">{acc.officialEmail}</td>
                                                <td className="py-1.5 px-3 font-mono text-[11px] text-slate-700">
                                                    {acc.defaultPassword || <span className="text-slate-400 italic">(Đã có TK)</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => downloadProvisionedAccountsExcel(result.accounts, termName)}
                                className="gap-2 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 w-full sm:w-auto"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Tải danh sách tài khoản &amp; Mật khẩu (.xlsx)
                            </Button>
                            <Button type="button" variant="primary" onClick={handleClose} className="w-full sm:w-auto text-xs">
                                Hoàn tất
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
