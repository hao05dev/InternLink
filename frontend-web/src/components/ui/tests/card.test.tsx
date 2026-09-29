import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

describe("Card Component", () => {
    it("renders card subcomponents properly", () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Thực tập sinh Java</CardTitle>
                    <CardDescription>FPT Software Cần Thơ</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Mô tả chi tiết công việc.</p>
                </CardContent>
                <CardFooter>
                    <span>Hạn nộp: 30/11/2026</span>
                </CardFooter>
            </Card>
        );

        expect(screen.getByText("Thực tập sinh Java")).toBeInTheDocument();
        expect(screen.getByText("FPT Software Cần Thơ")).toBeInTheDocument();
        expect(screen.getByText("Mô tả chi tiết công việc.")).toBeInTheDocument();
        expect(screen.getByText("Hạn nộp: 30/11/2026")).toBeInTheDocument();
    });
});
