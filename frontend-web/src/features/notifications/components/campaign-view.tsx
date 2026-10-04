"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignService } from "../services/campaign.service";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { CampaignCreateForm } from "./campaign-create-form";
export function CampaignView() {
  const cache = useQueryClient();
  const { user } = useAuth();
  const [page, setPage] = useState(0),
    [id, setId] = useState(""),
    [recipientPage, setRecipientPage] = useState(0);
  useEffect(() => {
    setId("");
    setPage(0);
    setRecipientPage(0);
  }, [user?.id]);
  const list = useQuery({
    queryKey: ["campaigns", user?.id, page],
    queryFn: () => campaignService.page(page),
    refetchInterval: 10000,
  });
  const detail = useQuery({
    queryKey: ["campaign", user?.id, id, recipientPage],
    queryFn: () => campaignService.detail(id, recipientPage),
    enabled: !!id,
    refetchInterval: 10000,
  });
  const action = useMutation({
    mutationFn: async (operation: () => Promise<unknown>) => operation(),
    onSuccess: () => {
      void cache.invalidateQueries({ queryKey: ["campaigns", user?.id] });
      void cache.invalidateQueries({ queryKey: ["campaign", user?.id, id] });
    },
  });
  return (
    <main className="mx-auto max-w-6xl space-y-5 p-6">
      <h1 className="text-2xl font-bold">Gửi thông báo theo đợt</h1>
      <CampaignCreateForm
        key={user?.id}
        onCreated={(result) => {
          setId(result.campaign.id);
          setRecipientPage(0);
          void cache.invalidateQueries({ queryKey: ["campaigns", user?.id] });
        }}
      />
      <section className="space-y-3 rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Các đợt gửi</h2>
        {list.data?.items.map((row) => (
          <button
            type="button"
            key={row.id}
            className="block w-full rounded border p-3 text-left"
            onClick={() => {
              setId(row.id);
              setRecipientPage(0);
            }}
          >
            {row.subject} · {row.status} · {row.channel}
          </button>
        ))}
        {list.data?.items.length === 0 && <p>Chưa có đợt gửi.</p>}
        <div className="flex justify-between">
          <button
            disabled={page === 0}
            onClick={() => setPage((value) => value - 1)}
          >
            Trang trước
          </button>
          <span>Trang {page + 1}</span>
          <button
            disabled={!list.data || page + 1 >= list.data.totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Trang sau
          </button>
        </div>
      </section>
      {detail.data && (
        <section className="space-y-4 rounded-xl border bg-white p-5">
          <h2 className="text-lg font-semibold">
            {detail.data.campaign.subject}
          </h2>
          <p>
            {detail.data.campaign.status} · {detail.data.totalRecipients} người
            nhận
          </p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(detail.data.campaign.counts).map(([key, count]) => (
              <span key={key}>
                {key}: {count}
              </span>
            ))}
          </div>
          <p className="text-sm text-slate-500">
            QUEUED thể hiện đã xử lý người nhận. Cột email hiển thị kết quả gửi
            riêng; hủy đợt chỉ dừng người chưa xử lý.
          </p>
          {detail.data.campaign.status === "RUNNING" && (
            <button
              className="text-rose-700 underline"
              disabled={action.isPending}
              onClick={() => action.mutate(() => campaignService.cancel(id))}
            >
              Dừng đợt gửi
            </button>
          )}
          {detail.data.campaign.status === "COMPLETED" &&
            !!detail.data.campaign.counts.FAILED && (
              <button
                className="text-sky-800 underline"
                disabled={action.isPending}
                onClick={() => action.mutate(() => campaignService.retry(id))}
              >
                Thử lại người nhận lỗi xử lý
              </button>
            )}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th>Người nhận</th>
                  <th>Xử lý</th>
                  <th>Email</th>
                  <th>Lỗi</th>
                </tr>
              </thead>
              <tbody>
                {detail.data.recipients.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-2">
                      {row.displayName} · {row.email}
                    </td>
                    <td>{row.status}</td>
                    <td>{row.emailStatus ?? "Không xếp hàng email"}</td>
                    <td>{row.errorCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between">
            <button
              disabled={recipientPage === 0}
              onClick={() => setRecipientPage((value) => value - 1)}
            >
              Người nhận trước
            </button>
            <span>Trang {recipientPage + 1}</span>
            <button
              disabled={recipientPage + 1 >= detail.data.totalPages}
              onClick={() => setRecipientPage((value) => value + 1)}
            >
              Người nhận sau
            </button>
          </div>
        </section>
      )}
      {(list.error ?? detail.error ?? action.error) && (
        <p role="alert" className="text-rose-700">
          {(list.error ?? detail.error ?? action.error)?.message}
        </p>
      )}
    </main>
  );
}
