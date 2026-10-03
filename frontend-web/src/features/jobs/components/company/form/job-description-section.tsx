'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RichEditor } from '@/components/ui/rich-editor';
import { FileText, Sparkles } from 'lucide-react';

interface JobDescriptionSectionProps {
    description: string;
    onDescriptionChange: (val: string) => void;
    skillsText: string;
    onSkillsChange: (val: string) => void;
    benefitsText: string;
    onBenefitsChange: (val: string) => void;
}

export function JobDescriptionSection({
    description,
    onDescriptionChange,
    skillsText,
    onSkillsChange,
    benefitsText,
    onBenefitsChange,
}: JobDescriptionSectionProps) {
    return (
        <Card className="border border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span>2. Mô tả công việc, Yêu cầu kỹ năng & Quyền lợi</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                        Mô tả công việc & Yêu cầu chi tiết *
                    </label>
                    <RichEditor
                        value={description}
                        onChange={onDescriptionChange}
                        placeholder="Mô tả các đầu việc chính, tiêu chuẩn năng lực, công nghệ sử dụng, thời gian thực tập..."
                        minHeight="220px"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <Input
                        label="Kỹ năng yêu cầu (phân cách bằng dấu phẩy) *"
                        value={skillsText}
                        onChange={(e) => onSkillsChange(e.target.value)}
                        placeholder="VD: Java, Spring Boot, React, Git, Docker"
                        hint="Hệ thống sẽ đối sánh tự động với hồ sơ năng lực của sinh viên CICT"
                    />
                    <Input
                        label="Quyền lợi & Phúc lợi khác (tùy chọn)"
                        value={benefitsText}
                        onChange={(e) => onBenefitsChange(e.target.value)}
                        placeholder="VD: Cơ hội tuyển chính thức sau thực tập, Hỗ trợ gửi xe, Mentor 1-1"
                        hint="Phân cách các quyền lợi bằng dấu phẩy"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
