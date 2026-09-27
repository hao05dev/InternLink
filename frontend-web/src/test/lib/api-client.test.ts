import { describe, it, expect } from "vitest";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

describe("Utility & API Client Tests", () => {
    describe("cn() utility", () => {
        it("merges classes correctly", () => {
            const result = cn("px-4 py-2", "bg-blue-500", { "text-white": true, "opacity-50": false });
            expect(result).toBe("px-4 py-2 bg-blue-500 text-white");
        });

        it("resolves Tailwind conflicts in favor of latter classes", () => {
            const result = cn("p-4", "p-6");
            expect(result).toBe("p-6");
        });
    });

    describe("ApiError class", () => {
        it("constructs error with status and message correctly", () => {
            const error = new ApiError("Không tìm thấy tài nguyên", 404);
            expect(error.status).toBe(404);
            expect(error.message).toBe("Không tìm thấy tài nguyên");
            expect(error.name).toBe("ApiError");
        });

        it("holds error payload data when present", () => {
            const errors = [{ field: "stipendAmount", message: "Không được âm" }];
            const error = new ApiError("Validation failed", 400, errors);
            expect(error.status).toBe(400);
            expect(error.errors).toEqual(errors);
        });
    });
});
