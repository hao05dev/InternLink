"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deliveryService } from "../services/delivery.service";
import { EmailDeliveryControls } from "./email-delivery-controls";
export function EmailDeliveryView() {
  const cache = useQueryClient();
  const [status, setStatus] = useState(""),
    [page, setPage] = useState(0),
    [reason, setReason] = useState(""),
    [confirmed, setConfirmed] = useState(false);
  const summary = useQuery({
    queryKey: ["email-delivery-summary"],
    queryFn: deliveryService.summary,
    refetchInterval: 15000,
  });
  const deliveries = useQuery({
    queryKey: ["email-deliveries", status, page],
    queryFn: () => deliveryService.page(status, page),
    refetchInterval: 15000,
  });
  const change = useMutation({
    mutationFn: async (action: () => Promise<unknown>) => action(),
    onSuccess: () => {
      void cache.invalidateQueries({ queryKey: ["email-delivery-summary"] });
      void cache.invalidateQueries({ queryKey: ["email-deliveries"] });
      setReason("");
      setConfirmed(false);
    },
  });
  const error = summary.error ?? deliveries.error ?? change.error;
  return (
    <main className="mx-auto max-w-6xl space-y-5 p-6">
      <header>
        <h1 className="text-2xl font-bold">Vận hành email</h1>
        <p className="mt-2 text-sm text-slate-600">
          SENT nghĩa là nhà cung cấp đã chấp nhận. UNKNOWN cần đối soát trước
          khi gửi lại.
        </p>
      </header>
      {error && (
        <p role="alert" className="text-rose-700">
          {error.message}
        </p>
      )}
      {summary.data && (
        <>
          <p className="rounded-xl bg-slate-100 p-4 text-sm">
            {summary.data.enabled ? "Đang bật" : "Chưa bật"} ·{" "}
            {summary.data.provider} · Đã đặt{" "}
            {summary.data.controls.usedLast24Hours}/
            {summary.data.controls.dailyLimit} lượt gửi trong 24 giờ gần nhất
          </p>
          {summary.data.metrics && (
            <p className="text-sm text-slate-600">
              Thư chờ lâu nhất:{" "}
              {summary.data.metrics.oldestPendingSeconds == null
                ? "Không có"
                : Math.round(summary.data.metrics.oldestPendingSeconds / 60) +
                  " phút"}{" "}
              · Thời gian chấp nhận trung bình trong 24 giờ:{" "}
              {summary.data.metrics.averageAcceptanceSeconds24Hours == null
                ? "Chưa có dữ liệu"
                : Math.round(
                    summary.data.metrics.averageAcceptanceSeconds24Hours,
                  ) + " giây"}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.data.counts).map(([key, value]) => (
              <span
                key={key}
                className="rounded-lg border bg-white p-3 text-sm"
              >
                {key}: {value}
              </span>
            ))}
          </div>
          <EmailDeliveryControls
            key={
              String(summary.data.controls.paused) +
              ":" +
              summary.data.controls.dailyLimit
            }
            initial={summary.data.controls}
            pending={change.isPending}
            onSave={(paused, limit, note) =>
              change.mutate(() => deliveryService.controls(paused, limit, note))
            }
          />
        </>
      )}
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <label className="text-sm">
          Trạng thái{" "}
          <select
            className="rounded border p-2"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
          >
            {[
              "",
              "PENDING",
              "SENDING",
              "SENT",
              "RETRY",
              "FAILED",
              "UNKNOWN",
              "SKIPPED",
            ].map((value) => (
              <option key={value} value={value}>
                {value || "Tất cả"}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Lý do gửi lại / hủy
          <input
            className="ml-2 rounded border p-2"
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        <label className="flex gap-2 text-sm">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          />
          Tôi đã kiểm tra hộp thư đã gửi và xác nhận thư UNKNOWN chưa được chấp
          nhận.
        </label>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th>Người nhận / tiêu đề</th>
                <th>Trạng thái</th>
                <th>Lượt thử</th>
                <th>Lỗi / mã nhà cung cấp</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.data?.items.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="py-3">
                    {row.recipient}
                    <br />
                    {row.subject}
                  </td>
                  <td>{row.status}</td>
                  <td>{row.attempts}</td>
                  <td>
                    {row.errorCode ?? "—"}
                    <br />
                    {row.providerMessageId}
                  </td>
                  <td>
                    {["FAILED", "UNKNOWN"].includes(row.status) && (
                      <button
                        type="button"
                        className="mr-3 text-sky-800 underline"
                        disabled={
                          change.isPending ||
                          !reason.trim() ||
                          (row.status === "UNKNOWN" && !confirmed)
                        }
                        onClick={() =>
                          change.mutate(() =>
                            deliveryService.retry(row.id, reason, confirmed),
                          )
                        }
                      >
                        Gửi lại
                      </button>
                    )}
                    {["PENDING", "RETRY", "FAILED", "UNKNOWN"].includes(
                      row.status,
                    ) && (
                      <button
                        type="button"
                        className="text-rose-700 underline"
                        disabled={change.isPending || !reason.trim()}
                        onClick={() =>
                          change.mutate(() =>
                            deliveryService.cancel(row.id, reason),
                          )
                        }
                      >
                        Hủy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {deliveries.isPending && <p>Đang tải hàng đợi…</p>}
        {deliveries.data?.items.length === 0 && (
          <p>Không có email trong danh sách này.</p>
        )}
        <div className="flex justify-between">
          <button
            disabled={page === 0}
            onClick={() => setPage((value) => value - 1)}
          >
            Trang trước
          </button>
          <span>
            Trang {page + 1}/{Math.max(1, deliveries.data?.totalPages ?? 1)}
          </span>
          <button
            disabled={
              !deliveries.data || page + 1 >= deliveries.data.totalPages
            }
            onClick={() => setPage((value) => value + 1)}
          >
            Trang sau
          </button>
        </div>
      </section>
    </main>
  );
}
