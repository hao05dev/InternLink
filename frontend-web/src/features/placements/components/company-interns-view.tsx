'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import {
    GraduationCap,
    UserCheck,
    Calendar,
    CheckCircle2,
    Users,
    Layers,
    UserPlus,
    Building2
} from 'lucide-react';
import type { InternshipPlacement } from '@/features/placements/types/placement.types';

interface MentorOption {
    id: string;
    fullName: string;
    email: string;
    department: string;
}

export default function CompanyInternsView() {
    const [interns, setInterns] = useState<InternshipPlacement[]>([]);
    const [mentors, setMentors] = useState<MentorOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [assignModalPlacement, setAssignModalPlacement] = useState<InternshipPlacement | null>(null);
    const [selectedMentorId, setSelectedMentorId] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        async function fetchInterns() {
            try {
                const res = await apiClient.get<InternshipPlacement[]>('/api/v1/placements/company/my-interns');
                setInterns(res.data ?? []);
            } catch (error) {
                setInterns([]);
                setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Không tải được danh sách thực tập sinh.' });
            } finally {
                setIsLoading(false);
            }
        }

        fetchInterns();
    }, []);

    const handleAssignMentor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignModalPlacement) return;

        setIsAssigning(true);
        const mentor = mentors.find(m => m.id === selectedMentorId);

        setMessage({ type: 'error', text: 'API hiện chưa hỗ trợ đổi Mentor sau khi kích hoạt thực tập.' });
        setIsAssigning(false);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
                <div className="space-y-4">
                    <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Danh Sách Thực Tập Sinh Tại Doanh Nghiệp
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Theo dõi sinh viên đang thực tập, phân công Cán bộ hướng dẫn (Mentor) và phối hợp với Giảng viên CICT.
                </p>
            </div>

            {/* Notification alert */}
            {message && (
                <div
                    role="alert"
                    aria-live="polite"
                    className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${
                        message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span>{message.text}</span>
                    </div>
                    <button
                        onClick={() => setMessage(null)}
                        className="text-slate-400 hover:text-slate-600"
                        aria-label="Đóng thông báo"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Interns List */}
            {interns.length === 0 ? (
                <EmptyState
                    title="Chưa có thực tập sinh tiếp nhận"
                    description="Doanh nghiệp chưa có sinh viên nào bắt đầu giai đoạn thực tập chính thức."
                />
            ) : (
                <div className="space-y-4">
                    {interns.map((intern) => (
                        <Card key={intern.id} className="hover:border-slate-300 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="font-bold text-base text-slate-900">
                                                {intern.studentName}
                                            </span>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                                MSSV: {intern.studentCode}
                                            </span>
                                            <StatusBadge status={intern.status} type="placement" />
                                        </div>

                                        <p className="text-xs font-medium text-slate-700">
                                            Vị trí: <span className="font-semibold text-blue-700">{intern.jobTitle}</span>
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                                <span>
                                                    <strong>Mentor DN:</strong>{' '}
                                                    {intern.mentorName ? (
                                                        <span className="text-slate-900 font-semibold">{intern.mentorName}</span>
                                                    ) : (
                                                        <span className="text-amber-600 italic">Chưa phân công</span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                <span>
                                                    <strong>GVHD CICT:</strong>{' '}
                                                    <span className="text-slate-900">{intern.lecturerName || 'Khoa đang chỉ định'}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {intern.startDate && intern.endDate && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>
                                                    Thời gian: {new Date(intern.startDate).toLocaleDateString('vi-VN')} – {new Date(intern.endDate).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action button */}
                                    <div className="flex items-center gap-2 self-end md:self-center">
                                        <Button
                                            variant={intern.mentorName ? 'outline' : 'primary'}
                                            size="sm"
                                            disabled
                                            title="Mentor được chỉ định khi phát hành thư mời; API chưa hỗ trợ đổi sau khi kích hoạt."
                                            onClick={() => {
                                                setAssignModalPlacement(intern);
                                                if (intern.mentorId) setSelectedMentorId(intern.mentorId);
                                            }}
                                            className="gap-1.5 text-xs"
                                        >
                                            <UserPlus className="w-3.5 h-3.5" />
                                            <span>{intern.mentorName ? 'Đổi Mentor' : 'Phân công Mentor'}</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Assign Mentor Modal */}
            <Modal
                isOpen={!!assignModalPlacement}
                onClose={() => setAssignModalPlacement(null)}
                title={`Phân công Cán bộ hướng dẫn: ${assignModalPlacement?.studentName}`}
                maxWidth="md"
            >
                <form onSubmit={handleAssignMentor} className="space-y-4">
                    <p className="text-xs text-slate-500">
                        Chọn một cán bộ kỹ thuật của doanh nghiệp để hướng dẫn chuyên môn và nhận xét nhật ký tuần cho sinh viên <strong>{assignModalPlacement?.studentName}</strong> (MSSV: {assignModalPlacement?.studentCode}).
                    </p>

                    <Select
                        label="Cán bộ hướng dẫn (Mentor)"
                        id="selectMentor"
                        value={selectedMentorId}
                        onChange={(e) => setSelectedMentorId(e.target.value)}
                        options={mentors.map(m => ({
                            value: m.id,
                            label: `${m.fullName} — ${m.department}`
                        }))}
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setAssignModalPlacement(null)}
                            disabled={isAssigning}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isAssigning}
                            className="gap-2"
                        >
                            <UserCheck className="w-4 h-4" />
                            <span>Xác nhận phân công</span>
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
