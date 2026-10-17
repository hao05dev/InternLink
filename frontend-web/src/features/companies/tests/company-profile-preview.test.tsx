import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompanyProfilePreviewModal } from "../components/modals/company-profile-preview-modal";
import { companyService } from "../services/company.service";

vi.mock("../services/company.service", () => ({ companyService: { saveProfile: vi.fn(), getPublic: vi.fn() } }));

it("renders unsaved content using public sections without publishing it", () => {
  render(<CompanyProfilePreviewModal company={{ id: "c", companyName: "Acme", description: "Unsaved introduction", verificationStatus: "PENDING" }} onClose={vi.fn()} />);
  expect(screen.getByText("Unsaved introduction")).toBeInTheDocument();
  expect(screen.queryByText("Doanh nghiệp đã xác minh")).not.toBeInTheDocument();
  expect(companyService.saveProfile).not.toHaveBeenCalled();
  expect(companyService.getPublic).not.toHaveBeenCalled();
});
