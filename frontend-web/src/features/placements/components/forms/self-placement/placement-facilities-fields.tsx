'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Monitor, FileDown, CheckCircle2 } from 'lucide-react';

interface PlacementFacilitiesFieldsProps {
  hasOfficeRoom: boolean;
  setHasOfficeRoom: (v: boolean) => void;
  hasComputer: boolean;
  setHasComputer: (v: boolean) => void;
  hoursPerDay: number;
  setHoursPerDay: (v: number) => void;
  daysPerWeek: number;
  setDaysPerWeek: (v: number) => void;
  onExportForm04?: () => void;
}

export function PlacementFacilitiesFields({
  hasOfficeRoom,
  setHasOfficeRoom,
  hasComputer,
  setHasComputer,
  hoursPerDay,
  setHoursPerDay,
  daysPerWeek,
  setDaysPerWeek,
  onExportForm04,
}: PlacementFacilitiesFieldsProps) {
  const totalHours = hoursPerDay * daysPerWeek;
  const isSatisfied = totalHours >= 24;

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
          <Monitor className="w-3.5 h-3.5 text-sky-600" />
          <span>Điều kiện tiếp nhận & Thời lượng làm việc (Theo Biểu mẫu 04)</span>
        </h3>

        {onExportForm04 && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onExportForm04}
            className="text-xs gap-1.5 bg-white cursor-pointer self-start sm:self-auto"
          >
            <FileDown className="w-3.5 h-3.5 text-sky-600" />
            <span>Tải trước Phiếu tiếp nhận SV (Mẫu 04)</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2">
          <p className="font-semibold text-slate-700">Điều kiện cơ sở vật chất cơ quan cung cấp:</p>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasOfficeRoom}
                onChange={(e) => setHasOfficeRoom(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>Phòng làm việc</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasComputer}
                onChange={(e) => setHasComputer(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>Máy tính làm việc</span>
            </label>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-700">Thời gian làm việc dự kiến:</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isSatisfied ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {totalHours} giờ / tuần (Quy định &ge; 24h)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Số giờ / ngày"
              id="hoursPerDay"
              type="number"
              min="1"
              max="12"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              required
            />
            <Input
              label="Số ngày / tuần"
              id="daysPerWeek"
              type="number"
              min="1"
              max="7"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Number(e.target.value))}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}
