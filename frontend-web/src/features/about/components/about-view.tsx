"use client";

import React from "react";
import { PublicShell } from "@/components/layouts/public-shell";
import { AboutHero } from "./about-hero";
import { AboutStats } from "./about-stats";
import { AboutMission } from "./about-mission";
import { AboutDepartments } from "./about-departments";
import { AboutInternshipEcosystem } from "./about-internship-ecosystem";
import { AboutPartners } from "./about-partners";
import { AboutContactInfo } from "./about-contact-info";

export default function AboutView() {
  return (
    <PublicShell>
      <div className="bg-white">
        <AboutHero />
        <AboutStats />
        <AboutMission />
        <AboutDepartments />
        <AboutInternshipEcosystem />
        <AboutPartners />
        <AboutContactInfo />
      </div>
    </PublicShell>
  );
}
