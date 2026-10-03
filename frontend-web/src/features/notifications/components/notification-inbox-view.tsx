"use client";
import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { notificationService } from "../services/notification.service";
import { notificationAction } from "../lib/notification-links";
import { NotificationPreferences } from "../types/preferences.types";

const button="rounded-lg bg-sky-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
const secondary="rounded-lg border px-3 py-2 text-sm disabled:opacity-50";
const createdAtFormatter = new Intl.DateTimeFormat("vi-VN", {dateStyle:"short",timeStyle:"short",timeZone:"Asia/Ho_Chi_Minh"});
function Failure({ error }: { error: unknown }) {
    return error ? <p role="alert" className="text-sm text-rose-700">{error instanceof Error ? error.message : "Không tải được thông báo. Vui lòng thử lại."}</p> : null;
}
const deliveryLabels: Record<string,string> = {QUEUED:"Email đang chờ gửi",PENDING:"Email đang chờ gửi",
    SENT:"Đã chuyển email đến nhà cung cấp",RETRY:"Email đang chờ thử lại",FAILED:"Email gửi thất bại",
    UNKNOWN:"Email cần kiểm tra trạng thái",SKIPPED:"Email được bỏ qua theo tùy chọn",DISABLED:"Email chưa được bật",
    SEPARATE_NOTICE:"Email thuộc lượt gửi riêng",DUPLICATE:"Email đã có trong hàng đợi"};
function PreferencesForm({ initial, onSave, pending, error }: { initial: NotificationPreferences;
    onSave: (value: NotificationPreferences) => void; pending: boolean; error: unknown }) {
    const [value,setValue]=useState(initial);
    const choices: {key: keyof Omit<NotificationPreferences,"emailServiceEnabled">; label:string}[] = [
        {key:"emailEnabled",label:"Nhận email thông báo"},
        {key:"workflowEmail",label:"Thay đổi hồ sơ, phê duyệt và phân công"},
        {key:"reminderEmail",label:"Nhắc thời hạn và công việc"},
        {key:"announcementEmail",label:"Tin tuyển dụng và thông báo chung"},
        {key:"systemEmail",label:"Thông báo hệ thống"}];
    return <form className="space-y-3" onSubmit={event => {event.preventDefault();onSave(value);}}>
        {!initial.emailServiceEnabled && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Hệ thống chưa bật gửi email. Bạn vẫn nhận thông báo trong ứng dụng; tùy chọn được lưu cho khi dịch vụ email hoạt động.</p>}
        {choices.map(choice => <label key={choice.key} className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={value[choice.key]} disabled={pending || (choice.key!=="emailEnabled" && !value.emailEnabled)}
                onChange={event => setValue(current => ({...current,[choice.key]:event.target.checked}))} />
            {choice.label}</label>)}
        <p className="text-sm text-slate-500">Thông báo trong ứng dụng luôn được giữ để bạn theo dõi hồ sơ.</p>
        <button type="submit" className={button} disabled={pending}>{pending?"Đang lưu…":"Lưu tùy chọn email"}</button>
        <Failure error={error} />
    </form>;
}
export function NotificationInboxView() {
    const {user}=useAuth();
    const cache=useQueryClient();
    const [page,setPage]=useState(0);
    const [unread,setUnread]=useState(false);
    const inbox=useQuery({queryKey:["notification-inbox",user?.id,page,unread],
        queryFn: async()=> (await notificationService.getPage(page,20,unread)).data,enabled:!!user});
    const preferences=useQuery({queryKey:["notification-preferences",user?.id],
        queryFn:async()=> (await notificationService.getPreferences()).data,enabled:!!user});
    const refresh=()=> {
        void cache.invalidateQueries({queryKey:["notification-inbox",user?.id]});
        window.dispatchEvent(new Event("internlink:notifications-updated"));
    };
    const mark=useMutation({mutationFn:notificationService.markRead,onSuccess:refresh});
    const markAll=useMutation({mutationFn:notificationService.markAllRead,onSuccess:refresh});
    const save=useMutation({mutationFn:notificationService.savePreferences,onSuccess:response=>{
        cache.setQueryData(["notification-preferences",user?.id],response.data);
        void cache.invalidateQueries({queryKey:["notification-preferences",user?.id]});
    }});
    return <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
        <header><h1 className="text-2xl font-bold">Thông báo của bạn</h1><p className="mt-2 text-slate-600">Theo dõi cập nhật và công việc trong phạm vi hồ sơ của bạn.</p></header>
        <section className="rounded-xl border bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={unread}
                    onChange={event=>{setUnread(event.target.checked);setPage(0);}} />Chỉ hiện chưa đọc</label>
                <span className="text-sm">{inbox.data?.unreadCount ?? 0} thông báo chưa đọc</span>
                <button type="button" className={secondary} disabled={!inbox.data?.unreadCount || markAll.isPending} onClick={()=>markAll.mutate()}>Đánh dấu tất cả đã đọc</button>
            </div>
            <Failure error={inbox.error ?? mark.error ?? markAll.error} />
            {inbox.isPending && <p>Đang tải thông báo…</p>}
            {inbox.data?.items.length===0 && <p className="py-5 text-slate-500">Chưa có thông báo trong danh sách này.</p>}
            <ul className="divide-y">{inbox.data?.items.map(item=>{
                const link=notificationAction(item.actionUrl,user?.role,item.notificationType);
                return <li key={item.id} className={"space-y-2 p-4 " + (item.isRead?"":"rounded-lg bg-sky-50")}>
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="whitespace-pre-line text-sm text-slate-700">{item.message}</p>
                    <p className="text-xs text-slate-500">{createdAtFormatter.format(new Date(item.createdAt))}{item.deliveryStatus?.email && " · " + (deliveryLabels[item.deliveryStatus.email] ?? "")}</p>
                    <div className="flex flex-wrap gap-3">{link && <Link className="text-sm font-semibold text-sky-800" href={link}
                        onClick={()=>{if(!item.isRead)mark.mutate(item.id);}}>Xem chi tiết</Link>}
                        {!item.isRead && <button type="button" className="text-sm text-slate-600 underline" disabled={mark.isPending}
                            onClick={()=>mark.mutate(item.id)}>Đánh dấu đã đọc</button>}</div>
                </li>;
            })}</ul>
            <div className="flex items-center justify-between">
                <button type="button" className={secondary} disabled={page===0 || inbox.isFetching} onClick={()=>setPage(current=>current-1)}>Trang trước</button>
                <span className="text-sm">Trang {page+1}/{Math.max(1,inbox.data?.totalPages ?? 1)}</span>
                <button type="button" className={secondary} disabled={!inbox.data || page+1>=inbox.data.totalPages || inbox.isFetching}
                    onClick={()=>setPage(current=>current+1)}>Trang sau</button>
            </div>
        </section>
        <section className="rounded-xl border bg-white p-5 space-y-4"><h2 className="text-lg font-semibold">Tùy chọn nhận email</h2>
            <Failure error={preferences.error} />
            {preferences.data && <PreferencesForm key={user?.id} initial={preferences.data} onSave={value=>save.mutate(value)} pending={save.isPending} error={save.error} />}
            {save.isSuccess && <p role="status" className="text-sm text-emerald-800">Đã lưu tùy chọn.</p>}
        </section>
    </main>;
}
