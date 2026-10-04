"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { notificationService } from "../services/notification.service";
export function useNotificationInbox() {
  const { user } = useAuth();
  const cache = useQueryClient();
  const [page, setPage] = useState(0);
  const [unread, setUnread] = useState(false);
  useEffect(() => {
    const refresh = () => {
      void cache.invalidateQueries({
        queryKey: ["notification-inbox", user?.id],
      });
    };
    window.addEventListener("internlink:notifications-updated", refresh);
    return () =>
      window.removeEventListener("internlink:notifications-updated", refresh);
  }, [cache, user?.id]);
  const inbox = useQuery({
    queryKey: ["notification-inbox", user?.id, page, unread],
    queryFn: async () =>
      (await notificationService.getPage(page, 20, unread)).data,
    enabled: !!user,
  });
  const preferences = useQuery({
    queryKey: ["notification-preferences", user?.id],
    queryFn: async () => (await notificationService.getPreferences()).data,
    enabled: !!user,
  });
  const refresh = () => {
    void cache.invalidateQueries({
      queryKey: ["notification-inbox", user?.id],
    });
    window.dispatchEvent(new Event("internlink:notifications-updated"));
  };
  const mark = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: refresh,
  });
  const markAll = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: refresh,
  });
  const save = useMutation({
    mutationFn: notificationService.savePreferences,
    onSuccess: (response) => {
      cache.setQueryData(["notification-preferences", user?.id], response.data);
      void cache.invalidateQueries({
        queryKey: ["notification-preferences", user?.id],
      });
    },
  });
  return {
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
  };
}
