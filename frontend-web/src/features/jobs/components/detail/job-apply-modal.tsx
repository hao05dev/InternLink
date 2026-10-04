"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentProfile } from "@/features/profiles/types/profile.types";
import { jobService } from "@/features/jobs/services/job.service";

interface JobApplyModalProps {
  jobId: string;
  jobTitle: string;
  userFullName?: string;
  userEmail?: string;
  studentProfile: StudentProfile | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function JobApplyModal({
  jobId,
  jobTitle,
  userFullName,
  userEmail,
  studentProfile,
  onClose,
  onSuccess,
}: JobApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError(null);

    if (!studentProfile?.cvDocumentId) {
      setApplyError(
        "Bạn chưa tải lên CV trong hồ sơ sinh viên. Vui lòng cập nhật CV tại trang Hồ sơ cá nhân trước khi nộp đơn."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await jobService.applyJob({
        jobId,
        submittedCvDocumentId: studentProfile.cvDocumentId,
        coverLetter: coverLetter.trim() || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setApplyError(
        err?.message || "Không thể nộp hồ sơ ứng tuyển. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Nộp hồ sơ ứng tuyển thực tập
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
            aria-label="Đóng"
          >
            &times;
          </button>
        </div>

        {applyError && (
          <div className="p-3 mb-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{applyError}</span>
          </div>
        )}

        {!studentProfile?.cvDocumentId && (
          <div className="p-3 mb-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-2">
            <p className="font-semibold">
              Bạn chưa có tệp CV trong hồ sơ cá nhân
            </p>
            <p>
              Để ứng tuyển vị trí này, bạn cần tải lên CV tại trang Hồ sơ sinh
              viên.
            </p>
            <Link href="/student/profile">
              <Button size="sm" variant="outline" className="text-xs mt-1">
                Đến trang Cập nhật Hồ sơ & CV
              </Button>
            </Link>
          </div>
        )}

        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 text-xs text-sky-900 space-y-1">
            <div className="font-semibold">
              Ứng viên: {userFullName || "Sinh viên"}
            </div>
            <div className="text-sky-700">Email: {userEmail}</div>
            {studentProfile?.cvFileName && (
              <div className="text-emerald-700 font-medium pt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                CV đính kèm: {studentProfile.cvFileName}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Thư giới thiệu & Mục tiêu thực tập
            </label>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Nêu ngắn gọn định hướng chuyên môn, kinh nghiệm đồ án và nguyện vọng thực tập tại doanh nghiệp..."
              className="w-full text-xs p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs cursor-pointer rounded-xl"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !studentProfile?.cvDocumentId}
              variant="primary"
              className="text-xs font-semibold cursor-pointer rounded-xl"
            >
              {isSubmitting ? "Đang gửi..." : "Xác nhận nộp hồ sơ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
