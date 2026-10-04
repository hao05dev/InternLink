"use client";
import { useRef, useState, useEffect } from "react";
import { uploadMedia, type MediaScope } from "@/lib/media-upload";
type Props = MediaScope & {
  label: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  onUploadStateChange?: (busy: boolean) => void;
};
export function MediaImageInput({
  label,
  value,
  onChange,
  disabled,
  onUploadStateChange,
  ...scope
}: Props) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const requestScope = JSON.stringify(scope);
  const currentScope = useRef(requestScope);
  useEffect(() => {
    currentScope.current = requestScope;
  }, [requestScope]);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function select(file?: File) {
    if (!file) return;
    const startedScope = requestScope;
    setBusy(true);
    setError("");
    onUploadStateChange?.(true);
    try {
      const asset = await uploadMedia(file, scope);
      if (mounted.current && currentScope.current === startedScope)
        onChange(asset.url);
    } catch (e) {
      if (mounted.current)
        setError(e instanceof Error ? e.message : "Không tải được ảnh.");
    } finally {
      if (mounted.current) setBusy(false);
      onUploadStateChange?.(false);
    }
  }
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        <input
          type="file"
          accept="image/png,image/jpeg"
          disabled={disabled || busy}
          onChange={(event) => {
            void select(event.target.files?.[0]);
            event.target.value = "";
          }}
          className="mt-2 block w-full rounded-lg border p-2 text-sm disabled:opacity-50"
        />
      </label>
      <p className="text-xs text-slate-500">
        {busy ? "Đang tải ảnh…" : "PNG/JPEG, tối đa 5 MiB."}
      </p>
      {error && (
        <p role="alert" className="text-sm text-rose-700">
          {error}
        </p>
      )}
      {value && (
        <div className="space-y-2">
          <img
            src={value}
            alt="Xem trước ảnh đã chọn"
            className="max-h-48 max-w-full rounded-lg border object-contain"
          />
          <button
            type="button"
            disabled={disabled || busy}
            className="text-sm text-rose-700 underline"
            onClick={() => onChange("")}
          >
            Gỡ ảnh
          </button>
        </div>
      )}
    </div>
  );
}
