import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { JobDetailActionBar } from "../components/detail/job-detail-action-bar";
import { JobPosition } from "../types/job.types";

const mockJob: JobPosition = {
  description: "Mô tả vị trí",
  id: "job-123",
  title: "Frontend React Intern",
  companyId: "company-999",
  companyName: "FPT Software",
  departmentId: "dept-1",
  termId: "term-1",
  location: "Cần Thơ",
  vacancies: 3,
  workFormat: "HYBRID",
  status: "APPROVED",
};

describe("JobDetailActionBar", () => {
  it("renders 'Ứng tuyển ngay' and redirects to login when not authenticated", () => {
    const handleRedirectLogin = vi.fn();
    const handleOpenModal = vi.fn();

    render(
      <JobDetailActionBar
        job={mockJob}
        isAuthenticated={false}
        isApplied={false}
        onOpenApplyModal={handleOpenModal}
        onRedirectLogin={handleRedirectLogin}
      />
    );

    const applyBtn = screen.getByRole("button", { name: /ứng tuyển ngay/i });
    expect(applyBtn).toBeInTheDocument();

    fireEvent.click(applyBtn);
    expect(handleRedirectLogin).toHaveBeenCalledTimes(1);
    expect(handleOpenModal).not.toHaveBeenCalled();
  });

  it("opens apply modal when clicked by an authenticated STUDENT who has not applied", () => {
    const handleRedirectLogin = vi.fn();
    const handleOpenModal = vi.fn();

    render(
      <JobDetailActionBar
        job={mockJob}
        isAuthenticated={true}
        userRole="STUDENT"
        isApplied={false}
        onOpenApplyModal={handleOpenModal}
        onRedirectLogin={handleRedirectLogin}
      />
    );

    const applyBtn = screen.getByRole("button", { name: /ứng tuyển ngay/i });
    fireEvent.click(applyBtn);
    expect(handleOpenModal).toHaveBeenCalledTimes(1);
  });

  it("renders success notice when authenticated STUDENT has already applied", () => {
    render(
      <JobDetailActionBar
        job={mockJob}
        isAuthenticated={true}
        userRole="STUDENT"
        isApplied={true}
        onOpenApplyModal={vi.fn()}
        onRedirectLogin={vi.fn()}
      />
    );

    expect(
      screen.getByText(/bạn đã nộp hồ sơ ứng tuyển vị trí này thành công/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ứng tuyển ngay/i })).not.toBeInTheDocument();
  });

  it("hides apply button and shows notice for COMPANY_REP from another company", () => {
    render(
      <JobDetailActionBar
        job={mockJob}
        isAuthenticated={true}
        userRole="COMPANY_REP"
        userCompanyId="different-company"
        isApplied={false}
        onOpenApplyModal={vi.fn()}
        onRedirectLogin={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /ứng tuyển ngay/i })).not.toBeInTheDocument();
    expect(
      screen.getByText(/bạn đang xem tin tuyển dụng với tư cách/i)
    ).toBeInTheDocument();
  });

  it("renders manage candidates shortcut for COMPANY_REP of the hiring company", () => {
    render(
      <JobDetailActionBar
        job={mockJob}
        isAuthenticated={true}
        userRole="COMPANY_REP"
        userCompanyId="company-999"
        isApplied={false}
        onOpenApplyModal={vi.fn()}
        onRedirectLogin={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /ứng tuyển ngay/i })).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /quản lý ứng viên vị trí này/i })
    ).toBeInTheDocument();
  });

  it("hides apply button and shows notice for LECTURER and ADMIN", () => {
    const { rerender } = render(
      <JobDetailActionBar
        job={mockJob}
        isAuthenticated={true}
        userRole="LECTURER"
        isApplied={false}
        onOpenApplyModal={vi.fn()}
        onRedirectLogin={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /ứng tuyển ngay/i })).not.toBeInTheDocument();
    expect(screen.getByText(/giảng viên/i)).toBeInTheDocument();

    rerender(
      <JobDetailActionBar
        job={mockJob}
        isAuthenticated={true}
        userRole="ADMIN"
        isApplied={false}
        onOpenApplyModal={vi.fn()}
        onRedirectLogin={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /ứng tuyển ngay/i })).not.toBeInTheDocument();
    expect(screen.getByText(/quản trị viên/i)).toBeInTheDocument();
  });
});
