'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { AcademicTermFilter } from '@/components/ui/academic-term-filter';
import { Info, AlertCircle } from 'lucide-react';
import { StipendInputField } from './stipend-input-field';

interface JobBasicInfoSectionProps {
    terms: import("../../../types/job-form.types").JobTerm[];
    departments: import("../../../types/job-form.types").JobDepartment[];
    selectedTermId: string;
    onTermChange: (id: string) => void;
    selectedDeptId: string;
    onDeptChange: (id: string) => void;
    title: string;
    onTitleChange: (val: string) => void;
    workFormat: string;
    onWorkFormatChange: (val: string) => void;
    vacancies: string;
    onVacanciesChange: (val: string) => void;
    stipendAmount: string;
    onStipendChange: (val: string) => void;
    isNegotiable?: boolean;
    onNegotiableChange?: (val: boolean) => void;
    isTermClosed?: boolean;
}

export function JobBasicInfoSection({
    terms,
    departments,
    selectedTermId,
    onTermChange,
    selectedDeptId,
    onDeptChange,
    title,
    onTitleChange,
    workFormat,
    onWorkFormatChange,
    vacancies,
    onVacanciesChange,
    stipendAmount,
    onStipendChange,
    isNegotiable = false,
    onNegotiableChange,
    isTermClosed,
}: JobBasicInfoSectionProps) {
    return (
        <Card className="border border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Info className="w-4 h-4 text-sky-600" />
                    <span>1. Thông tin vị trí & Đợt tiếp nhận</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
                {terms.length > 0 && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-xs font-bold text-slate-700 block">Chọn Học kỳ & Năm học tiếp nhận:</span>
                        <AcademicTermFilter
                            terms={terms}
                            selectedTermId={selectedTermId}
                            onTermChange={onTermChange}
                            variant="grid"
                            showStatusBadge={true}
                        />
                        {isTermClosed && (
                            <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>Kỳ thực tập này đã kết thúc (CLOSED). Vui lòng chọn kỳ đang mở để đăng tin.</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {departments.length > 0 && (
                        <Select
                            label="Khoa thẩm định chuyên môn"
                            value={selectedDeptId}
                            onChange={(e) => onDeptChange(e.target.value)}
                            options={departments.map((d) => ({ value: d.id, label: d.departmentName || d.name || d.id }))}
                        />
                    )}
                    <Input
                        label="Tiêu đề vị trí thực tập *"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="VD: Thực tập sinh Lập trình Web Fullstack (Spring Boot / React)"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Select
                        label="Hình thức làm việc *"
                        value={workFormat}
                        onChange={(e) => onWorkFormatChange(e.target.value)}
                        options={[
                            { value: 'ONSITE', label: 'Tại văn phòng (On-site)' },
                            { value: 'HYBRID', label: 'Kết hợp (Hybrid)' },
                            { value: 'REMOTE', label: 'Từ xa (Remote)' },
                        ]}
                    />
                    <Input
                        label="Chỉ tiêu tiếp nhận (SV) *"
                        type="number"
                        min="1"
                        max="100"
                        value={vacancies}
                        onChange={(e) => onVacanciesChange(e.target.value)}
                        required
                    />
                    <StipendInputField
                        stipendAmount={stipendAmount}
                        onStipendChange={onStipendChange}
                        isNegotiable={isNegotiable}
                        onNegotiableChange={onNegotiableChange}
                        disabled={isTermClosed}
                    />
                </div>


            </CardContent>
        </Card>
    );
}
