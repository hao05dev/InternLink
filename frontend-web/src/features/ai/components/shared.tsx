import { ReactNode } from "react";
import { Option } from "../api";

export const control = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";
export const action = "rounded-lg bg-sky-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
export function Panel({ title, children }: { title: string; children: ReactNode }) {
    return <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-semibold">{title}</h2>{children}</section>;
}
export function ErrorNotice({ error }: { error: unknown }) {
    if (!error) return null;
    return <p role="alert" className="text-sm text-rose-700">{error instanceof Error ? error.message : "Không tải được dữ liệu. Vui lòng thử lại."}</p>;
}
export function SelectOption({ label, value, onChange, options }: { label: string; value: string; onChange: (id: string) => void; options: Option[] }) {
    return <label className="block space-y-2 text-sm"><span>{label}</span><select className={control} value={value} onChange={event => onChange(event.target.value)}>
        <option value="">Chọn mục cần xem</option>{options.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
    </select>{options.length === 0 && <span className="text-slate-500">Chưa có dữ liệu trong phạm vi của bạn.</span>}</label>;
}
