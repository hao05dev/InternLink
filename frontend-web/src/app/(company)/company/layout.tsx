import { PortalLayout } from "@/components/layouts/portal-layout";

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
    return <PortalLayout portalRole="COMPANY_REP">{children}</PortalLayout>;
}
