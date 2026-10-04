"use client";
import { useState } from "react";
import type { DeliveryControls } from "../types/delivery.types";
export function EmailDeliveryControls({
  initial,
  pending,
  onSave,
}: {
  initial: DeliveryControls;
  pending: boolean;
  onSave: (paused: boolean, limit: number, reason: string) => void;
}) {
  const [paused, setPaused] = useState(initial.paused),
    [limit, setLimit] = useState(String(initial.dailyLimit)),
    [reason, setReason] = useState("");
  return (
    <form
      className="flex flex-wrap items-end gap-4 rounded-xl border bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = Number(limit);
        if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 2000)
          onSave(paused, parsed, reason);
      }}
    >
      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={paused}
          onChange={(event) => setPaused(event.target.checked)}
        />
        Tạm dừng gửi email
      </label>
      <label className="text-sm">
        Giới hạn lượt gửi / 24 giờ
        <input
          type="number"
          className="mt-1 block rounded border p-2"
          min={1}
          max={2000}
          required
          value={limit}
          onChange={(event) => setLimit(event.target.value)}
        />
      </label>
      <label className="text-sm">
        Lý do thay đổi
        <input
          className="mt-1 block rounded border p-2"
          required
          maxLength={500}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-sky-800 px-4 py-2 text-white disabled:opacity-50"
      >
        Lưu điều khiển
      </button>
    </form>
  );
}
