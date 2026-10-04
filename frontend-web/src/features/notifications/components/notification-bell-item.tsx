import Link from "next/link";
import { Clock, ExternalLink } from "lucide-react";
import type { Notification } from "../types/notification.types";
import {
  notificationAction,
  notificationInbox,
} from "../lib/notification-links";
import {
  formatTimeAgo,
  getNotificationVisuals,
} from "../lib/notification-presentation";
import { cn } from "@/lib/utils";
type Role = Parameters<typeof notificationInbox>[0];
export function NotificationBellItem({
  item,
  role,
  onRead,
  onClose,
}: {
  item: Notification;
  role: Role;
  onRead: (id: string) => void;
  onClose: () => void;
}) {
  const { icon: Icon, color } = getNotificationVisuals(item.notificationType);
  const target = notificationAction(
    item.actionUrl,
    role,
    item.notificationType,
  );
  const follow = () => {
    if (!item.isRead) onRead(item.id);
    onClose();
  };
  return (
    <li
      className={cn(
        "flex gap-3 p-3.5 text-left hover:bg-slate-50",
        !item.isRead && "bg-sky-50/40",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border",
          color,
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <h3
          className={cn(
            "text-xs leading-snug",
            !item.isRead ? "font-bold" : "font-semibold",
          )}
        >
          <Link href={target || notificationInbox(role)} onClick={follow}>
            {item.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-[11px] text-slate-600">
          {item.message}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="size-3" />
            {formatTimeAgo(item.createdAt)}
          </span>
          {target && (
            <Link
              href={target}
              onClick={follow}
              className="flex items-center text-sky-800"
            >
              Chi tiết
              <ExternalLink className="ml-1 size-3" />
            </Link>
          )}
          {!item.isRead && (
            <button
              type="button"
              onClick={() => onRead(item.id)}
              className="text-slate-600 underline"
            >
              Đã đọc
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
