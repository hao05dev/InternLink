export function notificationHome(role?: string): string {
    const portals: Record<string,string> = { STUDENT:"student",COMPANY_REP:"company",COMPANY_MENTOR:"mentor",
        LECTURER:"lecturer",FACULTY_ADMIN:"faculty",ADMIN:"admin",BLOG_MANAGER:"blog-manager" };
    return role && portals[role] ? "/" + portals[role] + (role === "BLOG_MANAGER" ? "/posts" : "/dashboard") : "/";
}
export function notificationInbox(role?: string): string { return role === "BLOG_MANAGER" ? "/blog-manager/notifications" : notificationHome(role).replace(/dashboard$/, "notifications"); }
export function notificationAction(url?: string, role?: string, type?: string): string | null {
    if (url && /^\/(?!\/)/.test(url) && !/[\\\r\n]/.test(url)) {
        if (url.startsWith("/agreements/")) return role === "STUDENT" ? "/student/learning-agreement" : notificationHome(role);
        if (url.startsWith("/final-results/placement/")) return role === "STUDENT" ? "/student/final-report" : notificationHome(role);
        if (url.startsWith("/placements/")) {
            const paths: Record<string,string> = { STUDENT:"/student/internship-record",LECTURER:"/lecturer/supervision",
                COMPANY_MENTOR:"/mentor/internship-record",COMPANY_REP:"/company/interns",FACULTY_ADMIN:"/faculty/internship-management",BLOG_MANAGER:"/blog-manager/posts" };
            return paths[role ?? ""] ?? notificationHome(role);
        }
        if (url === "/student/weekly-logs") return role === "STUDENT" ? "/student/daily-logs" : notificationHome(role);
        const portal = notificationHome(role).split("/")[1];
        if (/^\/(student|company|mentor|lecturer|faculty|admin|blog-manager)(\/|$)/.test(url) && url.split("/")[1] !== portal)
            return notificationHome(role);
        return url;
    }
    if (!type || !role) return null;
    if (role === "STUDENT") {
        if (type.startsWith("LOGBOOK_")) return "/student/daily-logs";
        if (type.startsWith("APPLICATION_") || type.startsWith("STUDENT_FOUND_") || type.startsWith("OFFER_")) return "/student/applications";
        if (type === "NEW_JOB_POSTED") return "/jobs";
        if (type === "FINAL_RESULT_PUBLISHED") return "/student/final-report";
    }
    if (role === "LECTURER") return "/lecturer/supervision";
    if (role === "COMPANY_MENTOR") return "/mentor/weekly-evaluations";
    if (role === "COMPANY_REP") return type.startsWith("JOB_") ? "/company/jobs" : "/company/candidates";
    if (role === "FACULTY_ADMIN") return type.startsWith("JOB_") ? "/faculty/job-approvals" : "/faculty/dashboard";
    if (role === "BLOG_MANAGER") return "/blog-manager/posts";
    return notificationHome(role);
}
