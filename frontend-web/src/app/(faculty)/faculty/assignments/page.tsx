'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import {
    Layers,
    UserCheck,
    GraduationCap,
    Building2,
    CheckCircle2,
    UserPlus
} from 'lucide-react';
import type { InternshipPlacement } from '@/types/portal';

interface LecturerOption {
    id: string;
    fullName: string;
    email: string;
    department: string;
}

const SAMPLE_LECTURERS: LecturerOption[] = [
    { id: 'lec-01', fullName: 'TS. Nguyễn Văn Hướng', email: 'nvhuong@ctu.edu.vn', department: 'Khoa Kỹ thuật Phần mềm' },
    { id: 'lec-02', fullName: 'ThS. Lê Hoàng Tuấn', email: 'lhtuan@ctu.edu.vn', department: 'Khoa Khoa học Máy tính' },
    { id: 'lec-03', fullName: 'PGS.TS. Trần Thị Mai', email: 'ttmai@ctu.edu.vn', department: 'Khoa Hệ thống Thông tin' },
];

const SAMPLE_PLACEMENTS: InternshipPlacement[] = [
    {
        id: 'plc-ass-01',
        studentId: 'std-1',
        studentName: 'Nguyễn Văn A',
        studentCode: 'B2101234',
        companyName: 'FPT Software Cần Thơ',
        jobTitle: 'Thực tập sinh Lập trình Web Fullstack',
        mentorName: 'Trần Minh Hoàng',
        lecturerId: 'lec-01',
        lecturerName: 'TS. Nguyễn Văn Hướng',
        status: 'ACTIVE',
    },
    {
        id: 'plc-ass-02',
        studentId: 'std-2',
        studentName: 'Trần Thị Bích Ngọc',
        studentCode: 'B2105678',
        companyName: 'VNPT Cần Thơ',
        jobTitle: 'Thực tập sinh Phát triển Di động Flutter',
        mentorName: 'Nguyễn Văn Minh',
        lecturerId: undefined,
        lecturerName: undefined,
        status: 'ACTIVE',
    },
];

export default function FacultyAssignmentsPage() {
    const [placements, setPlacements] = useState<InternshipPlacement[]>(SAMPLE_PLACEMENTS);
    const [lecturers, setLecturers] = useState<LecturerOption[]>(SAMPLE_LECTURERS);
    const [selectedPlacement, setSelectedPlacement] = useState<InternshipPlacement | null>(null);
    const [selectedLecturerId, setSelectedLecturerId] = useState(SAMPLE_LECTURERS[0].id);
    const [isAssigning, setIsAssigning] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleAssignLecturer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlacement) return;

        setIsAssigning(true);
        const lec = lecturers.find(l => l.id === selectedLecturerId);

        setTimeout(() => {
            setPlacements(prev =>
                prev.map(p =>
                    p.id === selectedPlacement.id
                        ? {
                              ...p,
                              lecturerId: selectedLecturerId,
                              lecturerName: lec?.fullName || 'Giảng viên hướng dẫn',
                          }
                        : p
                )
            );
            setMessage({
                type: 'success',
                text: `Đã phân công ${lec?.fullName} hướng dẫn sinh viên ${selectedPlacement.studentName}.`,
            });
            setIsAssigning(false);
            setSelectedPlacement(null);
        }, 600);
    };

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Phân Công Giảng Viên Hướng Dẫn (GVHD)
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Chỉ định giảng viên Khoa CNTT&TT theo dõi tiến độ, nhận xét nhật ký và tham gia hội đồng chấm thi thực tập.
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

            {/* Placements List */}
            <div className="space-y-4">
                {placements.map((plc) => (
                    <Card key={plc.id} className="hover:border-slate-300 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="font-bold text-base text-slate-900">{plc.studentName}</span>
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                            MSSV: {plc.studentCode}
                                        </span>
                                        <StatusBadge status={plc.status} type="placement" />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-y-1 gap-x-5 text-xs text-slate-600">
                                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                            <Building2 className="w-4 h-4 text-slate-400" />
                                            <span>{plc.companyName} ({plc.jobTitle})</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <UserCheck className="w-4 h-4 text-emerald-600" />
                                            <span>Mentor DN: {plc.mentorName || 'Chưa phân công'}</span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <span>
                                            <strong>Giảng viên hướng dẫn:</strong>{' '}
                                            {plc.lecturerName ? (
                                                <span className="font-bold">{plc.lecturerName}</span>
                                            ) : (
                                                <span className="text-amber-700 italic font-medium">Chưa có GVHD chỉ định</span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end md:self-center">
                                    <Button
                                        variant={plc.lecturerName ? 'outline' : 'primary'}
                                        size="sm"
                                        onClick={() => {
                                            setSelectedPlacement(plc);
                                            if (plc.lecturerId) setSelectedLecturerId(plc.lecturerId);
                                        }}
                                        className="gap-1.5 text-xs"
                                    >
                                        <UserPlus className="w-3.5 h-3.5" />
                                        <span>{plc.lecturerName ? 'Đổi GVHD' : 'Chỉ định GVHD'}</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Assign Modal */}
            <Modal
                isOpen={!!selectedPlacement}
                onClose={() => setSelectedPlacement(null)}
                title={`Chỉ định Giảng viên hướng dẫn: ${selectedPlacement?.studentName}`}
                maxWidth="md"
            >
                <form onSubmit={handleAssignLecturer} className="space-y-4">
                    <p className="text-xs text-slate-600">
                        Chọn giảng viên thuộc Trường CNTT&TT để phụ trách theo dõi và hướng dẫn sinh viên <strong>{selectedPlacement?.studentName}</strong> (MSSV: {selectedPlacement?.studentCode}).
                    </p>

                    <Select
                        label="Giảng viên hướng dẫn (GVHD)"
                        id="selectLecturer"
                        value={selectedLecturerId}
                        onChange={(e) => setSelectedLecturerId(e.target.value)}
                        options={lecturers.map(l => ({
                            value: l.id,
                            label: `${l.fullName} — ${l.department}`
                        }))}
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setSelectedPlacement(null)}
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
                            <GraduationCap className="w-4 h-4" />
                            <span>Xác nhận phân công</span>
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
