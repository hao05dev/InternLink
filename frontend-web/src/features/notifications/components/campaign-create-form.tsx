"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { campaignService } from "../services/campaign.service";
import type { CampaignRequest, CampaignDetail } from "../types/campaign.types";
export function CampaignCreateForm({
  onCreated,
}: {
  onCreated: (detail: CampaignDetail) => void;
}) {
  const { user } = useAuth();
  const [department, setDepartment] = useState(user?.departmentId ?? "");
  const [draft, setDraft] = useState({
    termId: "",
    purpose: "GENERAL",
    audience: "ALL_STUDENTS",
    subject: "",
    body: "",
    channel: "BOTH",
  });
  const [request, setRequest] = useState<CampaignRequest | null>(null);
  const departments = useQuery({
    queryKey: ["campaign-departments", user?.id],
    queryFn: async () =>
      (
        await apiClient.get<{ id: string; name: string }[]>(
          "/api/v1/departments",
        )
      ).data,
    enabled: user?.role === "ADMIN",
  });
  const terms = useQuery({
    queryKey: ["campaign-terms", department],
    queryFn: async () =>
      (
        await apiClient.get<{ id: string; termName: string; status: string }[]>(
          `/api/v1/terms/by-department/${department}`,
        )
      ).data,
    enabled: !!department,
  });
  const preview = useMutation({ mutationFn: campaignService.preview });
  const create = useMutation({
    mutationFn: campaignService.create,
    onSuccess: onCreated,
  });
  const edit = (key: keyof typeof draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setRequest(null);
    preview.reset();
    create.reset();
  };
  const input = "block w-full rounded border p-2";
  return (
    <section className="space-y-4 rounded-xl border bg-white p-5">
      <h2 className="text-lg font-semibold">Soạn thông báo theo kỳ</h2>
      {user?.role === "ADMIN" && (
        <label>
          Khoa
          <select
            className={input}
            value={department}
            onChange={(event) => {
              setDepartment(event.target.value);
              edit("termId", "");
            }}
          >
            <option value="">Chọn khoa</option>
            {departments.data?.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        Kỳ thực tập
        <select
          className={input}
          value={draft.termId}
          onChange={(event) => edit("termId", event.target.value)}
        >
          <option value="">Chọn kỳ</option>
          {terms.data
            ?.filter((row) => row.status !== "CLOSED")
            .map((row) => (
              <option key={row.id} value={row.id}>
                {row.termName}
              </option>
            ))}
        </select>
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        <label>
          Mục đích
          <select
            className={input}
            value={draft.purpose}
            onChange={(event) => {
              edit("purpose", event.target.value);
              if (event.target.value !== "GENERAL")
                edit(
                  "audience",
                  event.target.value === "INELIGIBLE"
                    ? "INELIGIBLE"
                    : "ELIGIBLE",
                );
            }}
          >
            <option value="GENERAL">Thông báo chung</option>
            <option value="INTRODUCTION_LETTER">Nhận giấy giới thiệu</option>
            <option value="INELIGIBLE">Chưa đủ điều kiện</option>
          </select>
        </label>
        <label>
          Người nhận
          <select
            className={input}
            value={draft.audience}
            onChange={(event) => edit("audience", event.target.value)}
          >
            {(draft.purpose === "GENERAL"
              ? [
                  "ALL_STUDENTS",
                  "ELIGIBLE",
                  "INELIGIBLE",
                  "MENTORS",
                  "LECTURERS",
                  "COMPANY_REPS",
                  "FACULTY_ADMINS",
                  ...(user?.role === "ADMIN" ? ["ADMINS"] : []),
                ]
              : [draft.purpose === "INELIGIBLE" ? "INELIGIBLE" : "ELIGIBLE"]
            ).map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Kênh
          <select
            className={input}
            value={draft.channel}
            onChange={(event) => edit("channel", event.target.value)}
          >
            <option value="BOTH">Ứng dụng và email</option>
            <option value="IN_APP">Ứng dụng</option>
            <option value="EMAIL">Email</option>
          </select>
        </label>
      </div>
      <label className="block">
        Tiêu đề
        <input
          required
          maxLength={255}
          className={input}
          value={draft.subject}
          onChange={(event) => edit("subject", event.target.value)}
        />
      </label>
      <label className="block">
        Nội dung
        <textarea
          required
          maxLength={20000}
          rows={5}
          className={input}
          value={draft.body}
          onChange={(event) => edit("body", event.target.value)}
        />
      </label>
      <p className="text-sm text-slate-500">
        Có thể dùng {"{{studentName}}"}, {"{{studentCode}}"}, {"{{termName}}"}.
        Email tuân theo tùy chọn của từng tài khoản.
      </p>
      <button
        type="button"
        className="rounded border px-4 py-2"
        disabled={
          !draft.termId ||
          !draft.subject.trim() ||
          !draft.body.trim() ||
          preview.isPending ||
          create.isPending
        }
        onClick={() => {
          const value = { ...draft, requestKey: crypto.randomUUID() };
          setRequest(value);
          preview.mutate(value);
        }}
      >
        Xem trước người nhận
      </button>
      {preview.data && request && (
        <div className="space-y-2 rounded bg-sky-50 p-4">
          <p>
            {preview.data.total} người nhận · {preview.data.withAccount} có tài
            khoản · {preview.data.emailEligible} cho phép email (dịch vụ email
            cần được bật)
          </p>
          <ul className="max-h-40 overflow-auto text-sm">
            {preview.data.sample.map((row) => (
              <li key={row.email}>
                {row.displayName} · {row.studentCode} · {row.email}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="rounded bg-sky-800 px-4 py-2 text-white disabled:opacity-50"
            disabled={
              preview.data.total === 0 || create.isPending || create.isSuccess
            }
            onClick={() => create.mutate(request)}
          >
            Tạo đợt gửi
          </button>
        </div>
      )}
      {(preview.error ?? create.error ?? terms.error ?? departments.error) && (
        <p role="alert" className="text-rose-700">
          {
            (preview.error ?? create.error ?? terms.error ?? departments.error)
              ?.message
          }
        </p>
      )}
    </section>
  );
}
