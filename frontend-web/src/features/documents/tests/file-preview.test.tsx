import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import {
  getPreviewType,
  isDirectlyPreviewable,
  getGoogleDocsViewerUrl,
  formatFileSize,
  getFileExtension,
} from "../utils/file-preview-utils";
import { FilePreviewModal } from "../components/modals/file-preview-modal";
import { FilePreviewButton } from "../components/preview/file-preview-button";
import { PreviewableFile } from "../types/preview.types";

describe("File Preview Utilities", () => {
  it("detects file extensions correctly", () => {
    expect(getFileExtension("bao_cao.pdf")).toBe("pdf");
    expect(getFileExtension("IMAGE.PNG")).toBe("png");
    expect(getFileExtension("data.csv")).toBe("csv");
    expect(getFileExtension("no_extension")).toBe("");
  });

  it("classifies preview types accurately", () => {
    expect(getPreviewType("cv.pdf")).toBe("pdf");
    expect(getPreviewType("scan.pdf", "application/pdf")).toBe("pdf");
    expect(getPreviewType("avatar.png", "image/png")).toBe("image");
    expect(getPreviewType("photo.jpeg")).toBe("image");
    expect(getPreviewType("data.csv", "text/csv")).toBe("text");
    expect(getPreviewType("script.json")).toBe("text");
    expect(getPreviewType("notes.txt")).toBe("text");
    expect(getPreviewType("podcast.mp3", "audio/mpeg")).toBe("audio");
    expect(getPreviewType("demo.mp4", "video/mp4")).toBe("video");
    expect(getPreviewType("report.docx")).toBe("office");
    expect(getPreviewType("grades.xlsx")).toBe("office");
    expect(getPreviewType("archive.zip")).toBe("unsupported");
    expect(getPreviewType("backup.tar.gz")).toBe("unsupported");
  });

  it("identifies directly previewable files", () => {
    expect(isDirectlyPreviewable("doc.pdf")).toBe(true);
    expect(isDirectlyPreviewable("picture.jpg")).toBe(true);
    expect(isDirectlyPreviewable("readme.md")).toBe(true);
    expect(isDirectlyPreviewable("song.mp3")).toBe(true);
    expect(isDirectlyPreviewable("presentation.pptx")).toBe(false);
    expect(isDirectlyPreviewable("archive.rar")).toBe(false);
  });

  it("builds Google Docs viewer URL", () => {
    const url = "https://example.com/files/report.docx";
    const viewerUrl = getGoogleDocsViewerUrl(url);
    expect(viewerUrl).toContain("docs.google.com/viewer");
    expect(viewerUrl).toContain(encodeURIComponent(url));
  });

  it("formats file sizes correctly", () => {
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
    expect(formatFileSize("2.5 MB")).toBe("2.5 MB");
    expect(formatFileSize(undefined)).toBe("");
  });
});

describe("FilePreviewModal Component", () => {
  it("does not render when file is null or isOpen is false", () => {
    const { container: c1 } = render(
      <FilePreviewModal file={null} isOpen={true} onClose={() => {}} />
    );
    expect(c1.firstChild).toBeNull();

    const mockFile: PreviewableFile = {
      fileName: "cv.pdf",
      fileUrl: "/api/v1/documents/123/preview",
    };

    const { container: c2 } = render(
      <FilePreviewModal file={mockFile} isOpen={false} onClose={() => {}} />
    );
    expect(c2.querySelector('[role="dialog"]')).toBeNull();
  });

  it("renders PDF viewer for PDF file", () => {
    const mockFile: PreviewableFile = {
      fileName: "BaoCaoThucTap.pdf",
      fileUrl: "/api/v1/documents/abc/preview",
      fileSize: "1.2 MB",
    };

    render(<FilePreviewModal file={mockFile} isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("BaoCaoThucTap.pdf")).toBeDefined();
    expect(screen.getByText("Tài liệu PDF")).toBeDefined();
    expect(screen.getByText("1.2 MB")).toBeDefined();
  });

  it("renders image viewer for image file", () => {
    const mockFile: PreviewableFile = {
      fileName: "evidence.png",
      fileUrl: "https://example.com/evidence.png",
    };

    render(<FilePreviewModal file={mockFile} isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("evidence.png")).toBeDefined();
    expect(screen.getByText("Hình ảnh")).toBeDefined();
  });

  it("renders office fallback viewer for docx file", () => {
    const mockFile: PreviewableFile = {
      fileName: "HopDongThucTap.docx",
      fileUrl: "https://example.com/contract.docx",
    };

    render(<FilePreviewModal file={mockFile} isOpen={true} onClose={() => {}} />);
    expect(screen.getByText("HopDongThucTap.docx")).toBeDefined();
    expect(screen.getByText("Tài liệu văn phòng")).toBeDefined();
  });

  it("renders unsupported fallback for zip file", () => {
    const mockFile: PreviewableFile = {
      fileName: "SourceCode.zip",
      fileUrl: "/download/source.zip",
    };

    render(<FilePreviewModal file={mockFile} isOpen={true} onClose={() => {}} />);
    expect(screen.getAllByText("SourceCode.zip").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Định dạng tệp này không hỗ trợ xem trực tiếp/)).toBeDefined();
  });
});

describe("FilePreviewButton Component", () => {
  it("fires onPreview callback when clicked", () => {
    const onPreview = vi.fn();
    const mockFile: PreviewableFile = {
      fileName: "sample.pdf",
      fileUrl: "/sample.pdf",
    };

    render(<FilePreviewButton file={mockFile} onPreview={onPreview} variant="button" />);
    const button = screen.getByRole("button", { name: /Xem trước/i });
    fireEvent.click(button);

    expect(onPreview).toHaveBeenCalledTimes(1);
    expect(onPreview).toHaveBeenCalledWith(mockFile);
  });
});
