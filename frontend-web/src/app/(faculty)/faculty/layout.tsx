import { PortalLayout } from "@/components/layouts/portal-layout";

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
    return <PortalLayout portalRole="FACULTY_ADMIN">{children}</PortalLayout>;
}
