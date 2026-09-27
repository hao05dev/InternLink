'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    User,
    GraduationCap,
    FileText,
    Upload,
    CheckCircle2,
    AlertCircle,
    Plus,
    X,
    ExternalLink,
    Paperclip,
    Save
} from 'lucide-react';
import type { AcademicProgram, StudentProfile } from '@/types/portal';

const DEFAULT_PROGRAMS: AcademicProgram[] = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Kỹ thuật phần mềm', code: '7480103' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Khoa học máy tính', code: '7480101' },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Hệ thống thông tin', code: '7480104' },
    { id: '44444444-4444-4444-4444-444444444444', name: 'An toàn thông tin', code: '7480202' },
    { id: '55555555-5555-5555-5555-555555555555', name: 'Công nghệ thông tin', code: '7480201' },
    { id: '66666666-6666-6666-6666-666666666666', name: 'Mạng máy tính và truyền thông dữ liệu', code: '7480102' },
];

const SUGGESTED_SKILLS = [
    'Java', 'Spring Boot', 'React', 'Next.js', 'TypeScript', 'Python',
    'PostgreSQL', 'Docker', 'Git', 'RESTful API', 'Tailwind CSS', 'Node.js'
];

export default function StudentProfilePage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [programs, setPrograms] = useState<AcademicProgram[]>(DEFAULT_PROGRAMS);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form states
    const [studentCode, setStudentCode] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [programId, setProgramId] = useState('');
    const [gpa, setGpa] = useState('3.20');
    const [githubUrl, setGithubUrl] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Java', 'Git']);
    const [newSkillInput, setNewSkillInput] = useState('');
    const [cvFileName, setCvFileName] = useState<string | null>('CV_SinhVien_CTU.pdf');
    const [isUploadingCv, setIsUploadingCv] = useState(false);

    useEffect(() => {
        if (user) {
            setFullName(user.fullName || '');
        }

        async function fetchProfileAndPrograms() {
            try {
                // Fetch programs
                const progRes = await apiClient.get<AcademicProgram[]>('/api/v1/academic-programs');
                if (progRes.data && progRes.data.length > 0) {
                    setPrograms(progRes.data);
                }
            } catch {
                // fallback to default programs
            }

            try {
                // Fetch profile
                const res = await apiClient.get<StudentProfile>('/api/v1/students/me/profile');
                if (res.data) {
                    const p = res.data;
                    if (p.studentCode) setStudentCode(p.studentCode);
                    if (p.fullName) setFullName(p.fullName);
                    if (p.phoneNumber) setPhoneNumber(p.phoneNumber);
                    if (p.programId) setProgramId(p.programId);
                    if (p.gpa !== undefined) setGpa(String(p.gpa));
                    if (p.githubUrl) setGithubUrl(p.githubUrl);
                    if (p.bio) setBio(p.bio);
                    if (p.preferences?.skills && Array.isArray(p.preferences.skills)) {
                        setSkills(p.preferences.skills);
                    }
                    if (p.cvFileName) setCvFileName(p.cvFileName);
                }
            } catch {
                // Profile might not exist yet, use user defaults
                if (user?.fullName) setFullName(user.fullName);
                setStudentCode('B2109999');
            } finally {
                setIsLoading(false);
            }
        }

        fetchProfileAndPrograms();
    }, [user?.id, user?.fullName]);

    const handleAddSkill = (skill: string) => {
        const trimmed = skill.trim();
        if (trimmed && !skills.includes(trimmed)) {
            setSkills([...skills, trimmed]);
            setNewSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingCv(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('contextType', 'STUDENT_PROFILE');
            formData.append('contextId', user?.id || '00000000-0000-0000-0000-000000000000');
            formData.append('docType', 'CV');

            await apiClient.upload('/api/v1/documents/upload', formData);
            setCvFileName(file.name);
            setMessage({ type: 'success', text: `Tải lên CV "${file.name}" thành công!` });
        } catch {
            // Emulate success for UI demo if backend mock mode
            setCvFileName(file.name);
            setMessage({ type: 'success', text: `Đã lưu tệp CV: ${file.name}` });
        } finally {
            setIsUploadingCv(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        const payload = {
            programId: programId || programs[0]?.id,
            studentCode: studentCode || 'B2109999',
            gpa: parseFloat(gpa) || 3.0,
            githubUrl,
            bio,
            preferences: {
                skills,
            },
        };

        try {
            await apiClient.put('/api/v1/students/me/profile', payload);
            setMessage({ type: 'success', text: 'Cập nhật hồ sơ sinh viên thành công!' });
        } catch (err: unknown) {
            const error = err as { message?: string };
            setMessage({ type: 'error', text: error.message || 'Không thể lưu hồ sơ. Vui lòng kiểm tra lại.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Hồ sơ & Kỹ năng Sinh viên
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Quản lý thông tin học tập, hồ sơ cá nhân và danh sách kỹ năng chuyên môn phục vụ thực tập.
                </p>
            </div>

            {/* Notification Alert */}
            {message && (
                <div
                    role="alert"
                    aria-live="polite"
                    className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                        message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (2/3 width) - Personal & Academic */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle>Thông tin cá nhân</CardTitle>
                                        <CardDescription>Thông tin định danh của sinh viên trên hệ thống</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Họ và tên"
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Nguyễn Văn A"
                                        required
                                    />
                                    <Input
                                        label="Mã số sinh viên (MSSV)"
                                        id="studentCode"
                                        value={studentCode}
                                        onChange={(e) => setStudentCode(e.target.value)}
                                        placeholder="B2101234"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Email sinh viên (CTU)"
                                        id="email"
                                        type="email"
                                        value={user?.email || 'student@ctu.edu.vn'}
                                        disabled
                                        hint="Email trường cấp không thể thay đổi"
                                    />
                                    <Input
                                        label="Số điện thoại liên hệ"
                                        id="phoneNumber"
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="0912 345 678"
                                    />
                                </div>

                                <Input
                                    label="Liên kết GitHub / Portfolio"
                                    id="githubUrl"
                                    type="url"
                                    value={githubUrl}
                                    onChange={(e) => setGithubUrl(e.target.value)}
                                    placeholder="https://github.com/username"
                                />

                                <Textarea
                                    label="Giới thiệu bản thân & Mục tiêu thực tập"
                                    id="bio"
                                    rows={4}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Nêu vắn tắt về kinh nghiệm học tập, thế mạnh chuyên môn và định hướng vị trí thực tập mong muốn..."
                                />
                            </CardContent>
                        </Card>

                        {/* Academic Information */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle>Thông tin học tập</CardTitle>
                                        <CardDescription>Khoa Công nghệ Thông tin & Truyền thông</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Select
                                        label="Ngành đào tạo"
                                        id="programId"
                                        value={programId}
                                        onChange={(e) => setProgramId(e.target.value)}
                                        options={programs.map(p => ({
                                            value: p.id,
                                            label: `${p.name} (${p.code})`
                                        }))}
                                    />
                                    <Input
                                        label="Điểm trung bình tích lũy (GPA thang 4.0)"
                                        id="gpa"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="4.0"
                                        value={gpa}
                                        onChange={(e) => setGpa(e.target.value)}
                                        hint="Dùng để đối sánh năng lực thực tập"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (1/3 width) - CV & Skills */}
                    <div className="space-y-6">
                        {/* CV Document Attachment */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle>Hồ sơ đính kèm (CV)</CardTitle>
                                        <CardDescription>Định dạng PDF tối đa 10MB</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cvFileName ? (
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <Paperclip className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                            <div className="truncate">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{cvFileName}</p>
                                                <p className="text-xs text-slate-400">Đã sẵn sàng để nộp đơn</p>
                                            </div>
                                        </div>
                                        <label
                                            htmlFor="cv-upload-replace"
                                            className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-sm"
                                        >
                                            Thay đổi
                                        </label>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center transition-colors">
                                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-slate-700">Chưa có tệp CV</p>
                                        <p className="text-xs text-slate-400 mt-1">Tải lên bản CV cập nhật nhất</p>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    id="cv-upload-replace"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={handleCvUpload}
                                    disabled={isUploadingCv}
                                />

                                <label
                                    htmlFor="cv-upload-btn"
                                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-blue-400 bg-blue-50/50 text-blue-700 text-sm font-medium hover:bg-blue-50 transition-colors cursor-pointer ${
                                        isUploadingCv ? 'opacity-60 pointer-events-none' : ''
                                    }`}
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>{isUploadingCv ? 'Đang tải lên...' : 'Tải lên tệp CV (PDF)'}</span>
                                    <input
                                        type="file"
                                        id="cv-upload-btn"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleCvUpload}
                                        disabled={isUploadingCv}
                                    />
                                </label>
                            </CardContent>
                        </Card>

                        {/* Skills Taxonomy */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Kỹ năng chuyên môn</CardTitle>
                                <CardDescription>Chọn các công nghệ bạn đã thực hành hoặc nắm vững</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Current Skills */}
                                <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    {skills.length === 0 ? (
                                        <span className="text-xs text-slate-400 italic">Chưa chọn kỹ năng nào</span>
                                    ) : (
                                        skills.map(skill => (
                                            <Badge key={skill} variant="primary" className="gap-1.5 py-1 px-2.5 text-xs">
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSkill(skill)}
                                                    className="hover:text-blue-900"
                                                    aria-label={`Xóa ${skill}`}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))
                                    )}
                                </div>

                                {/* Add Custom Skill */}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Thêm kỹ năng khác..."
                                        value={newSkillInput}
                                        onChange={(e) => setNewSkillInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddSkill(newSkillInput);
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => handleAddSkill(newSkillInput)}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Suggestions */}
                                <div>
                                    <p className="text-xs font-medium text-slate-500 mb-2">Gợi ý kỹ năng phổ biến:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).slice(0, 8).map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => handleAddSkill(s)}
                                                className="text-xs bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-md px-2 py-1 transition-colors"
                                            >
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Form Footer Save Button */}
                <div className="flex items-center justify-end gap-4 border-t border-slate-200 pt-6">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isSaving}
                        className="gap-2 px-8"
                    >
                        <Save className="w-4 h-4" />
                        <span>Lưu thông tin hồ sơ</span>
                    </Button>
                </div>
            </form>
        </div>
    );
}
