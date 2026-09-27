import { PortalLayout } from "@/components/layouts/portal-layout";

export default function MentorLayout({ children }: { children: React.ReactNode }) {
    return <PortalLayout portalRole="COMPANY_MENTOR">{children}</PortalLayout>;
}
