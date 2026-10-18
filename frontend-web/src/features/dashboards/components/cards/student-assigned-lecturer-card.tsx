'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { GraduationCap, Mail, UserCheck, BookOpen, AlertCircle } from 'lucide-react';

interface SupervisionInfo {
    id: string;
    studentCode: string;
    fullName: string;
    termName: string;
    programName: string;
    internshipCourseCode?: string;
    lecturerCode?: string;
    lecturerName?: string;
    lecturerEmail?: string;
}

interface StudentAssignedLecturerCardProps {
    fallbackLecturerName?: string;
}

export function StudentAssignedLecturerCard({ fallbackLecturerName }: StudentAssignedLecturerCardProps) {
    const [info, setInfo] = useState<SupervisionInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        apiClient.get<SupervisionInfo>('/api/v1/rosters/my-supervision')
            .then((res) => {
                if (isMounted && res.data) {
                    setInfo(res.data);
                }
            })
            .catch(() => {
                // Silently fallback if endpoint is not available or student not in roster
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const lecturerName = info?.lecturerName || fallbackLecturerName || 'Khoa đang tiến hành phân công';
    const lecturerEmail = info?.lecturerEmail;
    const courseCode = info?.internshipCourseCode || 'CT250';

    return (
        <Card className="rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-sky-700" />
                    Giảng Viên Hướng Dẫn (GVHD)
                </CardTitle>
                <Badge variant="brand" className="text-[10px] py-0.5 px-2">
                    {courseCode}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 text-sky-700">
                        <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-900 truncate">
                            {lecturerName}
                        </div>
                        {info?.lecturerCode && (
                            <div className="text-xs text-slate-500 font-mono">
                                Mã CB: {info.lecturerCode}
                            </div>
                        )}
                        {lecturerEmail ? (
                            <a
                                href={`mailto:${lecturerEmail}`}
                                className="inline-flex items-center gap-1.5 text-xs text-sky-700 hover:text-sky-800 font-medium truncate"
                            >
                                <Mail className="w-3.5 h-3.5" />
                                {lecturerEmail}
                            </a>
                        ) : (
                            <div className="text-[11px] text-slate-400 italic">
                                Email GVHD cập nhật từ Khoa
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        Học phần:
                    </span>
                    <span className="font-semibold text-slate-800">
                        {info?.programName || 'Thực tập thực tế'}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
