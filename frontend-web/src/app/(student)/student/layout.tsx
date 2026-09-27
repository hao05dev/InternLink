import { PortalLayout } from "@/components/layouts/portal-layout";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return <PortalLayout portalRole="STUDENT">{children}</PortalLayout>;
}
