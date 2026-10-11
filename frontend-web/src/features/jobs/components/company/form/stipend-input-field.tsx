'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { formatVnd, describeVndAmount } from '../../../utils/stipend-utils';

interface StipendInputFieldProps {
    stipendAmount: string;
    onStipendChange: (val: string) => void;
    isNegotiable?: boolean;
    onNegotiableChange?: (val: boolean) => void;
    disabled?: boolean;
}

export function StipendInputField({
    stipendAmount,
    onStipendChange,
    isNegotiable = false,
    onNegotiableChange,
    disabled = false,
}: StipendInputFieldProps) {
    const stipendNum = Number(stipendAmount);

    return (
        <div className="w-full space-y-1.5">
            {/* Header: Label + Negotiable Checkbox */}
            <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                    Mức phụ cấp (VNĐ/tháng)
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none font-medium hover:text-sky-700">
                    <input
                        type="checkbox"
                        checked={isNegotiable}
                        disabled={disabled}
                        onChange={(e) => {
                            const checked = e.target.checked;
                            onNegotiableChange?.(checked);
                            if (!checked && (!stipendAmount || Number(stipendAmount) === 0)) {
                                onStipendChange('4000000');
                            }
                        }}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Thỏa thuận</span>
                </label>
            </div>

            {/* Input or Negotiable Badge */}
            {isNegotiable ? (
                <div className="flex h-10 w-full items-center justify-between rounded-xl border border-dashed border-sky-300 bg-sky-50/60 px-3.5 py-2 text-sm text-sky-800 font-medium">
                    <span>🤝 Mức phụ cấp thỏa thuận</span>
                    <span className="text-[11px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-normal">
                        Thương lượng khi PV
                    </span>
                </div>
            ) : (
                <Input
                    type="number"
                    step="500000"
                    min="0"
                    disabled={disabled}
                    value={stipendAmount}
                    onChange={(e) => onStipendChange(e.target.value)}
                    placeholder="VD: 4000000"
                />
            )}

            {/* Sub-text: Formatted VND preview & quick suggestions */}
            {isNegotiable ? (
                <p className="text-[11px] text-slate-500">
                    Tin tuyển dụng sẽ hiển thị nhãn <span className="font-semibold text-slate-700">&quot;Thỏa thuận&quot;</span> cho sinh viên.
                </p>
            ) : (
                <div className="space-y-1 pt-0.5">
                    {stipendNum > 0 ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                            <span>💵 {formatVnd(stipendNum)} / tháng</span>
                            <span className="text-[11px] font-normal text-slate-500">({describeVndAmount(stipendNum)})</span>
                        </div>
                    ) : (
                        <p className="text-[11px] text-amber-600">Nhập số tiền hoặc tích chọn &quot;Thỏa thuận&quot;.</p>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Chọn nhanh:</span>
                        {[3000000, 4000000, 5000000, 6000000].map((val) => (
                            <button
                                key={val}
                                type="button"
                                disabled={disabled}
                                onClick={() => onStipendChange(String(val))}
                                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                    stipendNum === val
                                        ? 'bg-sky-100 border-sky-300 text-sky-800 font-semibold'
                                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                                }`}
                            >
                                {val / 1000000} triệu
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
