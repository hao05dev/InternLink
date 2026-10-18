'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FileCheck2, AlertCircle, ShieldAlert } from 'lucide-react';

const WAIVER_REASONS = [
  { value: 'ALREADY_EMPLOYED', label: 'Đang làm việc tại doanh nghiệp (Có HĐLĐ / HĐ thử việc)' },
  { value: 'OFFER_LETTER_ACCEPTED', label: 'Đã nhận Thư mời làm việc/thực tập chính thức (Offer Letter)' },
  { value: 'COMPANY_NOT_REQUIRED', label: 'Doanh nghiệp tuyển dụng trực tiếp và không yêu cầu Giấy giới thiệu' },
  { value: 'OTHER', label: 'Lý do ngoại lệ khác' },
];

interface PlacementReferralWaiverCardProps {
  hasReferralLetter: boolean;
  setHasReferralLetter: (v: boolean) => void;
  waiverReason: string;
  setWaiverReason: (v: string) => void;
  alternativeProofUrl: string;
  setAlternativeProofUrl: (v: string) => void;
}

export function PlacementReferralWaiverCard({
  hasReferralLetter,
  setHasReferralLetter,
  waiverReason,
  setWaiverReason,
  alternativeProofUrl,
  setAlternativeProofUrl,
}: PlacementReferralWaiverCardProps) {
  return (
    <div className={`p-4 rounded-2xl border transition-colors space-y-3 ${
      hasReferralLetter ? 'bg-slate-50 border-slate-200/80' : 'bg-amber-50/40 border-amber-200'
    }`}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
          <FileCheck2 className="w-3.5 h-3.5 text-sky-600" />
          <span>Tình trạng Giấy giới thiệu thực tập của Khoa</span>
        </h3>

        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="referralRadio"
              checked={hasReferralLetter}
              onChange={() => setHasReferralLetter(true)}
              className="text-sky-600 focus:ring-sky-500"
            />
            <span className="font-medium text-slate-700">Đã nhận Giấy giới thiệu</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="referralRadio"
              checked={!hasReferralLetter}
              onChange={() => setHasReferralLetter(false)}
              className="text-amber-600 focus:ring-amber-500"
            />
            <span className="font-bold text-amber-900">Không nhận / Đề nghị miễn</span>
          </label>
        </div>
      </div>

      {!hasReferralLetter && (
        <div className="space-y-3 pt-2 border-t border-amber-200/80">
          <div className="p-3 bg-amber-100/60 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Chế độ Ngoại lệ: Không nhận giấy giới thiệu của Khoa</p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Áp dụng cho sinh viên đã có việc làm tại doanh nghiệp hoặc được doanh nghiệp nhận trực tiếp không thông qua giấy giới thiệu. Bạn cần cung cấp lý do và <strong>tải lên văn bản minh chứng thay thế (Hợp đồng lao động, Offer letter)</strong> để Khoa thẩm định tính hợp lệ.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Lý do đề nghị miễn Giấy giới thiệu"
              id="waiverReason"
              value={waiverReason}
              onChange={(e) => setWaiverReason(e.target.value)}
              options={WAIVER_REASONS}
              required={!hasReferralLetter}
            />

            <Input
              label="Link văn bản minh chứng thay thế (Google Drive / Cloudinary)"
              id="alternativeProofUrl"
              value={alternativeProofUrl}
              onChange={(e) => setAlternativeProofUrl(e.target.value)}
              placeholder="https://drive.google.com/... (HĐLĐ / Offer Letter)"
              required={!hasReferralLetter}
            />
          </div>
        </div>
      )}
    </div>
  );
}
