'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
    Users,
    Upload,
    CheckCircle2,
    XCircle,
    Search,
    FileSpreadsheet,
    GraduationCap,
    AlertCircle
} from 'lucide-react';

interface RosterStudent {
    id: string;
    studentCode: string;
    fullName: string;
    programName: string;
    creditsAccumulated: number;
    gpa: number;
    isEligible: boolean;
    status: 'ELIGIBLE' | 'INELIGIBLE' | 'PLACED';
}

const SAMPLE_ROSTER: RosterStudent[] = [
    {
        id: 'std-r-01',
        studentCode: 'B2101234',
        fullName: 'Nguyễn Văn A',
        programName: 'Kỹ thuật phần mềm',
        creditsAccumulated: 110,
        gpa: 3.52,
        isEligible: true,
        status: 'PLACED',
    },
    {
        id: 'std-r-02',
        studentCode: 'B2105678',
        fullName: 'Trần Thị Bích Ngọc',
        programName: 'Khoa học máy tính',
        creditsAccumulated: 115,
        gpa: 3.75,
        isEligible: true,
        status: 'ELIGIBLE',
    },
    {
        id: 'std-r-03',
        studentCode: 'B2109012',
        fullName: 'Lê Hoàng Nam',
        programName: 'Hệ thống thông tin',
        creditsAccumulated: 105,
        gpa: 3.15,
        isEligible: true,
        status: 'ELIGIBLE',
    },
    {
        id: 'std-r-04',
        studentCode: 'B2107777',
        fullName: 'Phạm Minh Trí',
        programName: 'Kỹ thuật phần mềm',
        creditsAccumulated: 85,
        gpa: 2.10,
        isEligible: false,
        status: 'INELIGIBLE',
    },
];

export default function FacultyRosterPage() {
    const [roster, setRoster] = useState<RosterStudent[]>(SAMPLE_ROSTER);
    const [searchTerm, setSearchTerm] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const filtered = roster.filter(s =>
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsImporting(true);
        setTimeout(() => {
            setIsImporting(false);
            setMessage({ type: 'success', text: 'Nhập danh sách sinh viên đủ điều kiện thành công (45 sinh viên được thêm vào đợt thực tập).' });
            setIsImportModalOpen(false);
        }, 800);
    };

    return (
        <div className="space-y-8 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Danh Sách Sinh Viên Đủ Điều Kiện (Student Roster)
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Quản lý danh sách sinh viên đạt chuẩn số tín chỉ tích lũy để tham gia kỳ thực tập tốt nghiệp.
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setIsImportModalOpen(true)}
                    className="gap-2 self-start sm:self-auto"
                >
                    <Upload className="w-4 h-4" />
                    <span>Import danh sách từ Phòng Đào tạo</span>
                </Button>
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

            {/* Search Filter */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Tìm theo tên hoặc MSSV..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Roster Table Card */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Sinh viên</th>
                                <th className="px-6 py-4">MSSV</th>
                                <th className="px-6 py-4">Ngành đào tạo</th>
                                <th className="px-6 py-4 text-center">Tín chỉ tích lũy</th>
                                <th className="px-6 py-4 text-center">GPA</th>
                                <th className="px-6 py-4 text-center">Điều kiện</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                            {filtered.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{s.fullName}</td>
                                    <td className="px-6 py-4 text-blue-700 font-medium">{s.studentCode}</td>
                                    <td className="px-6 py-4">{s.programName}</td>
                                    <td className="px-6 py-4 text-center">{s.creditsAccumulated} / 100 TC</td>
                                    <td className="px-6 py-4 text-center font-bold">{s.gpa.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center">
                                        {s.isEligible ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Đủ điều kiện
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                                <XCircle className="w-3.5 h-3.5" /> Thiếu tín chỉ
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge
                                            variant={s.status === 'PLACED' ? 'success' : s.status === 'ELIGIBLE' ? 'brand' : 'destructive'}
                                            className="text-[11px]"
                                        >
                                            {s.status === 'PLACED' ? 'Đã nhận việc' : s.status === 'ELIGIBLE' ? 'Chưa nhận việc' : 'Không đạt'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Import Roster Modal */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Import danh sách sinh viên đủ điều kiện thực tập"
                maxWidth="md"
            >
                <form onSubmit={handleImportSubmit} className="space-y-4">
                    <p className="text-xs text-slate-500">
                        Tải lên tệp Excel (.xlsx, .csv) chứa danh sách sinh viên năm cuối đủ điều kiện thực tập tốt nghiệp từ Phòng Đào tạo ĐH Cần Thơ.
                    </p>

                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50">
                        <FileSpreadsheet className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-800">Kéo thả tệp Excel hoặc bấm để duyệt tệp</p>
                        <p className="text-[11px] text-slate-400 mt-1">Hỗ trợ các cột: MSSV, Họ tên, Ngành, Tín chỉ, GPA</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsImportModalOpen(false)}
                            disabled={isImporting}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isImporting}
                            className="gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Xác nhận Import</span>
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
