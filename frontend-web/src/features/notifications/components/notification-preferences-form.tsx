"use client";
import { useState } from "react";
import type { NotificationPreferences } from "../types/preferences.types";
import { Failure } from "./notification-feedback";
const button =
  "rounded-lg bg-sky-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
export function NotificationPreferencesForm({
  initial,
  onSave,
  pending,
  error,
}: {
  initial: NotificationPreferences;
  onSave: (value: NotificationPreferences) => void;
  pending: boolean;
  error: unknown;
}) {
  const [value, setValue] = useState(initial);
  const choices: {
    key: keyof Omit<NotificationPreferences, "emailServiceEnabled">;
    label: string;
  }[] = [
    { key: "emailEnabled", label: "Nhận email thông báo" },
    { key: "workflowEmail", label: "Thay đổi hồ sơ, phê duyệt và phân công" },
    { key: "reminderEmail", label: "Nhắc thời hạn và công việc" },
    { key: "announcementEmail", label: "Tin tuyển dụng và thông báo chung" },
    { key: "systemEmail", label: "Thông báo hệ thống" },
  ];
  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(value);
      }}
    >
      {!initial.emailServiceEnabled && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Hệ thống chưa bật gửi email. Bạn vẫn nhận thông báo trong ứng dụng;
          tùy chọn được lưu cho khi dịch vụ email hoạt động.
        </p>
      )}
      {choices.map((choice) => (
        <label key={choice.key} className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={value[choice.key]}
            disabled={
              pending || (choice.key !== "emailEnabled" && !value.emailEnabled)
            }
            onChange={(event) =>
              setValue((current) => ({
                ...current,
                [choice.key]: event.target.checked,
              }))
            }
          />
          {choice.label}
        </label>
      ))}
      <p className="text-sm text-slate-500">
        Thông báo trong ứng dụng luôn được giữ để bạn theo dõi hồ sơ.
      </p>
      <button type="submit" className={button} disabled={pending}>
        {pending ? "Đang lưu…" : "Lưu tùy chọn email"}
      </button>
      <Failure error={error} />
    </form>
  );
}
