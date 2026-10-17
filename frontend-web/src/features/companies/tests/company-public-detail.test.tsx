import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompanyPublicDetailView } from "../components/company-public-detail-view";
import { usePublicCompany } from "../hooks/use-public-company";

vi.mock("@/components/layouts/public-shell", () => ({ PublicShell: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("../hooks/use-public-company", () => ({ usePublicCompany: vi.fn() }));
vi.mock("@/features/jobs/hooks/use-company-public-jobs", () => ({ useCompanyPublicJobs: () => ({ jobs: [], loading: false, error: "", retry: vi.fn() }) }));

it("shows a public profile with introduction, directions and a truthful empty jobs state", () => {
  vi.mocked(usePublicCompany).mockReturnValue({ company: { id: "c", companyName: "Acme", verificationStatus: "VERIFIED", description: "Learn with our team", officeAddress: "Cần Thơ" }, loading: false, error: "", notFound: false, retry: vi.fn() });
  render(<CompanyPublicDetailView id="c" />);
  expect(screen.getByRole("heading", { name: "Acme" })).toBeInTheDocument();
  expect(screen.getByText("Learn with our team")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Chỉ đường" })).toBeInTheDocument();
  expect(screen.getByText("Chưa có vị trí đang tuyển")).toBeInTheDocument();
});

it("does not present an unverified company as public", () => {
  vi.mocked(usePublicCompany).mockReturnValue({ company: null, loading: false, error: "404", notFound: true, retry: vi.fn() });
  render(<CompanyPublicDetailView id="private" />);
  expect(screen.getByText("Hồ sơ doanh nghiệp chưa được công khai")).toBeInTheDocument();
  expect(screen.queryByText("Doanh nghiệp đã xác minh")).not.toBeInTheDocument();
});
