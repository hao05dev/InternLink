'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { AlertCircle, UserMinus, Building2, CheckCircle2, Users } from 'lucide-react';
import { RosterStudent } from '../../types/roster.types';

interface PartnerCompanySlot {
    id: string;
    companyName: string;
    jobTitle: string;
    availableSlots: number;
}

interface UnassignedStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    unassignedStudents: RosterStudent[];
    partnerCompanies: PartnerCompanySlot[];
    onAssignPartner: (studentId: string, companySlotId: string) => Promise<void>;
    onWithdrawCourse: (studentId: string, reason: string) => Promise<void>;
    isLoading?: boolean;
}

export function UnassignedStudentsModal({
    isOpen,
    onClose,
    unassignedStudents,
    partnerCompanies,
    onAssignPartner,
    onWithdrawCourse,
    isLoading = false,
}: UnassignedStudentsModalProps) {
    const [selectedStudent, setSelectedStudent] = useState<RosterStudent | null>(null);
    const [actionType, setActionType] = useState<'ASSIGN' | 'WITHDRAW'>('ASSIGN');
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [withdrawReason, setWithdrawReason] = useState('Không tìm được đơn vị thực tập phù hợp trước hạn chót của Khoa');

    const handleActionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        if (actionType === 'ASSIGN') {
            const companyId = selectedCompanyId || partnerCompanies[0]?.id;
            if (!companyId) return;
            await onAssignPartner(selectedStudent.id, companyId);
        } else {
            await onWithdrawCourse(selectedStudent.id, withdrawReason);
        }

        setSelectedStudent(null);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Xử Lý Sinh Viên Chưa Có Chỗ Thực Tập"
            maxWidth="lg"
        >
            <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Tổng cộng có {unassignedStudents.length} sinh viên chưa được tiếp nhận</span>
                    </div>
                    <p>
                        Khoa có thể hỗ trợ <strong>phân bổ trực tiếp vào các Doanh nghiệp đối tác còn chỉ tiêu</strong> hoặc <strong>cho phép rút học phần (Withdraw)</strong> mà không bị tính điểm rớt môn.
                    </p>
                </div>

                {/* Students List */}
                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100">
                    {unassignedStudents.map((s) => (
                        <div
                            key={s.id}
                            className={`p-3 flex items-center justify-between gap-3 text-xs transition ${
                                selectedStudent?.id === s.id ? 'bg-sky-50' : 'hover:bg-slate-50'
                            }`}
                        >
                            <div>
                                <p className="font-bold text-slate-900">{s.fullName}</p>
                                <p className="text-slate-500 font-mono text-[11px]">{s.studentCode} • {s.programName}</p>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setSelectedStudent(s)}
                                className="text-xs"
                            >
                                Xử lý
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Active Action Form for Selected Student */}
                {selectedStudent && (
                    <form onSubmit={handleActionSubmit} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900">
                                Đang xử lý: {selectedStudent.fullName} ({selectedStudent.studentCode})
                            </span>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActionType('ASSIGN')}
                                    className={`text-xs px-3 py-1 rounded-full font-semibold transition ${
                                        actionType === 'ASSIGN' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'
                                    }`}
                                >
                                    Phân bổ vào DN đối tác
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActionType('WITHDRAW')}
                                    className={`text-xs px-3 py-1 rounded-full font-semibold transition ${
                                        actionType === 'WITHDRAW' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                                    }`}
                                >
                                    Rút học phần
                                </button>
                            </div>
                        </div>

                        {actionType === 'ASSIGN' ? (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-700">Chọn Doanh nghiệp đối tác còn chỉ tiêu:</label>
                                {partnerCompanies.length > 0 ? (
                                    <Select
                                        label=""
                                        id="partnerCompanySlot"
                                        value={selectedCompanyId || partnerCompanies[0].id}
                                        onChange={(e) => setSelectedCompanyId(e.target.value)}
                                        options={partnerCompanies.map((c) => ({
                                            value: c.id,
                                            label: `${c.companyName} - ${c.jobTitle} (Còn ${c.availableSlots} chỗ)`,
                                        }))}
                                    />
                                ) : (
                                    <p className="text-xs text-slate-400">Không có doanh nghiệp đối tác nào còn chỉ tiêu.</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label htmlFor="withdrawReason" className="text-xs font-semibold text-slate-700">Lý do rút học phần:</label>
                                <input
                                    id="withdrawReason"
                                    type="text"
                                    value={withdrawReason}
                                    onChange={(e) => setWithdrawReason(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                                    required
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedStudent(null)}
                                disabled={isLoading}
                            >
                                Hủy chọn
                            </Button>
                            <Button
                                type="submit"
                                variant={actionType === 'ASSIGN' ? 'primary' : 'destructive'}
                                size="sm"
                                isLoading={isLoading}
                            >
                                {actionType === 'ASSIGN' ? 'Xác nhận phân bổ' : 'Xác nhận rút môn'}
                            </Button>
                        </div>
                    </form>
                )}

                <div className="flex justify-end pt-2 border-t border-slate-100">
                    <Button variant="secondary" onClick={onClose} size="sm">
                        Đóng
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
