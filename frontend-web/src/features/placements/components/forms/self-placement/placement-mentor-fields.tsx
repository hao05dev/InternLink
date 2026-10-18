'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { UserCheck } from 'lucide-react';

interface PlacementMentorFieldsProps {
  mentorName: string;
  setMentorName: (v: string) => void;
  mentorEmail: string;
  setMentorEmail: (v: string) => void;
  mentorPhone: string;
  setMentorPhone: (v: string) => void;
}

export function PlacementMentorFields({
  mentorName,
  setMentorName,
  mentorEmail,
  setMentorEmail,
  mentorPhone,
  setMentorPhone,
}: PlacementMentorFieldsProps) {
  return (
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
  );
}
