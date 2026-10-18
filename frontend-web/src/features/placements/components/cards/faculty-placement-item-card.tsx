'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  Monitor,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react';
import type { InternshipPlacement } from '../../types/placement.types';

const WAIVER_REASON_LABELS: Record<string, string> = {
  ALREADY_EMPLOYED: 'Đã đi làm chính thức (HĐLĐ)',
  OFFER_LETTER_ACCEPTED: 'Trúng tuyển trực tiếp (Offer Letter)',
  PERSONAL_RELATION: 'Tự liên hệ qua mạng lưới đối tác',
  OTHER: 'Lý do khác',
};

export interface FacultyPlacementItemCardProps {
  placement: InternshipPlacement;
  actionLoadingId: string | null;
  onApprove: (id: string) => void;
  onApproveTransfer: (id: string) => void;
  onOpenRejectModal: (placement: InternshipPlacement) => void;
}

export function FacultyPlacementItemCard({
  placement: p,
  actionLoadingId,
  onApprove,
  onApproveTransfer,
  onOpenRejectModal,
}: FacultyPlacementItemCardProps) {
  const isLoading = actionLoadingId === p.id;
  const isWaived = p.hasReferralLetter === false || !!p.waiverReason;

  return (
    <Card className="border-slate-200/80 shadow-xs hover:border-slate-300 transition">
      <CardContent className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          {/* Left: Student & Details */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-bold text-base text-slate-900">{p.studentName}</span>
              <Badge variant="brand" className="font-mono text-xs">{p.studentCode}</Badge>

              {p.status === 'PENDING_APPROVAL' && (
                <Badge variant="warning" className="gap-1">
                  <Clock className="w-3 h-3" /> Chờ xét duyệt
                </Badge>
              )}
              {p.status === 'TRANSFER_REQUESTED' && (
                <Badge variant="warning" className="gap-1 text-amber-800 bg-amber-50 border-amber-200">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Xin đổi đơn vị
                </Badge>
              )}
              {p.status === 'APPROVED' && (
                <Badge variant="success" className="gap-1">
                  <UserCheck className="w-3 h-3" /> Đã duyệt
                </Badge>
              )}
              {p.status === 'REJECTED' && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="w-3 h-3" /> Đã từ chối
                </Badge>
              )}

              {/* Referral Letter Waiver Badge */}
              {isWaived && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                  <ShieldCheck className="w-3 h-3 text-violet-600" />
                  <span>Miễn GGT: {WAIVER_REASON_LABELS[p.waiverReason || 'ALREADY_EMPLOYED'] || 'Đã có việc'}</span>
                </span>
              )}
            </div>

            {/* Transfer Alert if applicable */}
            {p.status === 'TRANSFER_REQUESTED' && p.transferReason && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Lý do xin chuyển đơn vị thực tập:</span>
                </div>
                <p className="pl-5 font-medium">{p.transferReason}</p>
                {p.previousCompanyName && (
                  <p className="pl-5 text-[11px] text-amber-700">
                    Đơn vị cũ: <strong>{p.previousCompanyName}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
              <div>
                <span className="text-slate-400 block font-medium">Doanh nghiệp tiếp nhận:</span>
                <p className="font-semibold text-slate-900 text-[13px]">{p.companyName}</p>
                <p className="text-slate-500 mt-0.5">{p.companyAddress}</p>
                {p.companyTaxCode && (
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    MST: <span className="font-mono font-medium">{p.companyTaxCode}</span>
                  </p>
                )}
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Mentor Doanh nghiệp:</span>
                <p className="font-semibold text-slate-900">{p.mentorName}</p>
                <p className="text-slate-600">{p.mentorEmail}</p>
                <p className="text-slate-500">{p.mentorPhone}</p>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 block font-medium">Vị trí & Mô tả công việc:</span>
                <p className="font-semibold text-slate-900">{p.jobTitle}</p>
                <p className="text-slate-600 mt-0.5 line-clamp-2">{p.jobDescription}</p>
              </div>

              {/* Form 04 Facilities Checklist */}
              {(p.hasOfficeRoom !== undefined || p.hasComputer !== undefined) && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
                  <span className="text-slate-400 font-medium">CSVC theo Mẫu 04:</span>
                  <span className={`inline-flex items-center gap-1 ${p.hasOfficeRoom ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <Building2 className="w-3.5 h-3.5" />
                    {p.hasOfficeRoom ? 'Có phòng làm việc riêng' : 'Chưa bố trí phòng riêng'}
                  </span>
                  <span className={`inline-flex items-center gap-1 ${p.hasComputer ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <Monitor className="w-3.5 h-3.5" />
                    {p.hasComputer ? 'Có máy tính cá nhân' : 'SV tự trang bị máy tính'}
                  </span>
                  {(p.hoursPerDay || p.daysPerWeek) && (
                    <span className="text-slate-500">
                      ({p.hoursPerDay || 8}h/ngày, {p.daysPerWeek || 5} ngày/tuần)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Rejection Note */}
            {p.status === 'REJECTED' && p.rejectionReason && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                <span className="font-bold">Lý do đã từ chối: </span>
                <span>{p.rejectionReason}</span>
              </div>
            )}
          </div>

          {/* Right: Proof Links & Decision Buttons */}
          <div className="flex flex-col items-end gap-2.5 shrink-0 pt-2 lg:pt-0">
            {p.acceptanceLetterUrl && (
              <a
                href={p.acceptanceLetterUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-full font-semibold transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Xem Giấy tiếp nhận</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Alternative Proof Link for Referral Waiver */}
            {isWaived && p.alternativeProofUrl && (
              <a
                href={p.alternativeProofUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-full font-semibold transition"
              >
                <FileCheck className="w-3.5 h-3.5 text-violet-600" />
                <span>Minh chứng miễn GGT</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-auto">
              {p.status === 'PENDING_APPROVAL' && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onOpenRejectModal(p)}
                    disabled={isLoading}
                    className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Từ chối
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onApprove(p.id)}
                    isLoading={isLoading}
                    className="text-xs gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Duyệt tiếp nhận
                  </Button>
                </>
              )}

              {p.status === 'TRANSFER_REQUESTED' && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onOpenRejectModal(p)}
                    disabled={isLoading}
                    className="text-xs text-rose-700 cursor-pointer"
                  >
                    Từ chối đổi
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onApproveTransfer(p.id)}
                    isLoading={isLoading}
                    className="text-xs gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Duyệt đổi đơn vị
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
