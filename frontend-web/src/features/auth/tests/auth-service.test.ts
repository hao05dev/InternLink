import { afterEach, describe, expect, it, vi } from "vitest";
import { getSessionUser } from "@/features/auth/services/auth.service";

const response = (status: number, body: object) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
});

afterEach(() => vi.unstubAllGlobals());

describe("session restore", () => {
    it("restores the user from /me while the running backend lacks /session", async () => {
        const user = { id: "admin-id", email: "admin@ctu.edu.vn", fullName: "Admin", role: "ADMIN" };
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(response(500, {
                success: false,
                message: "Lỗi hệ thống: No static resource api/v1/auth/session.",
            }))
            .mockResolvedValueOnce(response(200, { success: true, data: user }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(getSessionUser()).resolves.toEqual(user);
        expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
            "/api/v1/auth/session",
            "/api/v1/auth/me",
        ]);
    });

    it("treats a missing cookie as anonymous on the older backend", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(response(500, {
                success: false,
                message: "Lỗi hệ thống: No static resource api/v1/auth/session.",
            }))
            .mockResolvedValueOnce(response(401, { success: false, message: "Unauthorized" }));
        vi.stubGlobal("fetch", fetchMock);

        await expect(getSessionUser()).resolves.toBeNull();
    });
});
