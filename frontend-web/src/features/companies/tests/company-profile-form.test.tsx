import { describe, it, expect, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCompanyProfileForm } from "../hooks/use-company-profile-form";
import { companyProfileSchema } from "../utils/company-profile-schema";
import { profileValues } from "../utils/company-profile-mapper";
import type { PublicCompany } from "../types/public-company.types";

const company: PublicCompany = { id: "c1", companyName: "Acme", verificationStatus: "VERIFIED", description: "Original" };

describe("company profile editing", () => {
  it("keeps edits on save failure, resets explicitly and never autosaves", async () => {
    const save = vi.fn().mockRejectedValue(new Error("Không lưu được"));
    const { result } = renderHook(() => useCompanyProfileForm(company, save));
    act(() => result.current.change("description", "Edited"));
    expect(save).not.toHaveBeenCalled();
    await act(async () => result.current.submit());
    expect(result.current.values.description).toBe("Edited");
    expect(result.current.error).toBe("Không lưu được");
    act(() => result.current.reset());
    expect(result.current.values.description).toBe("Original");
  });
  it("blocks save while uploads are in flight and uses saved response as baseline", async () => {
    const save = vi.fn().mockResolvedValue({ ...company, description: "Saved" });
    const { result } = renderHook(() => useCompanyProfileForm(company, save));
    act(() => { result.current.change("description", "Changed"); result.current.uploadState(true); });
    await act(async () => result.current.submit());
    expect(save).not.toHaveBeenCalled();
    act(() => result.current.uploadState(false));
    await act(async () => result.current.submit());
    await waitFor(() => expect(result.current.saved).toBe(true));
    expect(result.current.values.description).toBe("Saved");
    expect(result.current.dirty).toBe(false);
  });
  it("validates maps and normalizes website without sending legal fields", () => {
    const values = profileValues(company);
    expect(companyProfileSchema.safeParse({ ...values, mapsUrl: "https://maps.app.goo.gl/x" }).success).toBe(false);
    expect(companyProfileSchema.parse({ ...values, website: "example.com" }).website).toBe("https://example.com/");
    expect(values).not.toHaveProperty("verificationStatus");
  });
});
