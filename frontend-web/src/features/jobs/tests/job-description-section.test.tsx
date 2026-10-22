import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { JobDescriptionSection } from "../components/company/form/job-description-section";
import { jobService } from "../services/job.service";

vi.mock("../services/job.service", () => ({
  jobService: {
    getTaxonomySkills: vi.fn(),
  },
}));

vi.mock("@/components/ui/rich-editor", () => ({
  RichEditor: ({ value, onChange, placeholder }: any) => (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid="rich-editor-mock"
    />
  ),
}));

describe("JobDescriptionSection Component", () => {
  const onSkillsChange = vi.fn();
  const onDescriptionChange = vi.fn();
  const onBenefitsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(jobService.getTaxonomySkills).mockResolvedValue([
      { id: "SK-JAVA", skillName: "Java" },
      { id: "SK-SPRING-BOOT", skillName: "Spring Boot" },
      { id: "SK-REACT", skillName: "React" },
      { id: "SK-DOCKER", skillName: "Docker" },
    ]);
  });

  const waitForTaxonomy = async () => {
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /React/i })).toBeEnabled();
    });
  };

  it("renders existing skills as badges", async () => {
    render(
      <JobDescriptionSection
        companyId="comp-1"
        description="Mô tả"
        onDescriptionChange={onDescriptionChange}
        skillsText="Java, Spring Boot"
        onSkillsChange={onSkillsChange}
        benefitsText=""
        onBenefitsChange={onBenefitsChange}
      />
    );
    await waitForTaxonomy();

    expect(screen.getAllByText("Java").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTitle("Xóa Java")).toBeInTheDocument();
    expect(screen.getByTitle("Xóa Spring Boot")).toBeInTheDocument();
    expect(screen.getByText(/2 kỹ năng đã chọn/i)).toBeInTheDocument();
  });

  it("adds popular skill when clicking quick pick button", async () => {
    render(
      <JobDescriptionSection
        companyId="comp-1"
        description="Mô tả"
        onDescriptionChange={onDescriptionChange}
        skillsText="Java"
        onSkillsChange={onSkillsChange}
        benefitsText=""
        onBenefitsChange={onBenefitsChange}
      />
    );
    await waitForTaxonomy();

    const reactButton = screen.getByRole("button", { name: /React/i });
    fireEvent.click(reactButton);

    expect(onSkillsChange).toHaveBeenCalledWith("Java, React");
  });

  it("adds skill via keyboard Enter", async () => {
    render(
      <JobDescriptionSection
        companyId="comp-1"
        description="Mô tả"
        onDescriptionChange={onDescriptionChange}
        skillsText="Java"
        onSkillsChange={onSkillsChange}
        benefitsText=""
        onBenefitsChange={onBenefitsChange}
      />
    );
    await waitForTaxonomy();

    const input = screen.getByPlaceholderText(/Tìm kỹ năng đã được duyệt/i);
    fireEvent.change(input, { target: { value: "Docker" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSkillsChange).toHaveBeenCalledWith("Java, Docker");
  });

  it("removes skill when clicking remove button", async () => {
    render(
      <JobDescriptionSection
        companyId="comp-1"
        description="Mô tả"
        onDescriptionChange={onDescriptionChange}
        skillsText="Java, Spring Boot"
        onSkillsChange={onSkillsChange}
        benefitsText=""
        onBenefitsChange={onBenefitsChange}
      />
    );
    await waitForTaxonomy();

    const removeBtn = screen.getByTitle("Xóa Java");
    fireEvent.click(removeBtn);

    expect(onSkillsChange).toHaveBeenCalledWith("Spring Boot");
  });
});
