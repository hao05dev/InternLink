import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useJobFormSubmit } from "../hooks/use-job-form-submit";
import { emptyJobForm } from "../utils/job-form-mapper";
import { jobService } from "../services/job.service";

vi.mock("../services/job.service", () => ({ jobService: { createJob: vi.fn(), updateJob: vi.fn(), submitJob: vi.fn() } }));

describe("save and submit job", () => {
  beforeEach(() => vi.clearAllMocks());
  it("reuses the created id when review submission fails", async () => {
    vi.mocked(jobService.createJob).mockResolvedValue({ id: "saved" } as Awaited<ReturnType<typeof jobService.createJob>>);
    vi.mocked(jobService.submitJob).mockRejectedValueOnce(new Error("Try again")).mockResolvedValueOnce({ id: "saved" } as Awaited<ReturnType<typeof jobService.submitJob>>);
    const onSuccess = vi.fn();
    const values = { ...emptyJobForm(), title: "Intern", description: "Work", location: "CT", selectedDeptId: "d", selectedTermId: "t" };
    const { result } = renderHook(() => useJobFormSubmit({ companyId: "c", values, blocked: false, onSuccess }));
    await act(async () => result.current.save(true));
    expect(result.current.error).toBe("Try again");
    expect(onSuccess).not.toHaveBeenCalled();
    await act(async () => result.current.save(true));
    expect(jobService.createJob).toHaveBeenCalledTimes(1);
    expect(jobService.updateJob).toHaveBeenCalledWith("saved", expect.objectContaining({ title: "Intern" }));
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
