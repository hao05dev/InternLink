"use client";
import { useEffect } from "react";
export function useNotificationStream(userId?: string) {
  useEffect(() => {
    if (!userId || typeof EventSource === "undefined") return;
    const stream = new EventSource("/api/v1/notifications/stream", {
      withCredentials: true,
    });
    const refresh = () =>
      window.dispatchEvent(new Event("internlink:notifications-updated"));
    stream.addEventListener("connected", refresh);
    stream.addEventListener("notifications", refresh);
    stream.addEventListener("refresh", refresh);
    return () => stream.close();
  }, [userId]);
}
