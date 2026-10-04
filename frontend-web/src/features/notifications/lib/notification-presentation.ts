import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Briefcase,
  GraduationCap,
  Building2,
  BookOpen,
  Award,
  FileText,
  MessageSquare,
} from "lucide-react";
export function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function getNotificationVisuals(type: string) {
  switch (type) {
    case "INTRODUCTION_LETTER_PICKUP":
      return {
        icon: FileText,
        color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      };
    case "COMPANY_FORM_REMINDER":
      return {
        icon: Building2,
        color: "text-amber-600 bg-amber-50 border-amber-200",
      };
    case "STUDENT_FOUND_SUBMITTED":
      return {
        icon: FileText,
        color: "text-sky-600 bg-sky-50 border-sky-200",
      };
    case "STUDENT_FOUND_APPROVED":
    case "JOB_APPROVED":
    case "LOGBOOK_APPROVED":
    case "OFFER_ACCEPTED":
      return {
        icon: CheckCircle2,
        color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      };
    case "STUDENT_FOUND_REVISION":
    case "LOGBOOK_REVISION_REQUESTED":
      return {
        icon: AlertTriangle,
        color: "text-amber-600 bg-amber-50 border-amber-200",
      };
    case "STUDENT_FOUND_REJECTED":
    case "JOB_REJECTED":
    case "OFFER_REJECTED":
      return {
        icon: XCircle,
        color: "text-rose-600 bg-rose-50 border-rose-200",
      };
    case "LECTURER_ASSIGNED":
      return {
        icon: GraduationCap,
        color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      };
    case "LOGBOOK_SUBMITTED":
      return {
        icon: BookOpen,
        color: "text-sky-600 bg-sky-50 border-sky-200",
      };
    case "LOGBOOK_COMMENTED":
      return {
        icon: MessageSquare,
        color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      };
    case "NEW_JOB_POSTED":
    case "OFFER_SENT":
      return {
        icon: Briefcase,
        color: "text-sky-600 bg-sky-50 border-sky-200",
      };
    case "FINAL_RESULT_PUBLISHED":
      return {
        icon: Award,
        color: "text-purple-600 bg-purple-50 border-purple-200",
      };
    default:
      return {
        icon: Info,
        color: "text-slate-600 bg-slate-100 border-slate-200",
      };
  }
}
