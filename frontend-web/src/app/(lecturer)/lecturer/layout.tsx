import { PortalLayout } from "@/components/layouts/portal-layout";

export default function LecturerLayout({ children }: { children: React.ReactNode }) {
    return <PortalLayout portalRole="LECTURER">{children}</PortalLayout>;
}
