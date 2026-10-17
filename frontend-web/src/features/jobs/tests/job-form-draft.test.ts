import { it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useJobFormDraft } from "../hooks/use-job-form-draft";
import { emptyJobForm } from "../utils/job-form-mapper";

beforeEach(() => localStorage.clear());

it("restores location only after metadata initialization and scopes it by company", async () => {
  localStorage.setItem("internlink_job_draft_a", JSON.stringify({ title: "Draft A", location: "Office", useCompanyLocation: true, mapEmbedUrl: "https://www.google.com/maps/embed?pb=x" }));
  const restore = vi.fn();
  const { rerender } = renderHook(({ loading, companyId }) => useJobFormDraft({ mode: "create", companyId,
    isLoading: loading, isSubmitting: false, values: emptyJobForm(), onRestore: restore, onResetToDefault: vi.fn() }),
  { initialProps: { loading: true, companyId: "a" } });
  expect(restore).not.toHaveBeenCalled();
  rerender({ loading: false, companyId: "a" });
  await waitFor(() => expect(restore).toHaveBeenCalledWith(expect.objectContaining({ title: "Draft A", useCompanyLocation: true })));
  rerender({ loading: false, companyId: "b" });
  expect(restore).toHaveBeenCalledTimes(1);
});

it("removes a successfully saved draft", () => {
  localStorage.setItem("internlink_job_draft_a", JSON.stringify({ title: "Draft" }));
  const { result } = renderHook(() => useJobFormDraft({ mode: "create", companyId: "a", isLoading: false,
    isSubmitting: false, values: emptyJobForm(), onRestore: vi.fn(), onResetToDefault: vi.fn() }));
  act(() => result.current.removeDraftOnSuccess());
  expect(localStorage.getItem("internlink_job_draft_a")).toBeNull();
});
