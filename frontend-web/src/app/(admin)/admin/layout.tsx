import { PortalLayout } from "@/components/layouts/portal-layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <PortalLayout portalRole="ADMIN">{children}</PortalLayout>;
}
