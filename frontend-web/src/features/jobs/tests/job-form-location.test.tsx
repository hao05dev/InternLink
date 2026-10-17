import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { JobLocationSection } from "../components/company/form/job-location-section";
import { emptyJobForm, jobFormPayload } from "../utils/job-form-mapper";
import { validateJobForm } from "../utils/job-form-schema";

describe("job workplace", () => {
  it("keeps separate location available and allows opting into company office", () => {
    const change = vi.fn();
    render(<JobLocationSection values={emptyJobForm()} company={{ id: "c", companyName: "Acme", officeAddress: "Office A", verificationStatus: "VERIFIED" }} onChange={change} />);
    expect(screen.getByLabelText(/Địa điểm làm việc cụ thể/)).toHaveValue("");
    fireEvent.click(screen.getByRole("checkbox"));
    expect(change).toHaveBeenCalledWith("useCompanyLocation", true);
  });
  it("does not require office information for remote jobs", () => {
    const values = { ...emptyJobForm(), workFormat: "REMOTE" as const, title: "Intern", description: "Work", selectedDeptId: "d", selectedTermId: "t" };
    expect(validateJobForm(values)).toBeNull();
    expect(jobFormPayload({ ...values, useCompanyLocation: true }, "c").useCompanyLocation).toBe(false);
    render(<JobLocationSection values={values} company={null} onChange={vi.fn()} />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Bản đồ Google Maps/)).not.toBeInTheDocument();
  });
});
