"use client";

import { STATUS_NAMES } from "../../types";

export function StatePill({ status }: { status: string }) {
  const color = [
    "CONFIRMED",
    "COMPLETED",
    "APPROVED",
    "APPROVED_BY_MENTOR",
    "APPROVED_BY_LECTURER",
  ].includes(status)
    ? "bg-emerald-50 text-emerald-800"
    : ["SUBMITTED", "REVISION_REQUIRED", "REVISION_REQUESTED"].includes(status)
      ? "bg-amber-50 text-amber-900"
      : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${color}`}
    >
      {STATUS_NAMES[status] || status}
    </span>
  );
}

export function VerificationSourceBadge({
  source,
}: {
  source?: "STUDENT_REPORTED" | "MENTOR_VERIFIED" | "LECTURER_ACKNOWLEDGED";
}) {
  if (!source) return null;

  const config = {
    STUDENT_REPORTED: {
      label: "Sinh viên tự khai",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    MENTOR_VERIFIED: {
      label: "Mentor xác nhận",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    LECTURER_ACKNOWLEDGED: {
      label: "Giảng viên rà soát",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    },
  }[source] || {
    label: source,
    className: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
