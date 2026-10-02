'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Mail, AlertTriangle, CheckCircle2, Users, ShieldCheck } from 'lucide-react';
import { RosterStats } from '../types/roster.types';

interface RosterStatsCardsProps {
    stats: RosterStats;
    onOpenBatchProvision?: () => void;
    onOpenIneligibleEmail?: () => void;
}

export function RosterStatsCards({
    stats,
    onOpenBatchProvision,
    onOpenIneligibleEmail,
}: RosterStatsCardsProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Card 1: Tổng sinh viên */}
            <Card className="bg-slate-50/80 border border-slate-200">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-600">Tổng đăng ký</span>
                            <Users className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">Sinh viên trong kỳ</p>
                </CardContent>
            </Card>

            {/* Card 2: Đủ điều kiện */}
            <Card className="bg-emerald-50/70 border border-emerald-200">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-800">Đủ điều kiện</span>
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.eligible}</p>
                    </div>
                    <div className="mt-2">
                        {stats.eligibleWithoutAccount > 0 && onOpenBatchProvision ? (
                            <button
                                type="button"
                                onClick={onOpenBatchProvision}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 px-2 py-0.5 rounded-md transition"
                                title="Cấp tài khoản nhanh cho sinh viên đủ điều kiện"
                            >
                                <UserPlus className="w-3 h-3" />
                                Cấp TK ({stats.eligibleWithoutAccount})
                            </button>
                        ) : (
                            <p className="text-[11px] text-emerald-700 font-medium">100% đã có tài khoản</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Card 3: Chưa đủ điều kiện */}
            <Card className="bg-rose-50/70 border border-rose-200">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-rose-800">Chưa đủ ĐK</span>
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                        </div>
                        <p className="text-2xl font-bold text-rose-700 mt-1">{stats.ineligible}</p>
                    </div>
                    <div className="mt-2">
                        {stats.ineligible > 0 && onOpenIneligibleEmail ? (
                            <button
                                type="button"
                                onClick={onOpenIneligibleEmail}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 px-2 py-0.5 rounded-md transition"
                                title="Gửi email nhắc sinh viên bổ sung điều kiện"
                            >
                                <Mail className="w-3 h-3" />
                                Gửi mail nhắc ({stats.ineligible})
                            </button>
                        ) : (
                            <p className="text-[11px] text-slate-400">Không có sinh viên nợ ĐK</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Card 4: Đã kích hoạt tài khoản */}
            <Card className="bg-sky-50/70 border border-sky-200">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-sky-800">Đã kích hoạt TK</span>
                            <CheckCircle2 className="w-4 h-4 text-sky-600" />
                        </div>
                        <p className="text-2xl font-bold text-sky-700 mt-1">{stats.activated}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                        Chưa có TK: <strong>{stats.notActivated}</strong>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
