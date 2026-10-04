"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, RotateCw } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { notificationInbox } from "../lib/notification-links";
import { useNotificationBell } from "../hooks/use-notification-bell";
import { useNotificationStream } from "../hooks/use-notification-stream";
import { NotificationBellItem } from "./notification-bell-item";
export function NotificationCenter() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const container = useRef<HTMLDivElement>(null);
  const state = useNotificationBell(isAuthenticated ? user?.id : undefined);
  useNotificationStream(isAuthenticated ? user?.id : undefined);
  useEffect(() => setOpen(false), [user?.id]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  if (!isAuthenticated) return null;
  const items =
    filter === "unread"
      ? state.items.filter((item) => !item.isRead)
      : state.items;
  return (
    <div className="relative" ref={container}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Thông báo hệ thống, ${state.totalUnread} chưa đọc`}
        className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100"
        onClick={() => {
          if (!open) void state.load();
          setOpen((value) => !value);
        }}
      >
        <Bell className="size-5" />
        {state.totalUnread > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-rose-600 px-1.5 text-xs text-white">
            {state.totalUnread > 99 ? "99+" : state.totalUnread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
            <span className="text-sm font-bold">Thông báo</span>
            <button
              type="button"
              title="Làm mới"
              aria-label="Làm mới"
              disabled={state.loading}
              onClick={() => void state.load()}
            >
              <RotateCw className="size-4" />
            </button>
            {state.totalUnread > 0 && (
              <button
                type="button"
                disabled={state.markingAll}
                onClick={() => void state.markAll()}
                className="flex gap-1 text-xs text-sky-800"
              >
                <CheckCheck className="size-4" />
                Đã đọc hết
              </button>
            )}
          </div>
          <div className="flex gap-3 border-b px-4 py-2 text-xs">
            <button
              type="button"
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
            >
              Tất cả ({state.items.length})
            </button>
            <button
              type="button"
              aria-pressed={filter === "unread"}
              onClick={() => setFilter("unread")}
            >
              Chưa đọc ({state.totalUnread})
            </button>
          </div>
          <Link
            href={notificationInbox(user?.role)}
            onClick={() => setOpen(false)}
            className="block border-b px-4 py-2 text-xs text-sky-800"
          >
            Xem toàn bộ thông báo và tùy chọn email
          </Link>
          {state.error && (
            <p role="alert" className="p-3 text-sm text-rose-700">
              {state.error}
            </p>
          )}
          <ul className="max-h-[22rem] overflow-y-auto divide-y">
            {items.map((item) => (
              <NotificationBellItem
                key={item.id}
                item={item}
                role={user?.role}
                onRead={(id) => void state.markRead(id)}
                onClose={() => setOpen(false)}
              />
            ))}
            {items.length === 0 && (
              <li className="p-8 text-center text-sm text-slate-500">
                {filter === "unread"
                  ? "Không có thông báo chưa đọc"
                  : "Chưa có thông báo nào"}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
