import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-6xl font-black text-slate-900">404</h1>
      <h2 className="mt-4 text-xl font-bold text-slate-800">Không tìm thấy trang yêu cầu</h2>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
      </p>
      <Link href="/" className="mt-6">
        <Button variant="default" className="rounded-full gap-2">
          <ArrowLeft className="w-4 h-4" /> Về trang chủ
        </Button>
      </Link>
    </div>
  );
}
