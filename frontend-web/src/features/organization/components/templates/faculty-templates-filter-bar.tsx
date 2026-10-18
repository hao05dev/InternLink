'use client';

import React from 'react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Upload, Filter } from 'lucide-react';

interface FacultyTemplatesFilterBarProps {
  terms: Array<{ id: string; code: string; termName: string }>;
  selectedTermId: string;
  onSelectTerm: (id: string) => void;
  onOpenUploadModal: () => void;
}

export function FacultyTemplatesFilterBar({
  terms,
  selectedTermId,
  onSelectTerm,
  onOpenUploadModal,
}: FacultyTemplatesFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <Select
            label="Học kỳ thực tập"
            id="termSelectFilter"
            value={selectedTermId}
            onChange={(e) => onSelectTerm(e.target.value)}
            options={terms.map((t) => ({
              value: t.id,
              label: `${t.code} (${t.termName})`,
            }))}
          />
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={onOpenUploadModal}
        className="gap-2 text-xs self-start sm:self-auto cursor-pointer"
      >
        <Upload className="w-4 h-4" />
        <span>Tải Lên Biểu Mẫu Mới (Cloudflare R2)</span>
      </Button>
    </div>
  );
}
