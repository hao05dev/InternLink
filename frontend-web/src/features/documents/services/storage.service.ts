import { apiClient } from "@/lib/api-client";
export type Orphan = { key: string; size: number; modified: string };
export type StoragePage = {
  items: Orphan[];
  nextToken?: string;
  failures: {
    id: string;
    status: string;
    error_code?: string;
    created_at: string;
  }[];
};
export type StorageCapabilities = {
  provider: string;
  directUpload: boolean;
  maxBytes: number;
  scanningEnabled: boolean;
};
export const storageService = {
  capabilities: async () =>
    (
      await apiClient.get<StorageCapabilities>(
        "/api/v1/documents/uploads/capabilities",
      )
    ).data,
  orphans: async (cursor: string) =>
    (
      await apiClient.get<StoragePage>(
        "/api/v1/documents/storage/orphans" +
          (cursor ? "?cursor=" + encodeURIComponent(cursor) : ""),
      )
    ).data,
  purge: (keys: string[], reason: string) =>
    apiClient.post("/api/v1/documents/storage/orphans/purge", { keys, reason }),
};
