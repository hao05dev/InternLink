"use client";
import { useNotificationInbox } from "../hooks/use-notification-inbox";
import Link from "next/link";

import { notificationAction } from "../lib/notification-links";
import { NotificationPreferencesForm } from "./notification-preferences-form";
import { Failure } from "./notification-feedback";

const secondary = "rounded-lg border px-3 py-2 text-sm disabled:opacity-50";
const createdAtFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});
const deliveryLabels: Record<string, string> = {
  QUEUED: "Email đang chờ gửi",
  PENDING: "Email đang chờ gửi",
  SENT: "Đã chuyển email đến nhà cung cấp",
  RETRY: "Email đang chờ thử lại",
  FAILED: "Email gửi thất bại",
  UNKNOWN: "Email cần kiểm tra trạng thái",
  SKIPPED: "Email được bỏ qua theo tùy chọn",
  DISABLED: "Email chưa được bật",
  SEPARATE_NOTICE: "Email thuộc lượt gửi riêng",
  DUPLICATE: "Email đã có trong hàng đợi",
};
export function NotificationInboxView() {
  const {
    user,
    page,
    setPage,
    unread,
    setUnread,
    inbox,
    preferences,
    mark,
    markAll,
    save,
  } = useNotificationInbox();
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <header>
        <h1 className="text-2xl font-bold">Thông báo của bạn</h1>
        <p className="mt-2 text-slate-600">
          Theo dõi cập nhật và công việc trong phạm vi hồ sơ của bạn.
        </p>
      </header>
      <section className="rounded-xl border bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={unread}
              onChange={(event) => {
                setUnread(event.target.checked);
                setPage(0);
              }}
            />
            Chỉ hiện chưa đọc
          </label>
          <span className="text-sm">
            {inbox.data?.unreadCount ?? 0} thông báo chưa đọc
          </span>
          <button
            type="button"
            className={secondary}
            disabled={!inbox.data?.unreadCount || markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>
        <Failure error={inbox.error ?? mark.error ?? markAll.error} />
        {inbox.isPending && <p>Đang tải thông báo…</p>}
        {inbox.data?.items.length === 0 && (
          <p className="py-5 text-slate-500">
            Chưa có thông báo trong danh sách này.
          </p>
        )}
        <ul className="divide-y">
          {inbox.data?.items.map((item) => {
            const link = notificationAction(
              item.actionUrl,
              user?.role,
              item.notificationType,
            );
            return (
              <li
                key={item.id}
                className={
                  "space-y-2 p-4 " + (item.isRead ? "" : "rounded-lg bg-sky-50")
                }
              >
                <h2 className="font-semibold">{item.title}</h2>
                <p className="whitespace-pre-line text-sm text-slate-700">
                  {item.message}
                </p>
                <p className="text-xs text-slate-500">
                  {createdAtFormatter.format(new Date(item.createdAt))}
                  {item.deliveryStatus?.email &&
                    " · " + (deliveryLabels[item.deliveryStatus.email] ?? "")}
                </p>
                <div className="flex flex-wrap gap-3">
                  {link && (
                    <Link
                      className="text-sm font-semibold text-sky-800"
                      href={link}
                      onClick={() => {
                        if (!item.isRead) mark.mutate(item.id);
                      }}
                    >
                      Xem chi tiết
                    </Link>
                  )}
                  {!item.isRead && (
                    <button
                      type="button"
                      className="text-sm text-slate-600 underline"
                      disabled={mark.isPending}
                      onClick={() => mark.mutate(item.id)}
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between">
          <button
            type="button"
            className={secondary}
            disabled={page === 0 || inbox.isFetching}
            onClick={() => setPage((current) => current - 1)}
          >
            Trang trước
          </button>
          <span className="text-sm">
            Trang {page + 1}/{Math.max(1, inbox.data?.totalPages ?? 1)}
          </span>
          <button
            type="button"
            className={secondary}
            disabled={
              !inbox.data ||
              page + 1 >= inbox.data.totalPages ||
              inbox.isFetching
            }
            onClick={() => setPage((current) => current + 1)}
          >
            Trang sau
          </button>
        </div>
      </section>
      <section className="rounded-xl border bg-white p-5 space-y-4">
        <h2 className="text-lg font-semibold">Tùy chọn nhận email</h2>
        <Failure error={preferences.error} />
        {preferences.data && (
          <NotificationPreferencesForm
            key={user?.id}
            initial={preferences.data}
            onSave={(value) => save.mutate(value)}
            pending={save.isPending}
            error={save.error}
          />
        )}
        {save.isSuccess && (
          <p role="status" className="text-sm text-emerald-800">
            Đã lưu tùy chọn.
          </p>
        )}
      </section>
    </main>
  );
}
