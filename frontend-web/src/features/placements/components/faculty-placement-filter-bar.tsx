'use client';

import React from 'react';
import { Select } from '@/components/ui/select';
import { Search } from 'lucide-react';

export interface FacultyPlacementFilterBarProps {
  terms: Array<{ id: string; code: string; termName: string }>;
  selectedTermId: string;
  onSelectTerm: (id: string) => void;
  statusFilter: 'ALL' | 'PENDING_APPROVAL' | 'TRANSFER_REQUESTED' | 'APPROVED' | 'REJECTED';
  onSelectStatus: (status: 'ALL' | 'PENDING_APPROVAL' | 'TRANSFER_REQUESTED' | 'APPROVED' | 'REJECTED') => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
}

export function FacultyPlacementFilterBar({
  terms,
  selectedTermId,
  onSelectTerm,
  statusFilter,
  onSelectStatus,
  searchKeyword,
  onSearchChange,
}: FacultyPlacementFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {terms.length > 0 && (
          <div className="w-56">
            <Select
              label=""
              id="termSelectFilter"
              value={selectedTermId}
              onChange={(e) => onSelectTerm(e.target.value)}
              options={terms.map((t) => ({
                value: t.id,
                label: `${t.code} (${t.termName})`,
              }))}
            />
          </div>
        )}

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => onSelectStatus('PENDING_APPROVAL')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer ${
              statusFilter === 'PENDING_APPROVAL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Chờ duyệt
          </button>
          <button
            type="button"
            onClick={() => onSelectStatus('TRANSFER_REQUESTED')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer ${
              statusFilter === 'TRANSFER_REQUESTED' ? 'bg-white text-amber-800 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Xin đổi cty
          </button>
          <button
            type="button"
            onClick={() => onSelectStatus('APPROVED')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer ${
              statusFilter === 'APPROVED' ? 'bg-white text-emerald-800 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Đã duyệt
          </button>
          <button
            type="button"
            onClick={() => onSelectStatus('ALL')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
        </div>
      </div>

      <div className="relative w-full sm:w-64">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo SV, MSSV, Công ty..."
          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />
      </div>
    </div>
  );
}
