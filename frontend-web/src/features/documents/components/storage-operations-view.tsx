"use client";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storageService } from "../services/storage.service";
const formatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});
export function StorageOperationsView() {
  const cache = useQueryClient();
  const [cursor, setCursor] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [reason, setReason] = useState(""),
    [confirmed, setConfirmed] = useState(false);
  const selectedKeys = useMemo(() => new Set(selected), [selected]);
  const capabilities = useQuery({
    queryKey: ["storage-capabilities"],
    queryFn: storageService.capabilities,
  });
  const orphans = useQuery({
    queryKey: ["storage-orphans", cursor],
    queryFn: () => storageService.orphans(cursor),
    enabled: capabilities.data?.provider === "R2",
  });
  const purge = useMutation({
    mutationFn: () => storageService.purge(selected, reason),
    onSuccess: () => {
      setSelected([]);
      setReason("");
      setConfirmed(false);
      void cache.invalidateQueries({ queryKey: ["storage-orphans"] });
    },
  });
  return (
    <main className="mx-auto max-w-6xl space-y-5 p-6">
      <h1 className="text-2xl font-bold">Vận hành lưu trữ</h1>
      {capabilities.data && (
        <p className="rounded-xl border bg-white p-4">
          Provider: {capabilities.data.provider} · Upload trực tiếp:{" "}
          {capabilities.data.directUpload ? "Bật" : "Tắt"} · Quét mã độc:{" "}
          {capabilities.data.scanningEnabled ? "Bật" : "Tắt"} · Tối đa{" "}
          {Math.round(capabilities.data.maxBytes / 1024 / 1024)} MiB
        </p>
      )}
      {capabilities.data?.provider !== "R2" && (
        <p>Cấu hình R2 ở backend để sử dụng chức năng đối soát.</p>
      )}
      {orphans.data && (
        <section className="space-y-4 rounded-xl border bg-white p-5">
          <h2 className="text-lg font-semibold">
            Object không được tham chiếu
          </h2>
          <p className="text-sm text-slate-500">
            Chỉ hiện object cũ hơn 24 giờ và chưa được tài liệu, bản ký hoặc
            upload đang chờ tham chiếu. Backend kiểm tra lại trước khi xóa.
          </p>
          <ul className="divide-y">
            {orphans.data.items.map((row) => (
              <li key={row.key} className="flex gap-3 py-3 text-sm">
                <input
                  type="checkbox"
                  aria-label={"Chọn " + row.key}
                  checked={selectedKeys.has(row.key)}
                  onChange={(event) =>
                    setSelected((keys) =>
                      event.target.checked
                        ? [...keys, row.key]
                        : keys.filter((key) => key !== row.key),
                    )
                  }
                />
                <span className="break-all">
                  {row.key}
                  <br />
                  {row.size} byte · {formatter.format(new Date(row.modified))}
                </span>
              </li>
            ))}
          </ul>
          {orphans.data.items.length === 0 && (
            <p>Không có object mồ côi trong trang này.</p>
          )}
          <div className="flex gap-4">
            <button
              disabled={!cursor}
              onClick={() => {
                setCursor("");
                setSelected([]);
                setConfirmed(false);
              }}
            >
              Về đầu
            </button>
            <button
              disabled={!orphans.data.nextToken}
              onClick={() => {
                setCursor(orphans.data!.nextToken!);
                setSelected([]);
                setConfirmed(false);
              }}
            >
              Trang tiếp
            </button>
          </div>
          <label className="block">
            Lý do xóa
            <input
              className="ml-3 rounded border p-2"
              value={reason}
              maxLength={500}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            Tôi đã đối soát danh sách và xác nhận xóa các object đã chọn.
          </label>
          <button
            className="rounded bg-rose-700 px-4 py-2 text-white disabled:opacity-50"
            disabled={
              !selected.length ||
              selected.length > 50 ||
              !reason.trim() ||
              !confirmed ||
              purge.isPending
            }
            onClick={() => purge.mutate()}
          >
            Xóa {selected.length} object
          </button>
          {purge.isSuccess && <p role="status">Đã xóa các object được chọn.</p>}
          <h2 className="text-lg font-semibold">
            Upload bị từ chối / hết hạn gần đây
          </h2>
          <ul className="text-sm">
            {orphans.data.failures.map((row) => (
              <li key={row.id}>
                {row.id} · {row.status} · {row.error_code ?? "—"}
              </li>
            ))}
          </ul>
        </section>
      )}
      {(capabilities.error ?? orphans.error ?? purge.error) && (
        <p role="alert" className="text-rose-700">
          {(capabilities.error ?? orphans.error ?? purge.error)?.message}
        </p>
      )}
    </main>
  );
}
