import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationInboxView } from "../components/notification-inbox-view";
import { notificationService } from "../services/notification.service";
import { notificationAction, notificationInbox } from "../lib/notification-links";
vi.mock("@/features/auth/hooks/use-auth",()=>({useAuth:()=>({user:{id:"student-1",role:"STUDENT"}})}));
vi.mock("../services/notification.service",()=>({notificationService:{
    getPage:vi.fn(),getPreferences:vi.fn(),savePreferences:vi.fn(),markRead:vi.fn(),markAllRead:vi.fn(),
}}));
function view() {
    const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});
    return render(<QueryClientProvider client={client}><NotificationInboxView /></QueryClientProvider>);
}
describe("notification inbox",()=>{
    beforeEach(()=>{
        vi.clearAllMocks();
        vi.mocked(notificationService.getPreferences).mockResolvedValue({success:true,data:{
            emailEnabled:true,workflowEmail:true,reminderEmail:true,announcementEmail:false,systemEmail:true,emailServiceEnabled:false,
        }});
        vi.mocked(notificationService.getPage).mockResolvedValue({success:true,data:{items:[{
            id:"notice-1",notificationType:"APPLICATION_STATUS_CHANGED",title:"Hồ sơ được duyệt",message:"Xem cập nhật hồ sơ",
            isRead:false,createdAt:"2026-10-03T00:00:00Z",actionUrl:"/student/applications",deliveryStatus:{email:"QUEUED"},
        }],totalPages:2,totalElements:21,unreadCount:7}});
        vi.mocked(notificationService.markRead).mockResolvedValue({success:true,data:undefined} as never);
        vi.mocked(notificationService.savePreferences).mockResolvedValue({success:true,data:{
            emailEnabled:false,workflowEmail:true,reminderEmail:true,announcementEmail:false,systemEmail:true,emailServiceEnabled:false,
        }});
    });
    it("uses server count, pagination, and unread filter",async()=>{
        view(); await screen.findByText("Hồ sơ được duyệt");
        expect(screen.getByText("7 thông báo chưa đọc")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button",{name:"Trang sau"}));
        await waitFor(()=>expect(notificationService.getPage).toHaveBeenCalledWith(1,20,false));
        fireEvent.click(screen.getByRole("checkbox",{name:"Chỉ hiện chưa đọc"}));
        await waitFor(()=>expect(notificationService.getPage).toHaveBeenCalledWith(0,20,true));
        expect(screen.getByText(/Email đang chờ gửi/)).toBeInTheDocument();
    });
    it("marks read and saves email opt-out while delivery is disabled",async()=>{
        view(); await screen.findByText("Hồ sơ được duyệt");
        fireEvent.click(screen.getByRole("button",{name:"Đánh dấu đã đọc"}));
        await waitFor(()=>expect(notificationService.markRead).toHaveBeenCalledWith("notice-1",expect.anything()));
        expect(await screen.findByText(/Hệ thống chưa bật gửi email/)).toBeInTheDocument();
        fireEvent.click(screen.getByRole("checkbox",{name:"Nhận email thông báo"}));
        fireEvent.click(screen.getByRole("button",{name:"Lưu tùy chọn email"}));
        await waitFor(()=>expect(notificationService.savePreferences).toHaveBeenCalledWith(expect.objectContaining({emailEnabled:false}),expect.anything()));
        expect(await screen.findByRole("status")).toHaveTextContent("Đã lưu tùy chọn.");
    });
    it("shows API failure without fabricating notifications",async()=>{
        vi.mocked(notificationService.getPage).mockRejectedValue(new Error("Không tải được dữ liệu"));
        view();
        expect(await screen.findByRole("alert")).toHaveTextContent("Không tải được dữ liệu");
        expect(screen.queryByText("Hồ sơ được duyệt")).not.toBeInTheDocument();
    });
});
describe("notification role links",()=>{
    it.each([
        ["STUDENT","student"],["COMPANY_REP","company"],["COMPANY_MENTOR","mentor"],
        ["LECTURER","lecturer"],["FACULTY_ADMIN","faculty"],["ADMIN","admin"],
    ])("provides the correct inbox for %s",(role,portal)=>{
        expect(notificationInbox(role)).toBe("/"+portal+"/notifications");
    });
    it("rejects external links and another role portal",()=>{
        expect(notificationAction("//evil.example","STUDENT")).toBeNull();
        expect(notificationAction("https://evil.example","STUDENT")).toBeNull();
        expect(notificationAction("/faculty/job-approvals","STUDENT")).toBe("/student/dashboard");
        expect(notificationAction("/student/weekly-logs","STUDENT")).toBe("/student/daily-logs");
        expect(notificationAction("/placements/id","LECTURER")).toBe("/lecturer/supervision");
    });
});
