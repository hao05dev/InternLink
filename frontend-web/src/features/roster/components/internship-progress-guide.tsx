'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Info, ChevronRight } from 'lucide-react';

export function InternshipProgressGuide() {
    return (
        <Card className="bg-gradient-to-r from-indigo-50 to-sky-50 border-indigo-200">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-indigo-800 space-y-1">
                        <p className="font-semibold">Quy trình thực tập theo từng bước:</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {[
                                { step: '1', label: 'Chưa kích hoạt TK', color: 'bg-slate-200 text-slate-700' },
                                { step: '→', label: '', color: '' },
                                { step: '2', label: 'Chờ nhận giấy giới thiệu', color: 'bg-amber-100 text-amber-700' },
                                { step: '→', label: '', color: '' },
                                { step: '3', label: 'Đã nhận giấy → đến công ty', color: 'bg-sky-100 text-sky-700' },
                                { step: '→', label: '', color: '' },
                                { step: '4', label: 'Công ty chấp nhận (SV điền form)', color: 'bg-indigo-100 text-indigo-700' },
                                { step: '→', label: '', color: '' },
                                { step: '5', label: '✓ Bắt đầu thực tập', color: 'bg-emerald-100 text-emerald-700' },
                            ].map((s, i) =>
                                s.step === '→' ? (
                                    <ChevronRight key={i} className="w-3 h-3 text-indigo-400" />
                                ) : (
                                    <span key={i} className={`px-2 py-0.5 rounded-full font-semibold ${s.color}`}>
                                        {s.label}
                                    </span>
                                )
                            )}
                        </div>
                        <p className="text-indigo-600 mt-1">
                            💡 Trang này xử lý bước 3 (đánh dấu nhận giấy) và bước 4 (xác nhận công ty chấp nhận). Sinh viên tự điền tên công ty ở bước 4 phía role Student.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
