import { PortalLayout } from "@/components/layouts/portal-layout";

export default function BlogManagerLayout({ children }: { children: React.ReactNode }) {
    return <PortalLayout portalRole="BLOG_MANAGER">{children}</PortalLayout>;
}
