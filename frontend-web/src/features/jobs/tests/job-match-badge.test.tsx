import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { JobMatchBadge } from "../components/cards/job-match-badge";
import { JobMatchExplanationCard } from "../components/detail/job-match-explanation-card";
import { JobPosition } from "../types/job.types";

describe("JobMatchBadge", () => {
    it("returns null when no match score or label provided", () => {
        const { container } = render(<JobMatchBadge />);
        expect(container.firstChild).toBeNull();
    });

    it("renders compact badge with score and label", () => {
        render(
            <JobMatchBadge
                matchScore={85}
                scoreLabel="Cao"
                scoreFormatted="85/100"
                compact={true}
            />
        );
        expect(screen.getByText("Khớp: 85/100 · Cao")).toBeDefined();
    });

    it("renders full badge with breakdown and eligibility status", () => {
        render(
            <JobMatchBadge
                matchScore={75}
                scoreLabel="Cao"
                scoreFormatted="75/100"
                mandatoryScore={0.8}
                optionalScore={0.5}
                eligibilityStatus="ELIGIBLE"
                compact={false}
            />
        );
        expect(screen.getByText("Điểm phù hợp: 75/100 · Cao")).toBeDefined();
        expect(screen.getByText("Đủ điều kiện")).toBeDefined();
        expect(screen.getByText("80%")).toBeDefined();
        expect(screen.getByText("50%")).toBeDefined();
    });
});

describe("JobMatchExplanationCard", () => {
    const mockJob: JobPosition = {
        id: "job-1",
        companyId: "c-1",
        companyName: "FPT Software",
        termId: "t-1",
        title: "Frontend React Developer",
        workFormat: "ONSITE",
        location: "Hồ Chí Minh",
        vacancies: 3,
        description: "Phát triển UI",
        status: "APPROVED",
        matchScore: 80,
        scoreLabel: "Cao",
        scoreFormatted: "80/100",
        mandatoryScore: 1.0,
        optionalScore: 0.5,
        eligibilityStatus: "ELIGIBLE",
        eligibilityReason: "Sinh viên đủ điều kiện thực tập",
        matchedSkills: ["React", "TypeScript"],
        missingSkills: ["GraphQL"],
    };

    it("renders match explanation with 4-part details and disclaimer", () => {
        render(<JobMatchExplanationCard job={mockJob} />);
        expect(screen.getByText("Đánh giá mức độ phù hợp hồ sơ")).toBeDefined();
        expect(screen.getByText("Điểm phù hợp: 80/100 · Cao")).toBeDefined();
        expect(screen.getByText("Đủ điều kiện đăng ký vị trí:")).toBeDefined();
        expect(screen.getByText("React, TypeScript")).toBeDefined();
        expect(screen.getByText("GraphQL")).toBeDefined();
        expect(screen.getByText(/Điểm số mang tính định hướng học tập/)).toBeDefined();
    });

    it("returns null when job has no match score and no score label", () => {
        const emptyJob = { ...mockJob, matchScore: undefined, scoreLabel: undefined };
        const { container } = render(<JobMatchExplanationCard job={emptyJob} />);
        expect(container.firstChild).toBeNull();
    });
});
