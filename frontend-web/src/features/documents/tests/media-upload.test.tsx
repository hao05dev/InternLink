import { beforeEach, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { uploadMedia } from "@/lib/media-upload";
import { apiClient } from "@/lib/api-client";
import { MediaImageInput } from "@/components/ui/media-image-input";
import { FileUploader } from "@/components/ui/file-uploader";
import { MediaRichContent } from "@/components/ui/media-rich-content";
vi.mock("@/lib/api-client", () => ({ apiClient: { upload: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());
const asset = {
  id: "123",
  url: "/api/v1/public/media/123",
  fileName: "poster.png",
  mimeType: "image/png",
  sizeBytes: 3,
};
it("uploads the file with purpose and server context rather than saving a browser URL", async () => {
  vi.mocked(apiClient.upload).mockResolvedValue({ success: true, data: asset });
  const result = await uploadMedia(
    new File(["png"], "poster.png", { type: "image/png" }),
    { purpose: "JOB_BANNER", contextId: "company" },
  );
  expect(result.url).toEqual(asset.url);
  expect(apiClient.upload).toHaveBeenCalledWith(
    "/api/v1/media?purpose=JOB_BANNER&contextId=company",
    expect.any(FormData),
  );
  const body = vi.mocked(apiClient.upload).mock.calls[0][1];
  expect(body.get("file")).toBeInstanceOf(File);
});
it("changes the banner only after upload succeeds and shows a provider error", async () => {
  vi.mocked(apiClient.upload).mockRejectedValue(
    new Error("R2 chưa được cấu hình"),
  );
  const change = vi.fn();
  render(
    <MediaImageInput
      label="Poster"
      purpose="JOB_BANNER"
      contextId="company"
      value=""
      onChange={change}
    />,
  );
  fireEvent.change(screen.getByLabelText("Poster"), {
    target: { files: [new File(["png"], "poster.png", { type: "image/png" })] },
  });
  await screen.findByRole("alert");
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toHaveTextContent("R2 chưa được cấu hình");
});
it("file uploader persists returned asset links after asynchronous upload", async () => {
  const change = vi.fn();
  const upload = vi
    .fn()
    .mockResolvedValue({
      id: asset.id,
      fileName: asset.fileName,
      fileUrl: asset.url,
    });
  const view = render(
    <FileUploader
      value={[]}
      onChange={change}
      upload={upload}
      allowUrlInput={false}
    />,
  );
  const input = view.container.querySelector('input[type="file"]')!;
  fireEvent.change(input, {
    target: { files: [new File(["png"], "poster.png", { type: "image/png" })] },
  });
  await waitFor(() =>
    expect(change).toHaveBeenCalledWith([
      expect.objectContaining({ fileUrl: asset.url }),
    ]),
  );
});
it("does not apply a finished upload after its editor has unmounted", async () => {
  let complete!: (value: unknown) => void;
  const upload = vi.fn(
    () =>
      new Promise<any>((resolve) => {
        complete = resolve;
      }),
  );
  const change = vi.fn();
  const view = render(
    <FileUploader
      value={[]}
      onChange={change}
      upload={upload}
      allowUrlInput={false}
    />,
  );
  fireEvent.change(view.container.querySelector('input[type="file"]')!, {
    target: { files: [new File(["png"], "a.png")] },
  });
  view.unmount();
  complete({ id: "id", fileName: "a.png", fileUrl: asset.url });
  await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
  expect(change).not.toHaveBeenCalled();
});
it("renders managed Markdown images while refusing active URL schemes", () => {
  const url = "/api/v1/public/media/12345678-1234-1234-1234-123456789012";
  render(
    <MediaRichContent
      text={`Before ![Poster](${url}) after ![Bad](javascript:alert)`}
    />,
  );
  expect(screen.getByRole("img", { name: "Poster" })).toHaveAttribute(
    "src",
    url,
  );
  expect(screen.queryByRole("img", { name: "Bad" })).not.toBeInTheDocument();
});
