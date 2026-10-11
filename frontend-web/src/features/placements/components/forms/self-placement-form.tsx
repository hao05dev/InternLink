'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Building2, Edit3, Send, UserCheck } from 'lucide-react';
import { InternshipPlacement } from '../../types/placement.types';

interface SelfPlacementFormProps {
    placement: InternshipPlacement | null;
    terms: Array<{ id: string; code: string; termName: string }>;
    selectedTermId: string;
    setSelectedTermId: (v: string) => void;
    companyName: string;
    setCompanyName: (v: string) => void;
    companyTaxCode: string;
    setCompanyTaxCode: (v: string) => void;
    companyAddress: string;
    setCompanyAddress: (v: string) => void;
    companyWebsite: string;
    setCompanyWebsite: (v: string) => void;
    jobTitle: string;
    setJobTitle: (v: string) => void;
    jobDescription: string;
    setJobDescription: (v: string) => void;
    mentorName: string;
    setMentorName: (v: string) => void;
    mentorEmail: string;
    setMentorEmail: (v: string) => void;
    mentorPhone: string;
    setMentorPhone: (v: string) => void;
    startDate: string;
    setStartDate: (v: string) => void;
    endDate: string;
    setEndDate: (v: string) => void;
    acceptanceLetterUrl: string;
    setAcceptanceLetterUrl: (v: string) => void;
    isSubmitting: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export function SelfPlacementForm({
    placement,
    terms,
    selectedTermId,
    setSelectedTermId,
    companyName,
    setCompanyName,
    companyTaxCode,
    setCompanyTaxCode,
    companyAddress,
    setCompanyAddress,
    companyWebsite,
    setCompanyWebsite,
    jobTitle,
    setJobTitle,
    jobDescription,
    setJobDescription,
    mentorName,
    setMentorName,
    mentorEmail,
    setMentorEmail,
    mentorPhone,
    setMentorPhone,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    acceptanceLetterUrl,
    setAcceptanceLetterUrl,
    isSubmitting,
    onSubmit,
}: SelfPlacementFormProps) {
    return (
        <Card className="border-slate-200 shadow-xs">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-sky-600" />
                    <span>{placement?.status === 'REJECTED' ? 'Cập Nhật & Nộp Lại Phiếu Tiếp Nhận' : 'Thông Tin Đơn Vị Tiếp Nhận'}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                    Vui lòng điền chính xác thông tin doanh nghiệp và người hướng dẫn để Khoa thẩm định chuyên ngành.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    {/* Semester Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                            label="Học kỳ thực tập"
                            id="termSelect"
                            value={selectedTermId}
                            onChange={(e) => setSelectedTermId(e.target.value)}
                            options={terms.map((t) => ({
                                value: t.id,
                                label: `${t.code} (${t.termName})`,
                            }))}
                            required
                        />
                        <Input
                            label="Vị trí thực tập (Job Title)"
                            id="jobTitle"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="VD: Java Backend Intern / React Native Developer"
                            required
                        />
                    </div>

                    {/* Company Information */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-sky-600" />
                            <span>Thông tin Doanh nghiệp tiếp nhận</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                                label="Tên Doanh nghiệp / Công ty"
                                id="companyName"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="VD: Công ty TNHH Phần mềm ABC"
                                required
                            />
                            <Input
                                label="Mã số thuế doanh nghiệp"
                                id="companyTaxCode"
                                value={companyTaxCode}
                                onChange={(e) => setCompanyTaxCode(e.target.value)}
                                placeholder="VD: 1801234567"
                            />
                            <div className="sm:col-span-2">
                                <Input
                                    label="Địa chỉ trụ sở / Chi nhánh làm việc"
                                    id="companyAddress"
                                    value={companyAddress}
                                    onChange={(e) => setCompanyAddress(e.target.value)}
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                                    required
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Input
                                    label="Website / Fanpage Doanh nghiệp"
                                    id="companyWebsite"
                                    value={companyWebsite}
                                    onChange={(e) => setCompanyWebsite(e.target.value)}
                                    placeholder="https://company.vn"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mentor Information */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                            <span>Người hướng dẫn trực tiếp tại Doanh nghiệp (Mentor)</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Input
                                label="Họ tên Người hướng dẫn"
                                id="mentorName"
                                value={mentorName}
                                onChange={(e) => setMentorName(e.target.value)}
                                placeholder="VD: Nguyễn Văn Mentor"
                                required
                            />
                            <Input
                                label="Email Người hướng dẫn"
                                id="mentorEmail"
                                type="email"
                                value={mentorEmail}
                                onChange={(e) => setMentorEmail(e.target.value)}
                                placeholder="mentor@company.com"
                                required
                            />
                            <Input
                                label="Số điện thoại Người hướng dẫn"
                                id="mentorPhone"
                                value={mentorPhone}
                                onChange={(e) => setMentorPhone(e.target.value)}
                                placeholder="0901234567"
                                required
                            />
                        </div>
                    </div>

                    {/* Job Description & Duration */}
                    <div className="space-y-3">
                        <Textarea
                            label="Mô tả tóm tắt nội dung công việc thực tập"
                            id="jobDescription"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Nêu rõ các module, công nghệ sử dụng và nhiệm vụ được phân công trong đợt thực tập..."
                            rows={3}
                            required
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                                label="Ngày bắt đầu làm việc"
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                            <Input
                                label="Ngày kết thúc dự kiến"
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>

                        <Input
                            label="Link đính kèm Giấy tiếp nhận thực tập (Google Drive / Cloudinary)"
                            id="acceptanceLetterUrl"
                            value={acceptanceLetterUrl}
                            onChange={(e) => setAcceptanceLetterUrl(e.target.value)}
                            placeholder="https://drive.google.com/... hoặc link ảnh/PDF có mộc công ty"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-3 border-t border-slate-100">
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={isSubmitting}
                            className="gap-2"
                        >
                            <Send className="w-4 h-4" />
                            <span>{placement?.status === 'REJECTED' ? 'Cập nhật & Nộp lại đơn' : 'Gửi Phiếu Đăng Ký'}</span>
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
