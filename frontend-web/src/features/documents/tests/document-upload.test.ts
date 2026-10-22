import { describe, it, expect, vi, afterEach } from "vitest";
import { apiClient } from "@/lib/api-client";
import { uploadDocument } from "@/lib/document-upload";
vi.mock("@/lib/api-client", () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), upload: vi.fn() },
}));
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
describe("document upload", () => {
  it("uses server enums and multipart for proxy uploads", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      data: { directUpload: false, maxBytes: 1000 },
    });
    vi.mocked(apiClient.upload).mockResolvedValue({
      success: true,
      data: { id: "doc" },
    });
    await uploadDocument(
      new File(["%PDF-1.7"], "cv.pdf", { type: "application/pdf" }),
      "PROFILE",
      "user",
      "CV",
    );
    expect(apiClient.upload).toHaveBeenCalledWith(
      "/api/v1/documents/upload?contextType=PROFILE&contextId=user&docType=CV",
      expect.any(FormData),
    );
  });
  it("omits app credentials from R2 and finalizes only after PUT succeeds", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      data: { directUpload: true, maxBytes: 1000 },
    });
    vi.mocked(apiClient.post)
      .mockResolvedValueOnce({
        success: true,
        data: {
          id: "ticket",
          uploadUrl: "https://bucket.example/test",
          headers: { "Content-Type": "application/pdf" },
        },
      })
      .mockResolvedValueOnce({ success: true, data: { id: "doc" } });
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetch);
    vi.stubGlobal("crypto", {
      subtle: { digest: vi.fn().mockResolvedValue(new Uint8Array(32).buffer) },
    });
    const file = new File(["%PDF-1.7"], "cv.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "arrayBuffer", {
      value: async () => new Uint8Array([1]).buffer,
    });
    await uploadDocument(file, "PLACEMENT", "placement", "REPORT");
    expect(fetch).toHaveBeenCalledWith(
      "https://bucket.example/test",
      expect.objectContaining({
        credentials: "omit",
        method: "PUT",
        body: file,
      }),
    );
    expect(apiClient.post).toHaveBeenLastCalledWith(
      "/api/v1/documents/uploads/ticket/finalize",
    );
  });
  it("never finalizes a rejected PUT", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      data: { directUpload: true, maxBytes: 1000 },
    });
    vi.mocked(apiClient.post).mockResolvedValue({
      success: true,
      data: {
        id: "ticket",
        uploadUrl: "https://bucket.example/test",
        headers: {},
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    vi.stubGlobal("crypto", {
      subtle: { digest: vi.fn().mockResolvedValue(new Uint8Array(32).buffer) },
    });
    const file = new File(["data"], "cv.pdf");
    Object.defineProperty(file, "arrayBuffer", {
      value: async () => new ArrayBuffer(1),
    });
    await expect(uploadDocument(file, "PROFILE", "user", "CV")).rejects.toThrow(
      "Upload R2",
    );
    expect(apiClient.post).toHaveBeenCalledTimes(1);
  });
  it("forces backend proxy upload for encrypted sensitive document types even if direct upload is enabled", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      success: true,
      data: { directUpload: true, maxBytes: 1000 },
    });
    vi.mocked(apiClient.upload).mockResolvedValue({
      success: true,
      data: { id: "encrypted-doc" },
    });
    await uploadDocument(
      new File(["content"], "agreement.pdf", { type: "application/pdf" }),
      "AGREEMENT",
      "agreement-123",
      "AGREEMENT",
    );
    expect(apiClient.upload).toHaveBeenCalledWith(
      "/api/v1/documents/upload?contextType=AGREEMENT&contextId=agreement-123&docType=AGREEMENT",
      expect.any(FormData),
    );
    expect(apiClient.post).not.toHaveBeenCalled();
  });
});
