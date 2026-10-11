import { useState, useEffect, useCallback, useRef } from "react";
import { UploadedFileItem } from "@/components/ui/file-uploader";

const DRAFT_STORAGE_KEY_PREFIX = "internlink_job_draft_";

export interface JobFormDraftValues {
  title: string;
  workFormat: string;
  location: string;
  vacancies: string;
  stipendAmount: string;
  isNegotiable: boolean;
  description: string;
  skillsText: string;
  benefitsText: string;
  bannerUrl: string;
  attachmentUrls: UploadedFileItem[];
  selectedDeptId: string;
  selectedTermId: string;
}

interface UseJobFormDraftOptions {
  mode: "create" | "edit";
  companyId?: string;
  isLoading: boolean;
  isSubmitting: boolean;
  values: JobFormDraftValues;
  onRestore: (draft: Partial<JobFormDraftValues>) => void;
  onResetToDefault: () => void;
}

export function useJobFormDraft({
  mode,
  companyId,
  isLoading,
  isSubmitting,
  values,
  onRestore,
  onResetToDefault,
}: UseJobFormDraftOptions) {
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [restoredTime, setRestoredTime] = useState<string | null>(null);
  const isSubmittedSuccessfullyRef = useRef(false);

  const storageKey = `${DRAFT_STORAGE_KEY_PREFIX}${companyId || "default"}`;

  // 1. Khôi phục bản nháp từ localStorage khi mở form tạo mới
  useEffect(() => {
    if (mode !== "create" || typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.title || draft.description) {
          onRestore(draft);
          setHasRestoredDraft(true);
          if (draft.updatedAt) {
            try {
              setRestoredTime(
                new Date(draft.updatedAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              );
            } catch {
              // Bỏ qua lỗi format thời gian
            }
          }
        }
      }
    } catch {
      // Bỏ qua lỗi parse JSON
    }
  }, [mode, storageKey, onRestore]);

  // 2. Tự động lưu nháp vào localStorage (Debounced 500ms)
  useEffect(() => {
    if (
      mode !== "create" ||
      isLoading ||
      isSubmitting ||
      isSubmittedSuccessfullyRef.current
    )
      return;

    const hasCustomContent = !!(
      values.title.trim() ||
      values.description.trim() ||
      values.benefitsText.trim()
    );
    if (!hasCustomContent) return;

    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && !isSubmittedSuccessfullyRef.current) {
        try {
          const draft = {
            ...values,
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem(storageKey, JSON.stringify(draft));
        } catch {
          // Bỏ qua lỗi quota storage
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [mode, isLoading, isSubmitting, storageKey, values]);

  // 3. Cảnh báo người dùng trước khi rời trang hoặc F5 nếu có thay đổi chưa lưu
  useEffect(() => {
    const hasChanges = !!(
      values.title.trim() ||
      values.description.trim() ||
      values.benefitsText.trim()
    );

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        !isSubmitting &&
        !isSubmittedSuccessfullyRef.current &&
        hasChanges
      ) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSubmitting, values.title, values.description, values.benefitsText]);

  // 4. Xóa bản nháp làm mới
  const clearDraft = useCallback(() => {
    isSubmittedSuccessfullyRef.current = false;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Bỏ qua lỗi storage
      }
    }
    onResetToDefault();
    setHasRestoredDraft(false);
    setRestoredTime(null);
  }, [storageKey, onResetToDefault]);

  // 5. Dọn dẹp bản nháp khi submit thành công (khóa vĩnh viễn auto-save)
  const removeDraftOnSuccess = useCallback(() => {
    isSubmittedSuccessfullyRef.current = true;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Bỏ qua lỗi storage
      }
    }
    setHasRestoredDraft(false);
    setRestoredTime(null);
  }, [storageKey]);

  const dismissBanner = useCallback(() => {
    setHasRestoredDraft(false);
  }, []);

  return {
    hasRestoredDraft,
    restoredTime,
    clearDraft,
    removeDraftOnSuccess,
    dismissBanner,
  };
}
