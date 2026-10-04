export function Failure({ error }: { error: unknown }) {
  return error ? (
    <p role="alert" className="text-sm text-rose-700">
      {error instanceof Error
        ? error.message
        : "Không tải được thông báo. Vui lòng thử lại."}
    </p>
  ) : null;
}
