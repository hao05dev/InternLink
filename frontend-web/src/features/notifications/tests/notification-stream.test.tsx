import { it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNotificationStream } from "../hooks/use-notification-stream";
afterEach(() => vi.unstubAllGlobals());
it("closes the authenticated stream when changing user or signing out", () => {
  const streams: { url: string; close: ReturnType<typeof vi.fn> }[] = [];
  vi.stubGlobal(
    "EventSource",
    class {
      close = vi.fn();
      addEventListener = vi.fn();
      constructor(url: string) {
        streams.push({ url, close: this.close });
      }
    },
  );
  const { rerender, unmount } = renderHook(
    ({ id }: { id?: string }) => useNotificationStream(id),
    { initialProps: { id: "a" as string | undefined } },
  );
  expect(streams[0].url).toBe("/api/v1/notifications/stream");
  rerender({ id: "b" });
  expect(streams[0].close).toHaveBeenCalledOnce();
  rerender({ id: undefined });
  expect(streams[1].close).toHaveBeenCalledOnce();
  expect(streams).toHaveLength(2);
  unmount();
});
