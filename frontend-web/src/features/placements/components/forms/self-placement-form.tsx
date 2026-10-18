'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Edit3, Send } from 'lucide-react';
import { PlacementCompanyFields } from './self-placement/placement-company-fields';
import { PlacementMentorFields } from './self-placement/placement-mentor-fields';
import { PlacementFacilitiesFields } from './self-placement/placement-facilities-fields';
import { PlacementReferralWaiverCard } from './self-placement/placement-referral-waiver-card';
import { TemplateQuickDownload } from '@/features/organization/components/templates/template-quick-download';
import type { InternshipPlacement } from '../../types/placement.types';

export interface SelfPlacementFormProps {
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
  // Optional extension fields for Form 04 and Referral Waiver
  hasOfficeRoom?: boolean;
  setHasOfficeRoom?: (v: boolean) => void;
  hasComputer?: boolean;
  setHasComputer?: (v: boolean) => void;
  hoursPerDay?: number;
  setHoursPerDay?: (v: number) => void;
  daysPerWeek?: number;
  setDaysPerWeek?: (v: number) => void;
  hasReferralLetter?: boolean;
  setHasReferralLetter?: (v: boolean) => void;
  waiverReason?: string;
  setWaiverReason?: (v: string) => void;
  alternativeProofUrl?: string;
  setAlternativeProofUrl?: (v: string) => void;
}

export function SelfPlacementForm(props: SelfPlacementFormProps) {
  const [internalHasRoom, setInternalHasRoom] = useState(true);
  const [internalHasPc, setInternalHasPc] = useState(true);
  const [internalHours, setInternalHours] = useState(8);
  const [internalDays, setInternalDays] = useState(5);
  const [internalReferral, setInternalReferral] = useState(true);
  const [internalWaiverReason, setInternalWaiverReason] = useState('ALREADY_EMPLOYED');
  const [internalAlternativeProof, setInternalAlternativeProof] = useState('');

  const hasRoom = props.hasOfficeRoom ?? internalHasRoom;
  const setRoom = props.setHasOfficeRoom ?? setInternalHasRoom;
  const hasPc = props.hasComputer ?? internalHasPc;
  const setPc = props.setHasComputer ?? setInternalHasPc;
  const hours = props.hoursPerDay ?? internalHours;
  const setHours = props.setHoursPerDay ?? setInternalHours;
  const days = props.daysPerWeek ?? internalDays;
  const setDays = props.setDaysPerWeek ?? setInternalDays;

  const hasRef = props.hasReferralLetter ?? internalReferral;
  const setRef = props.setHasReferralLetter ?? setInternalReferral;
  const reason = props.waiverReason ?? internalWaiverReason;
  const setReason = props.setWaiverReason ?? setInternalWaiverReason;
  const altProof = props.alternativeProofUrl ?? internalAlternativeProof;
  const setAltProof = props.setAlternativeProofUrl ?? setInternalAlternativeProof;

  return (
    <Card className="border-slate-200 shadow-xs">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-sky-600" />
              <span>{props.placement?.status === 'REJECTED' ? 'Cập Nhật & Nộp Lại Phiếu Tiếp Nhận' : 'Thông Tin Đơn Vị Tiếp Nhận'}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Vui lòng điền chính xác thông tin doanh nghiệp và người hướng dẫn để Khoa thẩm định chuyên ngành.
            </CardDescription>
          </div>

          <TemplateQuickDownload
            reportType="FORM_04_RECEPTION_8W"
            label="Tải file Mẫu 04 gốc (.doc)"
            variant="pill"
          />
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={props.onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Học kỳ thực tập"
              id="termSelect"
              value={props.selectedTermId}
              onChange={(e) => props.setSelectedTermId(e.target.value)}
              options={props.terms.map((t) => ({
                value: t.id,
                label: `${t.code} (${t.termName})`,
              }))}
              required
            />
            <Input
              label="Vị trí thực tập (Job Title)"
              id="jobTitle"
              value={props.jobTitle}
              onChange={(e) => props.setJobTitle(e.target.value)}
              placeholder="VD: Java Backend Intern / React Native Developer"
              required
            />
          </div>

          <PlacementCompanyFields
            companyName={props.companyName}
            setCompanyName={props.setCompanyName}
            companyTaxCode={props.companyTaxCode}
            setCompanyTaxCode={props.setCompanyTaxCode}
            companyAddress={props.companyAddress}
            setCompanyAddress={props.setCompanyAddress}
            companyWebsite={props.companyWebsite}
            setCompanyWebsite={props.setCompanyWebsite}
          />

          <PlacementMentorFields
            mentorName={props.mentorName}
            setMentorName={props.setMentorName}
            mentorEmail={props.mentorEmail}
            setMentorEmail={props.setMentorEmail}
            mentorPhone={props.mentorPhone}
            setMentorPhone={props.setMentorPhone}
          />

          <PlacementFacilitiesFields
            hasOfficeRoom={hasRoom}
            setHasOfficeRoom={setRoom}
            hasComputer={hasPc}
            setHasComputer={setPc}
            hoursPerDay={hours}
            setHoursPerDay={setHours}
            daysPerWeek={days}
            setDaysPerWeek={setDays}
          />

          <PlacementReferralWaiverCard
            hasReferralLetter={hasRef}
            setHasReferralLetter={setRef}
            waiverReason={reason}
            setWaiverReason={setReason}
            alternativeProofUrl={altProof}
            setAlternativeProofUrl={setAltProof}
          />

          <div className="space-y-3">
            <Textarea
              label="Mô tả tóm tắt nội dung công việc thực tập"
              id="jobDescription"
              value={props.jobDescription}
              onChange={(e) => props.setJobDescription(e.target.value)}
              placeholder="Nêu rõ các module, công nghệ sử dụng và nhiệm vụ được phân công trong đợt thực tập..."
              rows={3}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Ngày bắt đầu làm việc"
                id="startDate"
                type="date"
                value={props.startDate}
                onChange={(e) => props.setStartDate(e.target.value)}
                required
              />
              <Input
                label="Ngày kết thúc dự kiến"
                id="endDate"
                type="date"
                value={props.endDate}
                onChange={(e) => props.setEndDate(e.target.value)}
                required
              />
            </div>

            <Input
              label="Link đính kèm Giấy tiếp nhận thực tập / Mẫu 04 có mộc đỏ (Google Drive / Cloudinary)"
              id="acceptanceLetterUrl"
              value={props.acceptanceLetterUrl}
              onChange={(e) => props.setAcceptanceLetterUrl(e.target.value)}
              placeholder="https://drive.google.com/... hoặc link ảnh/PDF có mộc công ty"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button
              type="submit"
              variant="primary"
              isLoading={props.isSubmitting}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{props.placement?.status === 'REJECTED' ? 'Cập nhật & Nộp lại đơn' : 'Gửi Phiếu Đăng Ký'}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
