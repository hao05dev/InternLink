"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

export interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: React.ReactNode;
    keyExtractor: (item: T) => string;
    className?: string;
}

export function DataTable<T>({
    columns,
    data,
    isLoading = false,
    emptyTitle = "Chưa có dữ liệu",
    emptyDescription = "Hiện tại chưa có bản ghi nào để hiển thị trong mục này.",
    emptyAction,
    keyExtractor,
    className,
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="w-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                <div className="p-4 space-y-3">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <EmptyState
                title={emptyTitle}
                description={emptyDescription}
                action={emptyAction}
                className={className}
            />
        );
    }

    return (
        <div className={cn("w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs", className)}>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/75">
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    scope="col"
                                    className={cn(
                                        "px-4 py-3.5 font-bold uppercase tracking-wider text-slate-600 text-[11px]",
                                        col.className
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((item) => (
                            <tr
                                key={keyExtractor(item)}
                                className="hover:bg-slate-50/60 transition-colors"
                            >
                                {columns.map((col, colIdx) => (
                                    <td
                                        key={colIdx}
                                        className={cn(
                                            "px-4 py-3.5 text-slate-700 align-middle",
                                            col.className
                                        )}
                                    >
                                        {col.cell
                                            ? col.cell(item)
                                            : col.accessorKey
                                            ? String(item[col.accessorKey] ?? "")
                                            : null}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
