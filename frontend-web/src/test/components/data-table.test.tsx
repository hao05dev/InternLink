import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataTable } from "@/components/ui/data-table";

interface SampleItem {
    id: string;
    title: string;
    vacancies: number;
}

describe("DataTable Component", () => {
    const columns = [
        { header: "Vị trí", accessorKey: "title" as const },
        { header: "Chỉ tiêu", accessorKey: "vacancies" as const },
    ];

    it("renders empty state when data is empty", () => {
        render(
            <DataTable<SampleItem>
                columns={columns}
                data={[]}
                emptyTitle="Chưa có tin tuyển dụng"
                keyExtractor={(item) => item.id}
            />
        );

        expect(screen.getByText("Chưa có tin tuyển dụng")).toBeInTheDocument();
    });

    it("renders table rows when data is provided", () => {
        const sampleData: SampleItem[] = [
            { id: "1", title: "Thực tập sinh Java", vacancies: 3 },
            { id: "2", title: "Thực tập sinh Frontend", vacancies: 2 },
        ];

        render(
            <DataTable<SampleItem>
                columns={columns}
                data={sampleData}
                keyExtractor={(item) => item.id}
            />
        );

        expect(screen.getByText("Thực tập sinh Java")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("Thực tập sinh Frontend")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
    });
});
