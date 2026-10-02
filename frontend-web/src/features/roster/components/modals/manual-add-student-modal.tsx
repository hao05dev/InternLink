'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle2 } from 'lucide-react';
import { AcademicProgramOption } from '../../types/roster.types';
import { deriveEmail, deriveAcademicYear } from '../../utils/roster-helpers';

export interface ManualStudentPayload {
    programId: string;
    studentCode: string;
    officialEmail: string;
    fullName: string;
    academicYear: string;
    classCode?: string | null;
    internshipCourseCode: string;
    eligibilityStatus: string;
}

interface ManualAddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: ManualStudentPayload) => Promise<boolean>;
    isLoading: boolean;
    programs: AcademicProgramOption[];
}

export function ManualAddStudentModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    programs,
}: ManualAddStudentModalProps) {
    const [newStudentCode, setNewStudentCode] = useState('');
    const [newFullName, setNewFullName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newProgramId, setNewProgramId] = useState('');
    const [newAcademicYear, setNewAcademicYear] = useState('Khóa 47');
    const [newClassCode, setNewClassCode] = useState('');
    const [courseCode, setCourseCode] = useState('CT444');

    useEffect(() => {
        if (programs.length > 0 && !newProgramId) {
            setNewProgramId(programs[0].id);
        }
    }, [programs, newProgramId]);

    const handleStudentCodeChange = (code: string) => {
        setNewStudentCode(code);
        const year = deriveAcademicYear(code);
        if (year) setNewAcademicYear(year);
        if (newFullName.trim()) {
            const email = deriveEmail(newFullName, code);
            if (email) setNewEmail(email);
        }
    };

    const handleFullNameChange = (name: string) => {
        setNewFullName(name);
        if (newStudentCode.trim()) {
            const email = deriveEmail(name, newStudentCode);
            if (email) setNewEmail(email);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const effectiveProgId = newProgramId || programs[0]?.id;
        if (!effectiveProgId) return;

        const success = await onSubmit({
            programId: effectiveProgId,
            studentCode: newStudentCode.trim().toUpperCase(),
            officialEmail: newEmail.trim().toLowerCase(),
            fullName: newFullName.trim(),
            academicYear: newAcademicYear.trim(),
            classCode: newClassCode.trim() || null,
            internshipCourseCode: courseCode.trim().toUpperCase(),
            eligibilityStatus: 'ELIGIBLE',
        });

        if (success) {
            setNewStudentCode('');
            setNewFullName('');
            setNewEmail('');
            setNewClassCode('');
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Thêm sinh viên thủ công" maxWidth="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-slate-500">Thêm từng sinh viên vào danh sách thực tập theo kỳ đã chọn.</p>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Input
                            label="MSSV *"
                            placeholder="VD: B2306614"
                            value={newStudentCode}
                            onChange={(e) => handleStudentCodeChange(e.target.value)}
                            required
                        />
                    </div>
                    <Input
                        label="Mã lớp"
                        placeholder="VD: CT49A"
                        value={newClassCode}
                        onChange={(e) => setNewClassCode(e.target.value)}
                    />
                </div>
                <div>
                    <Input
                        label="Họ và tên *"
                        placeholder="Nguyễn Văn A"
                        value={newFullName}
                        onChange={(e) => handleFullNameChange(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <Input
                        label="Email sinh viên *"
                        type="email"
                        placeholder="haob2306614@student.ctu.edu.vn"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                    />
                    {newEmail.endsWith('@student.ctu.edu.vn') && (
                        <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Tự điền theo tên + MSSV. Có thể chỉnh sửa nếu cần.
                        </p>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Input
                            label="Khóa học *"
                            placeholder="Khóa 49"
                            value={newAcademicYear}
                            onChange={(e) => setNewAcademicYear(e.target.value)}
                        />
                        {newAcademicYear && newStudentCode && (
                            <p className="text-[10px] text-sky-600 mt-1 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Tự tính từ MSSV
                            </p>
                        )}
                    </div>
                    <Input
                        label="Mã học phần *"
                        placeholder="CT444"
                        value={courseCode}
                        onChange={e => setCourseCode(e.target.value)}
                        required
                    />
                </div>
                {programs.length > 0 && (
                    <Select
                        label="Ngành đào tạo *"
                        value={newProgramId}
                        onChange={(e) => setNewProgramId(e.target.value)}
                        options={programs.map(p => ({ value: p.id, label: `${p.name} (${p.code})` }))}
                    />
                )}
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isLoading} className="gap-2">
                        <Upload className="w-4 h-4" />
                        Xác nhận thêm
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
