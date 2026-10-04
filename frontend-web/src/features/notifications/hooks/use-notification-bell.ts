"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { notificationService } from "../services/notification.service";
import type { Notification } from "../types/notification.types";
export function useNotificationBell(userId?: string) {
  const [items, setItems] = useState<Notification[]>([]);
  const [dataOwner, setDataOwner] = useState<string>();
  const [totalUnread, setTotalUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");
  const version = useRef(0);
  const session = useRef(0);
  const marking = useRef(new Map<string, number>());
  const load = useCallback(async () => {
    if (!userId) return;
    const request = ++version.current;
    setLoading(true);
    try {
      const [rows, count] = await Promise.all([
        notificationService.getMyNotifications(),
        notificationService.getUnreadCount(),
      ]);
      if (request !== version.current) return;
      setDataOwner(userId);
      setItems(rows.data ?? []);
      setTotalUnread(count.data ?? 0);
      setError("");
    } catch {
      if (request === version.current)
        setError("Không tải được thông báo. Vui lòng thử lại.");
    } finally {
      if (request === version.current) setLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    session.current++;
    version.current++;
    setItems([]);
    setTotalUnread(0);
    setError("");
    setMarkingAll(false);
    void load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 45000);
    const refresh = () => {
      void load();
    };
    window.addEventListener("internlink:notifications-updated", refresh);
    return () => {
      session.current++;
      version.current++;
      clearInterval(timer);
      window.removeEventListener("internlink:notifications-updated", refresh);
    };
  }, [load]);
  const markRead = async (id: string) => {
    const current = session.current;
    if (marking.current.get(id) === current) return;
    marking.current.set(id, current);
    try {
      await notificationService.markRead(id);
      if (current !== session.current) return;
      if (items.some((item) => item.id === id && !item.isRead))
        setTotalUnread((count) => Math.max(0, count - 1));
      setItems((rows) =>
        rows.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      );
    } catch {
      if (current === session.current)
        setError("Không đánh dấu được thông báo.");
    } finally {
      if (marking.current.get(id) === current) marking.current.delete(id);
    }
  };
  const markAll = async () => {
    const current = session.current;
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      if (current !== session.current) return;
      setTotalUnread(0);
      setItems((rows) => rows.map((item) => ({ ...item, isRead: true })));
    } catch {
      if (current === session.current)
        setError("Không đánh dấu được thông báo.");
    } finally {
      if (current === session.current) setMarkingAll(false);
    }
  };
  return {
    items: dataOwner === userId ? items : [],
    totalUnread: dataOwner === userId ? totalUnread : 0,
    loading,
    markingAll,
    error,
    load,
    markRead,
    markAll,
  };
}
