"use client";

import { ATTENDANCE_NAMES, fieldClass } from "../../types";
import type { Attendance, JournalInput } from "../../types";

interface JournalAttendanceFieldsProps {
  value: JournalInput;
  editable: boolean;
  busy: boolean;
  working: boolean;
  onUpdate: (patch: Partial<JournalInput>) => void;
}

export function JournalAttendanceFields({
  value,
  editable,
  busy,
  working,
  onUpdate,
}: JournalAttendanceFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <label className="text-sm font-medium">
        Tình trạng tham gia
        <select
          className={`${fieldClass} mt-1`}
          value={value.attendance}
          disabled={!editable || busy}
          onChange={(e) =>
            onUpdate({ attendance: e.target.value as Attendance })
          }
        >
          {Object.entries(ATTENDANCE_NAMES).map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
      </label>

      {working && (
        <>
          <label className="text-sm font-medium">
            Bắt đầu
            <input
              type="time"
              className={`${fieldClass} mt-1`}
              value={value.startTime || ""}
              disabled={!editable || busy}
              onChange={(e) => onUpdate({ startTime: e.target.value })}
            />
          </label>
          <label className="text-sm font-medium">
            Kết thúc
            <input
              type="time"
              className={`${fieldClass} mt-1`}
              value={value.endTime || ""}
              disabled={!editable || busy}
              onChange={(e) => onUpdate({ endTime: e.target.value })}
            />
          </label>
          <label className="text-sm font-medium">
            Thời gian nghỉ (phút)
            <input
              type="number"
              min="0"
              max="720"
              className={`${fieldClass} mt-1`}
              value={value.breakMinutes}
              disabled={!editable || busy}
              onChange={(e) =>
                onUpdate({ breakMinutes: Number(e.target.value) })
              }
            />
          </label>
          <label className="text-sm font-medium">
            Số buổi
            <select
              className={`${fieldClass} mt-1`}
              value={value.sessions}
              disabled={!editable || busy}
              onChange={(e) =>
                onUpdate({ sessions: Number(e.target.value) })
              }
            >
              <option value="1">1 buổi</option>
              <option value="2">2 buổi</option>
            </select>
          </label>
        </>
      )}
    </div>
  );
}
