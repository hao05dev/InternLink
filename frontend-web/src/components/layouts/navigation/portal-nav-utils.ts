import type { PortalRoleConfig } from "./portal-nav.types";
export function getFlattenedNavLinks(config: PortalRoleConfig): Array<{ label: string; href: string }> {
  return [
    config.homeItem,
    ...config.groups.flatMap((g) =>
      g.categories.flatMap((cat) =>
        cat.children && cat.children.length > 0
          ? cat.children
          : cat.href
          ? [{ label: cat.label, href: cat.href }]
          : []
      )
    ),
  ];
}
