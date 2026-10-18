'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/features/workflow/components/status-badge';
import { GraduationCap, FileText } from 'lucide-react';
import type { InternshipPlacement } from '@/features/placements/types/placement.types';

interface LecturerStudentSelectorCardProps {
  students: InternshipPlacement[];
  selectedPlacementId: string;
  onSelectStudent: (id: string) => void;
  currentStudent?: InternshipPlacement;
}

export function LecturerStudentSelectorCard({
  students,
  selectedPlacementId,
  onSelectStudent,
  currentStudent,
}: LecturerStudentSelectorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-sky-600" />
          <span>Thông tin Sinh viên & Học phần Thực tập</span>
        </CardTitle>
        <CardDescription>Chọn sinh viên cần đánh giá và xem báo cáo kết quả thực tập M-TT-05</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          label="Chọn sinh viên hướng dẫn"
          id="studentSelect"
          value={selectedPlacementId}
          onChange={(e) => onSelectStudent(e.target.value)}
          options={students.map((s) => ({
            value: s.id,
            label: `${s.studentName} (${s.studentCode || 'N/A'}) - ${s.companyName}`,
          }))}
          required
        />

        {currentStudent && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{currentStudent.studentName}</span>
                <span className="font-mono text-slate-500">MSSV: {currentStudent.studentCode || 'Chưa cập nhật'}</span>
                <StatusBadge status={currentStudent.status} />
              </div>
              <p className="text-slate-600">
                Đơn vị thực tập: <strong className="text-slate-800">{currentStudent.companyName}</strong>
                {currentStudent.jobTitle ? ` · Vị trí: ${currentStudent.jobTitle}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/lecturer/internship-record?placementId=${currentStudent.id}`}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs bg-white cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Xem báo cáo M-TT-05</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
