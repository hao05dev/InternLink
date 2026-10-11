"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Paperclip, Pin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaImageInput } from "@/components/ui/media-image-input";
import { FileUploader } from "@/components/ui/file-uploader";
import { RichEditor } from "@/components/ui/rich-editor";
import { uploadMedia } from "@/lib/media-upload";
import { Textarea } from "@/components/ui/textarea";
import {
  PostItem,
  CreatePostPayload,
  PostCategory,
  POST_CATEGORY_LABELS,
  PostAttachment,
} from "../../types/post.types";

interface PostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreatePostPayload, editingId?: string) => Promise<void>;
  editingPost: PostItem | null;
}

export function PostEditorModal({
  isOpen,
  onClose,
  onSave,
  editingPost,
}: PostEditorModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PostCategory>(
    "REGULATIONS_GUIDELINES",
  );
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">("PUBLISHED");
  const [attachments, setAttachments] = useState<PostAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const uploadState = useCallback(
    (busy: boolean) => setUploadCount((n) => Math.max(0, n + (busy ? 1 : -1))),
    [],
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || "");
      setCategory(editingPost.category || "REGULATIONS_GUIDELINES");
      setSummary(editingPost.summary || "");
      setContent(editingPost.content || "");
      setCoverImageUrl(editingPost.coverImageUrl || "");
      setTagsInput((editingPost.tags || []).join(", "));
      setIsPinned(Boolean(editingPost.isPinned));
      setStatus(editingPost.status === "DRAFT" ? "DRAFT" : "PUBLISHED");
      setAttachments(editingPost.attachmentUrls || []);
    } else {
      setTitle("");
      setCategory("REGULATIONS_GUIDELINES");
      setSummary("");
      setContent("");
      setCoverImageUrl("");
      setTagsInput("");
      setIsPinned(false);
      setStatus("PUBLISHED");
      setAttachments([]);
    }
    setErrorMsg("");
  }, [editingPost, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadCount) {
      setErrorMsg("Chờ ảnh/tệp tải xong trước khi lưu.");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Vui lòng nhập tiêu đề bài viết.");
      return;
    }
    if (!summary.trim()) {
      setErrorMsg("Vui lòng nhập tóm tắt ngắn.");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("Vui lòng nhập nội dung bài viết.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload: CreatePostPayload = {
      title: title.trim(),
      category,
      summary: summary.trim(),
      content: content.trim(),
      coverImageUrl: coverImageUrl.trim(),
      tags,
      isPinned,
      status,
      attachmentUrls: attachments,
    };

    try {
      setIsSubmitting(true);
      setErrorMsg("");
      await onSave(payload, editingPost?.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Không thể lưu bài viết. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {editingPost
                ? "Chỉnh sửa bài viết cẩm nang"
                : "Tạo bài viết cẩm nang mới"}
            </h2>
            <p className="text-xs text-slate-400">
              Điền thông tin và xuất bản lên hệ thống cho sinh viên và khoa.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs"
        >
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Tiêu đề bài viết <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="Ví dụ: Hướng dẫn hoàn thành mẫu M01 - Kế hoạch thực tập doanh nghiệp..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Danh mục chủ đề <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full h-9 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer"
              >
                {Object.entries(POST_CATEGORY_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Trạng thái xuất bản
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "PUBLISHED" | "DRAFT")
                }
                className="w-full h-9 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer"
              >
                <option value="PUBLISHED">Xuất bản công khai ngay</option>
                <option value="DRAFT">Lưu bản nháp</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Tóm tắt ngắn (Excerpt) <span className="text-rose-500">*</span>
            </label>
            <Textarea
              placeholder="Tóm tắt 1-2 câu về nội dung cốt lõi của bài viết..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className="text-xs rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Nội dung chi tiết <span className="text-rose-500">*</span>
            </label>
            <RichEditor
              value={content}
              onChange={setContent}
              mediaScope={{
                purpose: "POST_IMAGE",
                contextId: editingPost?.authorUserId,
              }}
              onUploadStateChange={uploadState}
              showTemplateButton={false}
            />
          </div>

          <div className="space-y-1.5">
            <MediaImageInput
              label="Ảnh bìa bài viết (Tùy chọn)"
              purpose="POST_COVER"
              contextId={editingPost?.authorUserId}
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              disabled={isSubmitting}
              onUploadStateChange={uploadState}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Từ khóa (Tags, phân cách bằng dấu phẩy)
            </label>
            <Input
              placeholder="CV, Phỏng vấn, Kế hoạch, CICT"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="text-xs rounded-xl"
            />
          </div>

          {/* Attachments Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-sky-600" />
              File đính kèm (Biểu mẫu M01–M05, PDF, Tài liệu)
            </label>

            <FileUploader
              value={attachments.map((a) => ({ ...a, id: a.fileUrl }))}
              onChange={(items) =>
                setAttachments(items.map(({ id, ...item }) => item))
              }
              allowUrlInput={false}
              disabled={isSubmitting}
              onUploadStateChange={uploadState}
              accept=".pdf,.docx,.xlsx,.txt,.png,.jpg,.jpeg"
              maxSizeMb={20}
              description="PDF, Office, TXT hoặc PNG/JPEG; tệp tối đa 20 MiB, ảnh tối đa 5 MiB."
              upload={async (file) => {
                const asset = await uploadMedia(file, {
                  purpose: "POST_ATTACHMENT",
                  contextId: editingPost?.authorUserId,
                });
                return {
                  id: asset.id,
                  fileName: asset.fileName,
                  fileUrl: asset.url,
                  fileType: asset.mimeType.startsWith("image/")
                    ? "IMAGE"
                    : "OTHER",
                };
              }}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPinnedCheck"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <label
              htmlFor="isPinnedCheck"
              className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1"
            >
              <Pin className="w-3.5 h-3.5 text-amber-600" />
              Ghim bài viết này lên đầu trang
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || uploadCount > 0}
              className="text-xs h-9 rounded-xl"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || uploadCount > 0}
              className="text-xs h-9 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-xs"
            >
              {isSubmitting
                ? "Đang lưu..."
                : editingPost
                  ? "Cập nhật bài viết"
                  : "Xuất bản bài viết"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
