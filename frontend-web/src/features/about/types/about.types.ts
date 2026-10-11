import { LucideIcon } from "lucide-react";

export interface StatItem {
  value: string;
  label: string;
  description: string;
  iconName: string;
}

export interface MissionPillar {
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  iconName: string;
}

export interface DepartmentItem {
  id: string;
  name: string;
  englishName: string;
  shortCode: string;
  iconName: string;
  description: string;
  majors: string[];
  targetRoles: string[];
  studentCount: string;
}

export interface EcosystemPillar {
  role: string;
  title: string;
  description: string;
  responsibilities: string[];
  badge: string;
}

export interface EcosystemStep {
  step: number;
  title: string;
  subtitle: string;
  description: string;
}

export interface PartnerActivity {
  title: string;
  description: string;
  frequency: string;
  iconName: string;
  badge: string;
}

export interface EnterprisePartner {
  name: string;
  field: string;
  tier: "Chiến lược" | "Đối tác chính";
}
