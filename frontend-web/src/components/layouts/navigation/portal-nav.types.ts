import type React from "react";
export interface SubNavItem {
  label: string;
  href: string;
}

export interface NavCategoryItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: SubNavItem[];
}

export interface NavGroup {
  groupTitle?: string;
  categories: NavCategoryItem[];
}

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface PortalRoleConfig {
  title: string;
  subtitle: string;
  homeItem: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  groups: NavGroup[];
}

